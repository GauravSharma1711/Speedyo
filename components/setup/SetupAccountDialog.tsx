
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { 
  X, 
  CheckCircle, 
  Circle, 
  Upload, 
  User, 
  MapPin, 
  Camera,
  Loader2
} from "lucide-react";
import { UserEntity, PublicUser, UploadFile } from "@/api/entities";

export default function SetupAccountDialog({ user, userDisplay, onClose, onUpdate }: { user: any, userDisplay: any, onClose: () => void, onUpdate: () => void }) {
  const [setupData, setSetupData] = useState({
    full_name: userDisplay?.full_name || user?.full_name || "",
    location: userDisplay?.location || user?.location || "",
    profile_image: userDisplay?.profile_image || user?.profile_image || ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // Calculate completion status
  const steps = [
    {
      id: 'profile_picture',
      label: 'Add Profile Picture',
      icon: Camera,
      completed: !!setupData.profile_image,
      description: 'Help others recognize you'
    },
    {
      id: 'user_name', 
      label: 'Set Your Name',
      icon: User,
      completed: setupData.full_name && setupData.full_name !== user?.email?.split('@')[0],
      description: 'Choose how you want to be known'
    },
    {
      id: 'location',
      label: 'Add Location',
      icon: MapPin,
      completed: !!setupData.location,
      description: 'See vehicles in your area'
    }
  ];

  const completedCount = steps.filter(step => step.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;
  const isFullyComplete = completedCount === steps.length;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setSetupData(prev => ({ ...prev, profile_image: file_url }));
    } catch (error) {
      console.error("Profile image upload failed", error);
      alert("Failed to upload image. Please try again.");
    }
    setIsUploading(false);
  };

  const handleSaveStep = async (stepId: string) => {
    setIsSaving(true);
    try {
      // Update User entity
      await UserEntity.updateMyUserData(setupData);
      
      // Update or create PublicUser entity
      const publicProfiles = await PublicUser.filter({ user_id: user.id });
      if (publicProfiles.length > 0) {
        await PublicUser.update(publicProfiles[0].id, setupData);
      } else {
        await PublicUser.create({
          user_id: user.id,
          ...setupData,
          user_type: user.user_type || "guest",
          verified: user.verified || false
        });
      }
      
      setActiveStep(null);
      onUpdate(); // Refresh user data in parent
    } catch (error) {
      console.error("Failed to save setup data:", error);
      alert("Failed to save. Please try again.");
    }
    setIsSaving(false);
  };

  const handleCompleteSetup = async () => {
    setIsSaving(true);
    try {
      // Mark setup as completed on the main User record
      await UserEntity.updateMyUserData({ 
        setup_completed: true 
      });
      onUpdate(); // CRITICAL: Refresh the parent component's state to get the new `setup_completed` flag
      onClose(); // Close the dialog
    } catch (error) {
      console.error("Failed to complete setup:", error);
      alert("Failed to complete setup. Please try again.");
    }
    setIsSaving(false);
  };

  const renderStepEditor = () => {
    if (!activeStep) return null;

    const step = steps.find(s => s.id === activeStep);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 bg-slate-50 rounded-lg border"
      >
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          {step?.icon && <step.icon className="w-4 h-4" />}
          {step?.label}
        </h4>
        
        {activeStep === 'profile_picture' && (
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
                    {setupData.profile_image ? 'Change Photo' : 'Upload Photo'}
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
                onClick={() => handleSaveStep('profile_picture')}
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
        )}

        {activeStep === 'user_name' && (
          <div className="space-y-3">
            <Input
              value={setupData.full_name}
              onChange={(e) => setSetupData(prev => ({ ...prev, full_name: e.target.value }))}
              placeholder="Enter your preferred name"
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSaveStep('user_name')}
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
        )}

        {activeStep === 'location' && (
          <div className="space-y-3">
            <Input
              value={setupData.location}
              onChange={(e) => setSetupData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, State/Prefecture, Country"
            />
            <p className="text-xs text-slate-500">
              This helps us show you vehicles in your area and connect you with local sellers.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleSaveStep('location')}
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
        )}
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
              <span className="font-semibold text-blue-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage as number} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${step.completed ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {step.label}
                  </span>
                  {step.completed && (
                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">{step.description}</p>
              </div>
              
              {!step.completed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveStep(step.id)}
                  disabled={activeStep === step.id}
                >
                  {activeStep === step.id ? 'Editing...' : 'Setup'}
                </Button>
              )}
            </div>
          ))}

          {renderStepEditor()}

          {isFullyComplete && (
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
                  'Complete Setup'
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
