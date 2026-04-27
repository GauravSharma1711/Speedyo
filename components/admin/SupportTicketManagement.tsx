"use client"
import React, { useState, useEffect } from "react";
import { SupportTicket, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sendEmail } from "@/functions/sendEmail";
import { useToast } from "@/components/ui/use-toast";

export default function SupportTicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      const allTickets = await SupportTicket.list("-created_date", 100);
      setTickets(allTickets);
    } catch (error) {
      console.error("Failed to load support tickets:", error);
    }
    setIsLoading(false);
  };
  
  const handleStatusChange = async (ticket, newStatus) => {
    try {
      await SupportTicket.update(ticket.id, { status: newStatus });
      
      // Send email notification to user about status change
      if (currentUser && currentUser.email) {
        const statusMessages = {
          in_progress: {
            subject: `Your support ticket is now being reviewed - [#${ticket.id}]`,
            title: "We're working on your request",
            message: "Our support team has started working on your ticket and will update you with any progress."
          },
          resolved: {
            subject: `Your support ticket has been resolved - [#${ticket.id}]`,
            title: "✅ Your issue has been resolved",
            message: "We've successfully resolved your support request. If you need any additional help, please don't hesitate to contact us again."
          },
          closed: {
            subject: `Your support ticket has been closed - [#${ticket.id}]`,
            title: "Ticket Closed",
            message: "Your support ticket has been closed. If you have any other questions or need further assistance, please feel free to reach out to us."
          }
        };

        const statusInfo = statusMessages[newStatus];
        if (statusInfo) {
          await sendEmail({
            to: ticket.email,
            subject: statusInfo.subject,
            html: `<table width="100%" bgcolor="#f5f7fa" style="padding:20px;">
                    <tr>
                      <td align="center">
                        <table width="600" style="background:#ffffff;border-radius:12px;padding:20px;font-family:sans-serif;color:#333;">
                          <tr>
                            <td align="center" style="padding-bottom:20px;">
                              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" width="140">
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <h2 style="color:#007BFF;">${statusInfo.title}</h2>
                              <p>Hi ${ticket.name},</p>
                              <p>${statusInfo.message}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:15px;background:#f5f7fa;border-radius:8px;">
                              <p><strong>Ticket ID:</strong> #${ticket.id}</p>
                              <p><strong>Subject:</strong> ${ticket.subject}</p>
                              <p><strong>Status:</strong> <span style="background:${newStatus === 'resolved' ? '#28A745' : newStatus === 'in_progress' ? '#FFC107' : '#6C757D'};color:#fff;padding:4px 8px;border-radius:4px;">${newStatus.replace('_', ' ').toUpperCase()}</span></p>
                              <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:20px;">
                              <p style="color:#666;font-size:12px;">Need more help? Contact us at support@speedio.app</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>`
          });

          toast({
            title: "Status Updated",
            description: `Ticket #${ticket.id} status changed to ${newStatus}. Email sent to user.`,
            variant: "success",
          });
        }
      }

      loadTickets();
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update ticket status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      resolved: "bg-emerald-100 text-emerald-800",
      closed: "bg-slate-100 text-slate-800",
    };
    return (
      <Badge className={colors[status] || colors.closed}>{status.replace('_', ' ').toUpperCase()}</Badge>
    );
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle>Support Ticket Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map(ticket => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div className="font-medium">{ticket.subject}</div>
                  <div className="text-sm text-slate-500 line-clamp-1">{ticket.message}</div>
                  <div className="text-xs text-slate-400 mt-1">#{ticket.id}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{ticket.name}</div>
                  <div className="text-sm text-slate-500">{ticket.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{ticket.ticket_type}</Badge>
                </TableCell>
                <TableCell>
                  <Select 
                    value={ticket.status} 
                    onValueChange={(value) => handleStatusChange(ticket, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}