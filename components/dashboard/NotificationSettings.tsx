"use client"

import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { Bell, Mail, Users, Car, MessageSquare, Save, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/UseToast";

export default function NotificationSettings({ user, onUpdate }) {
  const [emailSettings, setEmailSettings] = useState({
    new_follower_post: true,
    new_follower_vehicle: true,
    all_emails: true
  });

  const [inappSettings, setInappSettings] = useState({
    new_follower_post: true,
    new_follower_vehicle: true,
    all_notifications: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.email_notifications) {
      setEmailSettings({
        new_follower_post: user.email_notifications.new_follower_post !== false,
        new_follower_vehicle: user.email_notifications.new_follower_vehicle !== false,
        all_emails: user.email_notifications.all_emails !== false
      });
    }

    if (user?.inapp_notifications) {
      setInappSettings({
        new_follower_post: user.inapp_notifications.new_follower_post !== false,
        new_follower_vehicle: user.inapp_notifications.new_follower_vehicle !== false,
        all_notifications: user.inapp_notifications.all_notifications !== false
      });
    }
  }, [user]);

  const handleEmailToggle = (key) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleInappToggle = (key) => {
    setInappSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await User.updateMe({
        email_notifications: emailSettings,
        inapp_notifications: inappSettings
      });

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated successfully.",
        variant: "success",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      toast({
        title: "Save Failed",
        description: "Could not save your notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications from Speedio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Email Notifications
          </h3>

          {/* Master Email Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-emerald-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3 flex-1">
              <Mail className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <Label htmlFor="all-emails" className="text-base font-semibold text-slate-800 cursor-pointer">
                  All Email Notifications
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  Master switch for all email notifications. Turning this off will disable all email alerts.
                </p>
              </div>
            </div>
            <Switch
              id="all-emails"
              checked={emailSettings.all_emails}
              onCheckedChange={() => handleEmailToggle('all_emails')}
              className="ml-4"
            />
          </div>

          {/* Individual Email Settings */}
          <div className="space-y-3 ml-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3 flex-1">
                <Users className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <Label 
                    htmlFor="email-follower-posts" 
                    className={`text-base font-medium cursor-pointer ${!emailSettings.all_emails ? 'text-slate-400' : 'text-slate-800'}`}
                  >
                    New Posts from Followed Users
                  </Label>
                  <p className={`text-sm mt-1 ${!emailSettings.all_emails ? 'text-slate-400' : 'text-slate-600'}`}>
                    Get notified via email when someone you follow creates a new post
                  </p>
                </div>
              </div>
              <Switch
                id="email-follower-posts"
                checked={emailSettings.new_follower_post && emailSettings.all_emails}
                onCheckedChange={() => handleEmailToggle('new_follower_post')}
                disabled={!emailSettings.all_emails}
                className="ml-4"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3 flex-1">
                <Car className="w-5 h-5 text-emerald-600 mt-1" />
                <div>
                  <Label 
                    htmlFor="email-follower-vehicles" 
                    className={`text-base font-medium cursor-pointer ${!emailSettings.all_emails ? 'text-slate-400' : 'text-slate-800'}`}
                  >
                    New Vehicle Listings from Followed Users
                  </Label>
                  <p className={`text-sm mt-1 ${!emailSettings.all_emails ? 'text-slate-400' : 'text-slate-600'}`}>
                    Get notified via email when someone you follow lists a new vehicle
                  </p>
                </div>
              </div>
              <Switch
                id="email-follower-vehicles"
                checked={emailSettings.new_follower_vehicle && emailSettings.all_emails}
                onCheckedChange={() => handleEmailToggle('new_follower_vehicle')}
                disabled={!emailSettings.all_emails}
                className="ml-4"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* In-App Notifications Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            In-App Notifications
          </h3>

          {/* Master In-App Toggle */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3 flex-1">
              <Bell className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <Label htmlFor="all-notifications" className="text-base font-semibold text-slate-800 cursor-pointer">
                  All In-App Notifications
                </Label>
                <p className="text-sm text-slate-600 mt-1">
                  Master switch for all in-app notifications. Turning this off will disable notification bell alerts.
                </p>
              </div>
            </div>
            <Switch
              id="all-notifications"
              checked={inappSettings.all_notifications}
              onCheckedChange={() => handleInappToggle('all_notifications')}
              className="ml-4"
            />
          </div>

          {/* Individual In-App Settings */}
          <div className="space-y-3 ml-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3 flex-1">
                <MessageSquare className="w-5 h-5 text-purple-600 mt-1" />
                <div>
                  <Label 
                    htmlFor="inapp-follower-posts" 
                    className={`text-base font-medium cursor-pointer ${!inappSettings.all_notifications ? 'text-slate-400' : 'text-slate-800'}`}
                  >
                    New Posts from Followed Users
                  </Label>
                  <p className={`text-sm mt-1 ${!inappSettings.all_notifications ? 'text-slate-400' : 'text-slate-600'}`}>
                    Show notification bell alert when someone you follow creates a new post
                  </p>
                </div>
              </div>
              <Switch
                id="inapp-follower-posts"
                checked={inappSettings.new_follower_post && inappSettings.all_notifications}
                onCheckedChange={() => handleInappToggle('new_follower_post')}
                disabled={!inappSettings.all_notifications}
                className="ml-4"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-3 flex-1">
                <Car className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <Label 
                    htmlFor="inapp-follower-vehicles" 
                    className={`text-base font-medium cursor-pointer ${!inappSettings.all_notifications ? 'text-slate-400' : 'text-slate-800'}`}
                  >
                    New Vehicle Listings from Followed Users
                  </Label>
                  <p className={`text-sm mt-1 ${!inappSettings.all_notifications ? 'text-slate-400' : 'text-slate-600'}`}>
                    Show notification bell alert when someone you follow lists a new vehicle
                  </p>
                </div>
              </div>
              <Switch
                id="inapp-follower-vehicles"
                checked={inappSettings.new_follower_vehicle && inappSettings.all_notifications}
                onCheckedChange={() => handleInappToggle('new_follower_vehicle')}
                disabled={!inappSettings.all_notifications}
                className="ml-4"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Note:</strong> You'll still receive important account and transaction notifications regardless of these settings.
          </p>
          <p className="text-xs text-blue-600">
            Critical system notifications and security alerts will always be delivered.
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}