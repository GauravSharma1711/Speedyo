import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  User,
  Car,
  Calendar,
  Star,
  MessageSquare,
  ClipboardList,
  Target
} from "lucide-react";
import { format } from "date-fns";

export default function SellerTestDriveReportViewModal({ isOpen, onClose, activityData }) {
  if (!isOpen || !activityData) return null;

  const { request, vehicle, buyer } = activityData;
  const details = request.test_drive_details || {};

  const interestLevels = {
    very_interested: { label: 'Very Interested', color: 'bg-green-100 text-green-800' },
    interested: { label: 'Interested', color: 'bg-blue-100 text-blue-800' },
    somewhat_interested: { label: 'Somewhat Interested', color: 'bg-yellow-100 text-yellow-800' },
    not_interested: { label: 'Not Interested', color: 'bg-red-100 text-red-800' },
  };

  const interestInfo = interestLevels[details.buyer_interest_level] || { label: 'N/A', color: 'bg-slate-100' };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            Test Drive Activity Report
          </DialogTitle>
          <DialogDescription>
            A summary of the completed test drive for your vehicle, "{vehicle?.title}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Context */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Car className="w-4 h-4"/> Vehicle</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{vehicle?.title}</p>
                <p className="text-sm text-slate-500">{vehicle?.make} {vehicle?.model} ({vehicle?.year})</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4"/> Buyer</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{buyer?.full_name}</p>
                <p className="text-sm text-slate-500">Requested on {format(new Date(request.created_date), 'MMM d, yyyy')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Test Drive Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-5 h-5"/> Test Drive Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>Actual Date</Label>
                <p>{details.actual_date ? format(new Date(details.actual_date), 'EEEE, MMM d, yyyy') : 'Not recorded'}</p>
              </div>
              <div>
                <Label>Actual Time</Label>
                <p>{details.actual_time || 'Not recorded'}</p>
              </div>
              <div>
                <Label>Duration</Label>
                <p>{details.duration_minutes ? `${details.duration_minutes} minutes` : 'Not recorded'}</p>
              </div>
              <div>
                <Label>Completed By</Label>
                <p className="font-mono text-xs">{details.completed_by_admin || 'Speedio Team'}</p>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Buyer Feedback */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-blue-800"><MessageSquare className="w-5 h-5"/> Buyer's Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-white rounded-md border text-sm text-slate-700 min-h-[60px]">
                {details.buyer_feedback || <span className="text-slate-400">No feedback recorded.</span>}
              </div>
              <div className="mt-3">
                <Label>Buyer Interest Level</Label>
                <div className="mt-1">
                  <Badge className={`${interestInfo.color} text-sm`}>
                    <Star className="w-3 h-3 mr-2" />
                    {interestInfo.label}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Speedio Assessment */}
          <Card className="bg-emerald-50/50 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-emerald-800"><ClipboardList className="w-5 h-5"/> Speedio's Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-white rounded-md border text-sm text-slate-700 min-h-[80px]">
                {details.speedio_report || <span className="text-slate-400">No assessment provided.</span>}
              </div>
            </CardContent>
          </Card>
          
          {/* Next Steps */}
          <Card className="bg-purple-50/50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-purple-800"><Target className="w-5 h-5"/> Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-white rounded-md border text-sm text-slate-700 min-h-[60px]">
                {details.next_steps || <span className="text-slate-400">No specific next steps recommended at this time.</span>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end p-4 border-t bg-slate-50 rounded-b-lg">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}