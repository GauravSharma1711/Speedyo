"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { useToast } from "@/components/ui/UseToast";
import { X, CheckCircle, Circle, Upload, User, MapPin, Camera, Loader2 } from "lucide-react";

type SetupData = {
  full_name: string;
  location: string;
  profile_image: string;
};

type Props = {
  user: {
    email?: string;
    full_name?: string;
    location?: string;
    profile_image?: string;
    user_type?: string;
    verified?: boolean;
  };
  userDisplay?: Partial<SetupData> | null;
  onClose: () => void;
  /** UI-only: parent can re-read local state / refresh UI */
  onUpdate: () => void;
};

type StepId = "profile_picture" | "user_name" | "location";

export default function SetupAccountDialog({ user, userDisplay, onClose, onUpdate }: Props) {
  const { toast } = useToast();

  const [setupData, setSetupData] = useState<SetupData>(() => ({
    full_name: userDisplay?.full_name || user?.full_name || "",
    location: userDisplay?.location || user?.location || "",
    profile_image: userDisplay?.profile_image || user?.profile_image || "",
  }));

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId | null>(null);

  const steps = useMemo(() => {
    const emailName = user?.email?.split("@")[0] || "";
    return [
      {
        id: "profile_picture" as const,
        label: "Add Profile Picture",
        icon: Camera,
        completed: Boolean(setupData.profile_image),
        description: "Help others recognize you",
      },
      {
        id: "user_name" as const,
        label: "Set Your Name",
        icon: User,
        completed: Boolean(setupData.full_name) && setupData.full_name !== emailName,
        description: "Choose how you want to be known",
      },
      {
        id: "location" as const,
        label: "Add Location",
        icon: MapPin,
        completed: Boolean(setupData.location),
        description: "See vehicles in your area",
      },
    ];
  }, [setupData.full_name, setupData.location, setupData.profile_image, user?.email]);

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;
  const isFullyComplete = completedCount === steps.length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // UI-only local preview
      const url = URL.createObjectURL(file);
      setSetupData((prev) => ({ ...prev, profile_image: url }));
      toast({ title: "Photo selected", description: "Local preview only (UI-only)." });
    } catch (err) {
      console.error("Profile image preview failed", err);
      toast({ title: "Upload failed", description: "Could not preview image.", variant: "destructive" });
    } finally {
      setIsUploading(false);
      // allow re-selecting same file
      e.target.value = "";
    }
  };

  const fakeSave = async (label: string) => {
    setIsSaving(true);
    try {
      // UI-only: simulate save latency
      await new Promise((r) => setTimeout(r, 350));
      toast({ title: "Saved (UI-only)", description: `${label} saved to local state.` });
      setActiveStep(null);
      onUpdate();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep = async (stepId: StepId) => {
    if (stepId === "profile_picture") return fakeSave("Profile picture");
    if (stepId === "user_name") return fakeSave("Name");
    return fakeSave("Location");
  };

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      toast({ title: "Setup complete (UI-only)", description: "Account setup marked complete in UI." });
      onUpdate();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepEditor = () => {
    if (!activeStep) return null;
    const step = steps.find((s) => s.id === activeStep);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-slate-50 rounded-lg border"
      >
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          {step?.icon ? <step.icon className="w-4 h-4" /> : null}
          {step?.label}
        </h4>

        {activeStep === "profile_picture" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-16 h-16">
                <AvatarImage src={setupData.profile_image} />
                <AvatarFallback className="bg-slate-200">
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <User className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Button asChild variant="outline" disabled={isUploading}>
                  <label htmlFor="setup-profile-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {setupData.profile_image ? "Change Photo" : "Upload Photo"}
                    <input
                      id="setup-profile-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleImageUpload}
                      accept="image/*"
                      disabled={isUploading}
                    />
                  </label>
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveStep("profile_picture")}
                disabled={isSaving || !setupData.profile_image}
                size="sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>

              <Button variant="outline" onClick={() => setActiveStep(null)} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {activeStep === "user_name" ? (
          <div className="space-y-3">
            <Input
              value={setupData.full_name}
              onChange={(e) => setSetupData((prev) => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your preferred name"
            />

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveStep("user_name")}
                disabled={isSaving || !setupData.full_name.trim()}
                size="sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>

              <Button variant="outline" onClick={() => setActiveStep(null)} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {activeStep === "location" ? (
          <div className="space-y-3">
            <Input
              value={setupData.location}
              onChange={(e) => setSetupData((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="City, State/Prefecture, Country"
            />
            <p className="text-xs text-slate-500">
              This helps us show you vehicles in your area and connect you with local sellers.
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => handleSaveStep("location")}
                disabled={isSaving || !setupData.location.trim()}
                size="sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save
              </Button>

              <Button variant="outline" onClick={() => setActiveStep(null)} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, y: 100 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 100, y: 100 }}
      className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
    >
      <Card className="bg-white shadow-2xl border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              Setup Your Account
            </CardTitle>

            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">
                {completedCount} of {steps.length} completed
              </span>
              <span className="font-semibold text-blue-600">{Math.round(progressPercentage)}%</span>
            </div>

            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${step.completed ? "text-emerald-700" : "text-slate-700"}`}>
                    {step.label}
                  </span>
                  {step.completed ? (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">Done</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>

              {!step.completed ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep(step.id)}
                  disabled={activeStep === step.id}
                >
                  {activeStep === step.id ? "Editing..." : "Setup"}
                </Button>
              ) : null}
            </div>
          ))}

          {renderStepEditor()}

          {isFullyComplete ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-emerald-800">All Set!</span>
              </div>

              <p className="text-sm text-emerald-700 mb-3">
                Your profile is ready! You can now enjoy the full Speedio experience.
              </p>

              <Button
                onClick={handleCompleteSetup}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Completing...
                  </>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </motion.div>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}