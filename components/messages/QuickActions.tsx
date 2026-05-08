'use client'

import React from "react";
import { Button } from "@/components/ui/Button";
import { Calendar, Phone, Video } from "lucide-react";

type QuickActionsProps = {
  onRequestTestDrive: () => void;
  isTestDriveAvailable?: boolean;
};

export default function QuickActions({
  onRequestTestDrive,
  isTestDriveAvailable = true,
}: QuickActionsProps) {
  return (
    <div className="p-3 border-t border-slate-200/60 bg-white/50 flex-shrink-0">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        <Button
          size="sm"
          variant="ghost"
          onClick={onRequestTestDrive}
          disabled={!isTestDriveAvailable}
          className={`whitespace-nowrap flex-shrink-0 ${
            isTestDriveAvailable
              ? "text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              : "text-slate-400 cursor-not-allowed"
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {isTestDriveAvailable ? "Request Test Drive" : "No Slots Available"}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled
          className="text-slate-400 cursor-not-allowed whitespace-nowrap flex-shrink-0"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled
          className="text-slate-400 cursor-not-allowed whitespace-nowrap flex-shrink-0"
        >
          <Video className="w-4 h-4 mr-2" />
          Video Call
        </Button>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}