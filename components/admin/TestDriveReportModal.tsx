"use client";

import React, { useEffect, useState } from "react";
import { FileText, Loader2, Send } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Card, CardContent } from "@/components/ui/Card";

export type TestDriveReportData = {
  buyer_interest_level: "" | "very_interested" | "interested" | "somewhat_interested" | "not_interested";
  buyer_feedback: string;
  speedio_report: string;
  next_steps: string;
  admin_notes: string;
};

export default function TestDriveReportModalUI(props: {
  isOpen: boolean;
  onClose: () => void;

  vehicleTitle?: string;
  buyerName?: string;
  preferred_date?: string;
  preferred_time?: string;

  initialValue?: Partial<TestDriveReportData>;
  onSave: (data: TestDriveReportData) => void;
}) {
  const { isOpen, onClose, initialValue, onSave } = props;

  const [reportData, setReportData] = useState<TestDriveReportData>({
    buyer_interest_level: "",
    buyer_feedback: "",
    speedio_report: "",
    next_steps: "",
    admin_notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setReportData({
      buyer_interest_level: initialValue?.buyer_interest_level ?? "",
      buyer_feedback: initialValue?.buyer_feedback ?? "",
      speedio_report: initialValue?.speedio_report ?? "",
      next_steps: initialValue?.next_steps ?? "",
      admin_notes: initialValue?.admin_notes ?? "",
    });
  }, [isOpen, initialValue]);

  const handleSave = async () => {
    if (!reportData.buyer_interest_level || !reportData.speedio_report.trim()) return;

    setIsSubmitting(true);
    try {
      onSave({
        ...reportData,
        speedio_report: reportData.speedio_report.trim(),
        buyer_feedback: reportData.buyer_feedback.trim(),
        next_steps: reportData.next_steps.trim(),
        admin_notes: reportData.admin_notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Test Drive Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-1 text-sm">
              <div className="font-semibold">{props.vehicleTitle || "Unknown Vehicle"}</div>
              <div className="text-slate-600">Buyer: {props.buyerName || "Unknown"}</div>
              <div className="text-slate-600">
                Date: {props.preferred_date || "Not set"} • Time: {props.preferred_time || "Not set"}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Buyer Interest Level *
              </label>
              <Select
                value={reportData.buyer_interest_level}
                onValueChange={(value) =>
                  setReportData((p) => ({ ...p, buyer_interest_level: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select interest level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very_interested">Very Interested</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="somewhat_interested">Somewhat Interested</SelectItem>
                  <SelectItem value="not_interested">Not Interested</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Buyer's Feedback
              </label>
              <Textarea
                value={reportData.buyer_feedback}
                onChange={(e) => setReportData((p) => ({ ...p, buyer_feedback: e.target.value }))}
                placeholder="What did the buyer say about the vehicle?"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Speedio's Assessment *
              </label>
              <Textarea
                value={reportData.speedio_report}
                onChange={(e) => setReportData((p) => ({ ...p, speedio_report: e.target.value }))}
                placeholder="Your assessment of the test drive and buyer's likelihood to purchase"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Recommended Next Steps
              </label>
              <Textarea
                value={reportData.next_steps}
                onChange={(e) => setReportData((p) => ({ ...p, next_steps: e.target.value }))}
                placeholder="What should happen next?"
                className="h-24"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Internal Admin Notes
              </label>
              <Textarea
                value={reportData.admin_notes}
                onChange={(e) => setReportData((p) => ({ ...p, admin_notes: e.target.value }))}
                placeholder="Internal notes (not shared with owner)"
                className="h-20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !reportData.buyer_interest_level || !reportData.speedio_report.trim()}
              className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                 Save & Send Report
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}