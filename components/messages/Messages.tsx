
import React, { useState, useEffect, useCallback, useRef } from "react";
import { User, PublicUser, Message, Vehicle, ManagedSaleRequest, Notification } from "@/entities/all";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns"; // Import format from date-fns
import {
  MessageCircle,
  Search,
  LogIn,
  Loader2,
  ArrowLeft
} from "lucide-react";

import { createPageUrl } from "@/utils";

import ConversationList from "../components/messages/ConversationList";
import ChatInterface from "../components/messages/ChatInterface";
import TestDriveModal from "../components/messages/TestDriveModal";
import { useToast } from "@/components/ui/use-toast";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserPublic, setCurrentUserPublic] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [managedSaleRequests, setManagedSaleRequests] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTestDriveModal, setShowTestDriveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPollingPaused, setIsPollingPaused] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  const { toast } = useToast();

  const POLLING_RATE = 300000;
  const pollIntervalRef = useRef(null);
  const loadMessagingDataRef = useRef(null);

  const markConversationAsRead = useCallback(async (conversation) => {
    if (!currentUserPublic?.user_id || !conversation.messages) return;

    try {
      const unreadMessages = conversation.messages.filter(msg =>
        msg.recipient_id === currentUserPublic.user_id && !msg.read
      );

      if (unreadMessages.length === 0) return;

      const updatePromises = unreadMessages.map(msg =>
        Message.update(msg.id, { read: true })
      );

      await Promise.all(updatePromises);

      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === conversation.id
            ? {
                ...conv,
                unreadCount: 0,
                messages: conv.messages.map(msg =>
                  unreadMessages.some(unreadMsg => unreadMsg.id === msg.id) ? { ...msg, read: true } : msg
                )
              }
            : conv
        )
      );

      if (selectedConversation?.id === conversation.id) {
        setCurrentMessages(prev => prev.map(msg =>
          unreadMessages.some(unreadMsg => unreadMsg.id === msg.id) ? { ...msg, read: true } : msg
        ));
      }

    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      toast({
        title: "Failed to update read status",
        description: "There was an error marking messages as read.",
        variant: "destructive",
      });
    }
  }, [currentUserPublic, selectedConversation, toast]);

  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
    setCurrentMessages(conversation.messages || []);

    setConversations(prevConvos => {
      return prevConvos.map(c => {
        if (c.id === conversation.id) {
          const updatedMessages = c.messages.map(m =>
            m.recipient_id === currentUserPublic?.user_id ? { ...m, read: true } : m
          );
          return { ...c, unreadCount: 0, messages: updatedMessages };
        }
        return c;
      });
    });

    if (conversation.unreadCount > 0 && currentUserPublic?.user_id) {
      markConversationAsRead(conversation);
    }
  }, [currentUserPublic, markConversationAsRead]);

  const groupMessagesIntoConversations = useCallback((allMessages, userPublicId) => {
    const conversationMap = new Map();

    const userMessages = allMessages.filter(msg =>
      msg.sender_id === userPublicId || msg.recipient_id === userPublicId
    );

    console.log("Grouping messages for user:", userPublicId);
    console.log("User messages to process:", userMessages.length);

    userMessages.forEach(message => {
      const otherUserId = message.sender_id === userPublicId ? message.recipient_id : message.sender_id;
      
      // ✅ FIX: Create consistent conversation keys
      let conversationKey;
      const sortedUserIds = [userPublicId, otherUserId].sort().join('_');

      if (message.managed_sale_request_id) {
        conversationKey = `msr_${message.managed_sale_request_id}_${sortedUserIds}`;
      } else {
        conversationKey = `vehicle_${message.vehicle_id}_${sortedUserIds}`;
      }

      console.log(`📝 Generated conversation key for message ${message.id}: "${conversationKey}"`);

      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          id: conversationKey,
          conversationId: conversationKey,
          otherUserId,
          vehicleId: message.vehicle_id,
          managedSaleRequestId: message.managed_sale_request_id,
          messages: [],
          lastMessage: null,
          unreadCount: 0,
        });
      }

      const conversation = conversationMap.get(conversationKey);
      conversation.messages.push(message);

      if (!conversation.lastMessage || new Date(message.created_date) > new Date(conversation.lastMessage.created_date)) {
        conversation.lastMessage = message;
      }

      if (!message.read && message.recipient_id === userPublicId) {
        conversation.unreadCount++;
      }
    });

    const groupedConversations = Array.from(conversationMap.values())
      .sort((a, b) => {
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;
        return new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date);
      });

    console.log("Final grouped conversations:", groupedConversations.length);
    console.log("Conversation IDs:", groupedConversations.map(c => c.id));

    return groupedConversations;
  }, []);

  const loadMessagingData = useCallback(async (retainSelection = false) => {
    setIsLoading(true); // Always set loading at the start of a full refresh

    try {
      const user = await User.me();
      setCurrentUser(user);

      console.log("📥 Current user from User.me():", { id: user.id, email: user.email });

      let userPublicProfile = null;
      if (user) {
        const publicProfiles = await PublicUser.filter({ user_id: user.id });
        if (publicProfiles.length > 0) {
          userPublicProfile = publicProfiles[0];
          setCurrentUserPublic(userPublicProfile);
          console.log("📥 Current user public profile:", { user_id: userPublicProfile.user_id });
        } else {
          console.warn("Public profile not found for user:", user.id, ". Attempting to create one.");
          const newProfile = await PublicUser.create({
            user_id: user.id,
            full_name: user.full_name || "User",
            profile_image: user.profile_image,
            user_type: user.user_type || "guest",
            verified: user.verified || false,
            bio: user.bio || "",
            location: user.location || "",
            role: user.role || 'user',
            email: user.email || ""
          });
          userPublicProfile = newProfile;
          setCurrentUserPublic(newProfile);
          console.log("✅ Created new public profile for user:", newProfile.user_id);
        }
      }

      if (!userPublicProfile) {
        console.warn("No public user profile available. Cannot load messages.");
        return; // Exit early if no public profile
      }

      const userPublicId = userPublicProfile.user_id;

      // Add a small delay to ensure message is committed to database
      await new Promise(resolve => setTimeout(resolve, 500));

      const fetchedMessages = await Message.list("-created_date", 1000);
      console.log("📥 Fetched messages (all, no filter):", fetchedMessages.length);
      
      // Log the first 5 messages with full details
      if (fetchedMessages.length > 0) {
        console.log("📥 Sample messages (first 5):");
        fetchedMessages.slice(0, 5).forEach((msg, index) => {
          console.log(`  Message ${index + 1}:`, {
            id: msg.id,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id,
            content: msg.content?.substring(0, 30) + "...",
            created_by_id: msg.created_by_id,
            vehicle_id: msg.vehicle_id,
            conversation_id: msg.conversation_id
          });
        });
        
        console.log("📥 Expected user ID:", userPublicId);
        console.log("📥 Checking if any message matches user ID...");
        
        const matchingSender = fetchedMessages.filter(msg => msg.sender_id === userPublicId);
        const matchingRecipient = fetchedMessages.filter(msg => msg.recipient_id === userPublicId);
        
        console.log("📥 Messages where I'm the sender:", matchingSender.length);
        console.log("📥 Messages where I'm the recipient:", matchingRecipient.length);
      }

      // Now filter client-side based on the current user's ID
      const filteredMessages = fetchedMessages.filter(msg =>
        msg.sender_id === userPublicId || msg.recipient_id === userPublicId
      );
      console.log("📥 Messages after client-side filtering:", filteredMessages.length);

      if (filteredMessages.length === 0 && fetchedMessages.length > 0) {
        console.error("⚠️ NO MESSAGES MATCH FILTER - Checking user ID consistency:");
        console.error("  - User ID from User.me():", user.id);
        console.error("  - User ID from PublicUser:", userPublicId);
        console.error("  - Are they the same?", user.id === userPublicId);
        
        console.error("⚠️ Sample message sender_id:", fetchedMessages[0]?.sender_id);
        console.error("⚠️ Sample message recipient_id:", fetchedMessages[0]?.recipient_id);
        console.error("⚠️ Does sender_id match?", fetchedMessages[0]?.sender_id === userPublicId);
        console.error("⚠️ Does recipient_id match?", fetchedMessages[0]?.recipient_id === userPublicId);
      }

      setMessages(filteredMessages);

      await new Promise(resolve => setTimeout(resolve, 50));
      const allUsers = await PublicUser.list();
      setUsers(allUsers);

      await new Promise(resolve => setTimeout(resolve, 50));
      const allVehicles = await Vehicle.list();
      setVehicles(allVehicles);

      await new Promise(resolve => setTimeout(resolve, 50));
      const allManagedSaleRequests = await ManagedSaleRequest.list();
      setManagedSaleRequests(allManagedSaleRequests);

      const groupedConversations = groupMessagesIntoConversations(filteredMessages, userPublicId);
      setConversations(groupedConversations);

      let conversationToSetActive = null;
      const urlParams = new URLSearchParams(window.location.search);
      const removeUrlParams = () => {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
      };

      const recipientParam = urlParams.get('recipient');
      const vehicleParam = urlParams.get('vehicle');
      const managedSaleRequestParam = urlParams.get('managedSaleRequest');

      if (recipientParam) {
          // Attempt to find an existing conversation that matches the URL parameters
          let targetConversationInGroup = groupedConversations.find(conv => {
            const hasVehicleMatch = vehicleParam ? conv.vehicleId === vehicleParam : !conv.vehicleId;
            const hasMSRMatch = managedSaleRequestParam ? conv.managedSaleRequestId === managedSaleRequestParam : !conv.managedSaleRequestId;
            const hasOtherUserMatch = conv.otherUserId === recipientParam;

            return hasOtherUserMatch && hasVehicleMatch && hasMSRMatch;
          });

          if (!targetConversationInGroup) {
            const otherUser = allUsers.find(u => u.user_id === recipientParam);
            if (otherUser) {
              let otherUserId = recipientParam;

              if (otherUserId === userPublicId) {
                console.warn("Recipient param matches current user, swapping roles");
                const vehicle = allVehicles.find(v => v.id === vehicleParam);
                if (vehicle?.created_by_id && vehicle.created_by_id !== userPublicId) {
                  otherUserId = vehicle.created_by_id;
                }
                // else: if recipient param is current user and it's not a vehicle related to another user,
                // we might need more complex logic or prevent this. For now, it stays recipientParam.
              }

              // ✅ Generate new conversation_id based on context and sorted user IDs
              let newConversationId;
              const sortedUserIds = [userPublicId, otherUserId].sort().join('_');

              if (managedSaleRequestParam) {
                newConversationId = `msr_${managedSaleRequestParam}_${sortedUserIds}`;
              } else if (vehicleParam) {
                newConversationId = `vehicle_${vehicleParam}_${sortedUserIds}`;
              } else {
                newConversationId = `general_${sortedUserIds}`;
              }

              targetConversationInGroup = {
                id: newConversationId, // ✅ Use new ID structure
                conversationId: newConversationId, // ✅ Same value for consistency
                otherUserId,
                messages: [],
                vehicleId: vehicleParam,
                managedSaleRequestId: managedSaleRequestParam,
                lastMessage: null,
                unreadCount: 0,
              };

              groupedConversations.unshift(targetConversationInGroup); // Add new conversation to list
            }
          }

          if (targetConversationInGroup) {
            conversationToSetActive = targetConversationInGroup;
            removeUrlParams();
          }

      }

      // ✅ Simplified re-selection logic using clean conversation_id
      if (retainSelection && selectedConversation) {
          // Add validation to ensure selectedConversation has required properties
          const selectedId = selectedConversation.conversationId || selectedConversation.id;
          
          if (!selectedId) {
            console.warn("⚠️ Cannot re-select: selectedConversation has no id or conversationId", selectedConversation);
            // Don't try to re-select if we don't have a valid ID
          } else {
            console.log("🔄 Attempting to re-select conversation:");
            console.log("  - Conversation ID:", selectedId);
            console.log("🔄 Available conversation IDs:", groupedConversations.map(c => c.id));
            
            // ✅ Direct match using conversation_id
            conversationToSetActive = groupedConversations.find(
              conv => conv.id === selectedId
            );
            
            console.log("🔄 Re-selection result:", conversationToSetActive ? "SUCCESS ✅" : "FAILED ❌");
            if (conversationToSetActive) {
                console.log("🔄 Re-selected conversation:", {
                    id: conversationToSetActive.id,
                    messageCount: conversationToSetActive.messages.length
                });
            }
          }
      }

      if (!isMobileView && !conversationToSetActive && groupedConversations.length > 0) {
          conversationToSetActive = groupedConversations[0];
          console.log("📱 Auto-selecting first conversation:", conversationToSetActive.id);
      }

      if (conversationToSetActive) {
          console.log("✅ Setting active conversation:", conversationToSetActive.id);
          handleSelectConversation(conversationToSetActive);
      } else {
          console.log("⚠️ No conversation to set active");
          setSelectedConversation(null);
          setCurrentMessages([]);
      }

      setIsPollingPaused(false);

    } catch (error) {
      console.error("Failed to load messaging data:", error);
      if (error.response?.status === 429) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        setIsPollingPaused(true);

        toast({
          title: "Loading Paused",
          description: "Too many requests. Messages will refresh automatically in 10 minutes.",
          variant: "destructive",
        });

        setTimeout(() => {
          setIsPollingPaused(false);
          if (!pollIntervalRef.current) {
            pollIntervalRef.current = setInterval(() => {
              if (loadMessagingDataRef.current) {
                loadMessagingDataRef.current(true); // Retain selection on resume
              }
            }, 600000); // POLLING_RATE after pause, then POLLING_RATE for subsequent polls
          }
        }, 600000);
      } else if (error.response?.status === 401 || error.message === "Not Authenticated" || error.message?.includes("Not Authenticated")) {
        console.warn("User not authenticated during data load. Clearing user state.");
        setCurrentUser(null);
        setCurrentUserPublic(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [groupMessagesIntoConversations, handleSelectConversation, selectedConversation, toast, isMobileView]);

  const loadCurrentUser = useCallback(async () => {
    try {
      // With loadMessagingData now fetching user data internally,
      // this function simply triggers the initial data load.
      if (loadMessagingDataRef.current) {
        await loadMessagingDataRef.current(false); // Initial load, do not retain selection
      }
    } catch (error) {
      console.error("Error during initial data load setup:", error);
      setCurrentUser(null);
      setCurrentUserPublic(null);
    } finally {
      // setIsLoading(false) is now handled by loadMessagingData's finally block
    }
  }, []);

  useEffect(() => {
    loadMessagingDataRef.current = loadMessagingData;
  }, [loadMessagingData]);

  useEffect(() => {
    setIsLoading(true); // Set loading true initially for the very first load
    loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Notify layout about bottom nav visibility on mobile
  useEffect(() => {
    const shouldHideBottomNav = isMobileView && !!selectedConversation;
    
    // Dispatch custom event to layout
    const event = new CustomEvent('updateBottomNavVisibility', { 
      detail: { hide: shouldHideBottomNav } 
    });
    window.dispatchEvent(event);

    // Cleanup: show bottom nav when component unmounts or when leaving chat
    return () => {
      const showEvent = new CustomEvent('updateBottomNavVisibility', { 
        detail: { hide: false } 
      });
      window.dispatchEvent(showEvent);
    };
  }, [isMobileView, selectedConversation]);

  useEffect(() => {
    // Clear any existing interval to prevent duplicates
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Only set up polling if user is logged in AND not paused
    if (currentUser && !isPollingPaused) { // Changed dependency to currentUser
      pollIntervalRef.current = setInterval(() => {
        if (loadMessagingDataRef.current) {
          console.log("🔄 Polling for new messages...");
          loadMessagingDataRef.current(true); // Retain selection on poll
        }
      }, POLLING_RATE);
    }

    // Cleanup on unmount or dependency change
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [currentUser, isPollingPaused, POLLING_RATE]); // Dependency changed from currentUserPublic?.user_id to currentUser

  const getUserById = useCallback((userId) => {
    return users.find(user => user.user_id === userId) || { full_name: "Unknown User", email: "unknown" };
  }, [users]);

  const getVehicleById = useCallback((vehicleId) => {
    return vehicles.find(vehicle => vehicle.id === vehicleId);
  }, [vehicles]);

  const getManagedSaleRequestById = useCallback((requestId) => {
    return managedSaleRequests.find(req => req.id === requestId) || {};
  }, [managedSaleRequests]);

  const handleSendMessage = useCallback(async (messageData) => {
    const userPublicId = currentUserPublic?.user_id;
    if (!messageData.content?.trim() || !selectedConversation || !userPublicId) return;

    try {
      console.log(`📤 Sending message in conversation: ${selectedConversation.id}`);

      // ✅ FIX: Generate consistent conversation_id with sorted user IDs
      let conversation_id;
      const sortedUserIds = [userPublicId, selectedConversation.otherUserId].sort().join('_');
      
      if (selectedConversation.managedSaleRequestId) {
        conversation_id = `msr_${selectedConversation.managedSaleRequestId}_${sortedUserIds}`;
      } else if (selectedConversation.vehicleId) {
        conversation_id = `vehicle_${selectedConversation.vehicleId}_${sortedUserIds}`;
      } else {
        conversation_id = `general_${sortedUserIds}`;
      }

      console.log(`📤 Using conversation_id: "${conversation_id}"`);

      const dataToCreate = {
        ...messageData,
        sender_id: userPublicId,
        recipient_id: selectedConversation.otherUserId,
        content: messageData.content.trim(),
        vehicle_id: selectedConversation.vehicleId || null,
        managed_sale_request_id: selectedConversation.managedSaleRequestId || null,
        conversation_id,
      };

      console.log("📤 Creating message with data:", dataToCreate);

      const createdMessage = await Message.create(dataToCreate);

      console.log("✅ Message created:", createdMessage);

      if (loadMessagingDataRef.current) {
        await loadMessagingDataRef.current(true);
      }

      return createdMessage;

    } catch (error) {
      console.error("❌ Failed to send message:", error);
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedConversation, currentUserPublic?.user_id, toast]);

  const handleTestDriveSubmitFromModal = async (testDriveData) => {
    try {
      const vehicle = vehicles.find(v => v.id === testDriveData.vehicleId);
      if (!vehicle) throw new Error("Vehicle not found");

      let recipientId;

      if (vehicle.website_managed) {
        console.log('🔍 Looking for admin for managed sale test drive...');
        
        // Try to find admins in PublicUser first
        let admins = await PublicUser.filter({ role: 'admin' });
        console.log('👥 Found admins in PublicUser:', admins.length);
        
        // If no admins found in PublicUser, try User entity and sync
        if (admins.length === 0) {
          console.log('⚠️ No admins in PublicUser, checking User entity...');
          try {
            // Fetch all users and filter for admins client-side
            const allPublicUsers = await PublicUser.list();
            console.log('👥 Total PublicUsers:', allPublicUsers.length);
            
            // Find users with admin email patterns or specific known admin emails
            const potentialAdmins = allPublicUsers.filter(u => 
              u.user_type === 'dealership' || 
              u.full_name?.toLowerCase().includes('admin') ||
              (u.role === 'admin')
            );
            
            console.log('👥 Potential admins found:', potentialAdmins.length);
            
            if (potentialAdmins.length > 0) {
              admins = potentialAdmins;
            } else {
              // Last resort: use the vehicle owner for managed sales
              console.log('⚠️ No admins found anywhere, using vehicle owner');
              if (vehicle.original_owner_id) {
                recipientId = vehicle.original_owner_id;
              } else if (vehicle.created_by_id) {
                recipientId = vehicle.created_by_id;
              }
            }
          } catch (error) {
            console.error('Error fetching users:', error);
          }
        }
        
        if (admins.length > 0 && !recipientId) {
          recipientId = admins[0].user_id;
          console.log('✅ Using admin:', recipientId, admins[0].full_name);
        }
        
        if (!recipientId) {
          console.error("❌ Could not find recipient for managed sale test drive request.");
          toast({ 
            title: "Error", 
            description: "Could not find an administrator to process this request. Please try contacting support directly.", 
            variant: "destructive" 
          });
          return;
        }
      } else {
        recipientId = vehicle.created_by_id;
      }

      if (!recipientId) {
        toast({ title: "Error", description: "Could not identify the vehicle owner.", variant: "destructive" });
        return;
      }

      console.log('📧 Sending test drive request to:', recipientId);

      // Generate consistent conversation_id with sorted user IDs
      const sortedUserIdsForRecipient = [currentUserPublic.user_id, recipientId].sort().join('_');
      let conversationIdForRecipient;
      
      if (testDriveData.managedSaleRequestId) {
        conversationIdForRecipient = `msr_${testDriveData.managedSaleRequestId}_${sortedUserIdsForRecipient}`;
      } else if (testDriveData.vehicleId) {
        conversationIdForRecipient = `vehicle_${testDriveData.vehicleId}_${sortedUserIdsForRecipient}`;
      } else {
        conversationIdForRecipient = `general_${sortedUserIdsForRecipient}`;
      }

      console.log('💬 Using conversation ID:', conversationIdForRecipient);

      const messageToRecipient = await Message.create({
        recipient_id: recipientId,
        sender_id: currentUserPublic.user_id,
        content: `Test drive request for ${testDriveData.vehicleTitle}`,
        message_type: "test_drive_request",
        vehicle_id: testDriveData.vehicleId,
        test_drive_details: testDriveData,
        conversation_id: conversationIdForRecipient,
      });

      console.log('✅ Test drive request message created:', messageToRecipient.id);

      if (messageToRecipient) {
        await Notification.create({
          recipient_id: recipientId,
          sender_id: currentUserPublic.user_id,
          type: "test_drive_request",
          content: `${currentUser.full_name} requested a test drive for ${testDriveData.vehicleTitle}.`,
          related_entity_type: "Message",
          related_entity_id: messageToRecipient.id,
          url: createPageUrl("Messages"),
          icon: "CalendarCheck"
        });
      }

      // Generate consistent conversation_id for confirmation message
      const sortedUserIdsForConfirmation = [recipientId, currentUserPublic.user_id].sort().join('_');
      let conversationIdForConfirmation;
      
      if (testDriveData.managedSaleRequestId) {
        conversationIdForConfirmation = `msr_${testDriveData.managedSaleRequestId}_${sortedUserIdsForConfirmation}`;
      } else if (testDriveData.vehicleId) {
        conversationIdForConfirmation = `vehicle_${testDriveData.vehicleId}_${sortedUserIdsForConfirmation}`;
      } else {
        conversationIdForConfirmation = `general_${sortedUserIdsForConfirmation}`;
      }

      const confirmationMessage = await Message.create({
        recipient_id: currentUserPublic.user_id,
        sender_id: recipientId,
        content: `Your test drive request for "${testDriveData.vehicleTitle}" has been submitted.`,
        message_type: "confirmation_test_drive",
        vehicle_id: testDriveData.vehicleId,
        test_drive_details: testDriveData,
        read: true,
        conversation_id: conversationIdForConfirmation,
      });

      if(confirmationMessage) {
        await Notification.create({
          recipient_id: currentUserPublic.user_id,
          sender_id: recipientId,
          type: "test_drive_status_update",
          content: `Your test drive request for "${testDriveData.vehicleTitle}" was successfully submitted.`,
          related_entity_type: "Message",
          related_entity_id: confirmationMessage.id,
          url: createPageUrl("Messages"),
          icon: "CalendarCheck"
        });
      }

      if (loadMessagingDataRef.current) {
        loadMessagingDataRef.current(false);
      }

      setShowTestDriveModal(false);
      toast({
        title: "Test Drive Requested",
        description: "Your request has been sent. You will be notified of any updates.",
      });

    } catch (error) {
      console.error("Failed to send test drive request from modal:", error);
      toast({
        title: "Failed to Request Test Drive",
        description: "There was an error sending your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApproveTestDrive = async (messageId) => {
    try {
      const message = messages.find(msg => msg.id === messageId);
      if (message && message.test_drive_details) {
        const updatedTestDriveDetails = {
          ...message.test_drive_details,
          status: "approved"
        };

        await Message.update(message.id, {
          test_drive_details: updatedTestDriveDetails
        });

        // ✅ FIX: Use the SAME conversation_id from the original message
        await Message.create({
          recipient_id: message.sender_id,
          sender_id: currentUserPublic.user_id,
          content: `✅ Test Drive Approved!

Date: ${format(new Date(message.test_drive_details.preferred_date), 'MMM d, yyyy')}
Time: ${message.test_drive_details.preferred_time}
Location: ${message.test_drive_details.location}

Please confirm your attendance. Contact us if you have any questions.`,
          message_type: "test_drive_status_update",
          vehicle_id: message.vehicle_id,
          managed_sale_request_id: message.managed_sale_request_id,
          conversation_id: message.conversation_id // ✅ Use existing conversation_id
        });

        await Notification.create({
          recipient_id: message.sender_id,
          sender_id: currentUserPublic.user_id,
          type: "test_drive_status_update",
          content: `Your test drive request for "${message.test_drive_details.vehicleTitle}" was approved.`,
          related_entity_type: "Message",
          related_entity_id: message.id,
          url: createPageUrl("Messages"),
          icon: "CalendarCheck"
        });

        if (loadMessagingDataRef.current) {
          loadMessagingDataRef.current(true);
        }
        toast({
          title: "Test Drive Approved",
          description: `You've approved the test drive for ${message.test_drive_details.vehicleTitle}.`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Failed to approve test drive:", error);
      toast({
        title: "Failed to Approve Test Drive",
        description: "There was an error approving the test drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineTestDrive = async (messageId) => {
    try {
      const message = messages.find(msg => msg.id === messageId);
      if (message && message.test_drive_details) {
        const updatedTestDriveDetails = {
          ...message.test_drive_details,
          status: "declined"
        };

        await Message.update(message.id, {
          test_drive_details: updatedTestDriveDetails
        });

        // ✅ FIX: Use the SAME conversation_id from the original message
        await Message.create({
          recipient_id: message.sender_id,
          sender_id: currentUserPublic.user_id,
          content: `❌ Test Drive Request Declined

We're unable to accommodate this test drive request at this time. Please feel free to request another time slot or contact us for more options.`,
          message_type: "test_drive_status_update",
          vehicle_id: message.vehicle_id,
          managed_sale_request_id: message.managed_sale_request_id,
          conversation_id: message.conversation_id // ✅ Use existing conversation_id
        });

        await Notification.create({
          recipient_id: message.sender_id,
          sender_id: currentUserPublic.user_id,
          type: "test_drive_status_update",
          content: `Your test drive request for "${message.test_drive_details.vehicleTitle}" was declined.`,
          related_entity_type: "Message",
          related_entity_id: message.id,
          url: createPageUrl("Messages"),
          icon: "CalendarX"
        });

        if (loadMessagingDataRef.current) {
          loadMessagingDataRef.current(true);
        }
        toast({
          title: "Test Drive Declined",
          description: `You've declined the test drive for ${message.test_drive_details.vehicleTitle}.`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Failed to decline test drive:", error);
      toast({
        title: "Failed to Decline Test Drive",
        description: "There was an error declining the test drive. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestTestDrive = useCallback(() => {
    if (selectedConversation?.vehicleId || selectedConversation?.managedSaleRequestId) {
      setShowTestDriveModal(true);
    } else {
      toast({
        title: "Cannot Request Test Drive",
        description: "Test drive requests are typically associated with a specific vehicle or managed sale request.",
        variant: "destructive",
      });
    }
  }, [selectedConversation, toast]);

  const filteredConversations = conversations.filter(conv => {
    const otherUser = getUserById(conv.otherUserId);
    const vehicle = getVehicleById(conv.vehicleId);
    const managedSaleRequest = getManagedSaleRequestById(conv.managedSaleRequestId);

    return otherUser.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (vehicle && vehicle.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
           (managedSaleRequest && managedSaleRequest.vehicle_details?.title?.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleBackClick = () => {
    // If there's a selected conversation on mobile, clear it first
    if (isMobileView && selectedConversation) {
      setSelectedConversation(null);
    } else {
      // Otherwise, navigate to the previous page
      window.history.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-6">
          <MessageCircle className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Messages</h2>
          <p className="text-slate-600 mb-6">
            Please log in to view and send messages to other users.
          </p>
          <Button
            onClick={() => window.location.href = "https://speedio.app/login"}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Continue
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className={`${isMobileView && selectedConversation ? 'h-screen' : 'h-[calc(100vh-56px)]'} md:h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30`}
    >
      <div className="flex justify-center w-full h-full">
        <div className="flex h-full w-full max-w-5xl">
          <div className={`${isMobileView && selectedConversation ? 'hidden' : 'block'} w-full md:w-80 border-r border-slate-200/60 bg-white/80 backdrop-blur-sm flex flex-col flex-shrink-0`}>
            <div className="p-4 border-b border-slate-200/60 bg-white/90 flex-shrink-0">
              <div className="flex items-center gap-3 mb-4">
                {isMobileView && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleBackClick}
                    className="flex-shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                )}
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  Messages
                </h1>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={filteredConversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                getUserById={getUserById}
                getVehicleById={getVehicleById}
                getManagedSaleRequestById={getManagedSaleRequestById}
              />
            </div>
          </div>

          <div className={`${isMobileView && !selectedConversation ? 'hidden' : 'flex'} flex-1 flex flex-col bg-white/60 backdrop-blur-sm overflow-hidden h-full`}>
            {selectedConversation && currentUserPublic ? (
              <ChatInterface
                key={selectedConversation.id}
                conversation={selectedConversation}
                currentUser={currentUserPublic}
                otherUser={getUserById(selectedConversation.otherUserId)}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                onRequestTestDrive={handleRequestTestDrive}
                onApproveTestDrive={handleApproveTestDrive}
                onDeclineTestDrive={handleDeclineTestDrive}
                getVehicleById={getVehicleById}
                getManagedSaleRequestById={getManagedSaleRequestById}
                onBack={() => setSelectedConversation(null)}
                isMobileView={isMobileView}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
                <div className="text-center max-w-md">
                  <MessageCircle className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">No conversations selected</h3>
                  <p className="text-slate-500">
                    Select a conversation from the left panel to view messages, or start a new one.
                  </p>
                  {filteredConversations.length === 0 && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => window.location.href = "https://speedio.app/dashboard"}
                      >
                        Go to Dashboard to find vehicles
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showTestDriveModal && (
        <TestDriveModal
          conversation={selectedConversation}
          vehicles={vehicles}
          onClose={() => setShowTestDriveModal(false)}
          onSubmit={handleTestDriveSubmitFromModal}
          currentUser={currentUserPublic}
          preselectedVehicleId={selectedConversation?.vehicleId}
        />
      )}
    </div>
  );
}
