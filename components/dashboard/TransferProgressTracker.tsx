
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const SPEEDIO_MANAGED_STEPS = [
  { number: 1, title: 'Documents Prepared', description: 'All required documents gathered' },
  { number: 2, title: 'LTO Inspection Completed', description: 'Government of Japan inspection by Speedyo' },
  { number: 3, title: 'PDI Insurance Purchased', description: 'Liability insurance obtained by buyer' },
  { number: 4, title: 'JSVRO Paperwork Submitted', description: 'SOFA registration paperwork filed' },
  { number: 5, title: 'Y-Plates Purchased & Installed', description: 'Military plates obtained and mounted' },
  { number: 6, title: 'JSVRO Finalization Complete', description: 'Full SOFA registration complete' }
];

const SELF_SERVICE_STEPS = [
  { number: 1, title: 'JSVRO Paperwork Submitted', description: 'Initial SOFA registration paperwork' },
  { number: 2, title: 'Y-Plates Purchased & Installed', description: 'Military plates obtained and mounted' },
  { number: 3, title: 'LTO Inspection Completed', description: 'Government of Japan inspection' },
  { number: 4, title: 'Returned to JSVRO', description: 'Documents submitted after inspection' },
  { number: 5, title: 'Road Tax Conversion Complete', description: 'Tax converted to SOFA status' },
  { number: 6, title: 'Final SOFA Registration Complete', description: 'Transfer process finalized' }
];

export default function TransferProgressTracker({ transfer, vehicle, compact = false }) {
  if (!transfer) return null;

  const steps = transfer.transfer_type === 'speedio_managed' ? SPEEDIO_MANAGED_STEPS : SELF_SERVICE_STEPS;
  const progressPercentage = ((transfer.steps_completed?.length || 0) / steps.length) * 100;

  const getStepStatus = (stepNumber) => {
    if (transfer.steps_completed?.includes(stepNumber)) {
      return 'completed';
    }
    if (stepNumber === transfer.current_step) {
      return 'current';
    }
    return 'pending';
  };

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
              {transfer.status === 'in_progress' ? 'In Progress' : transfer.status === 'on_hold' ? 'On Hold' : 'Completed'}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {transfer.transfer_type === 'speedio_managed' ? 'Speedyo-Managed' : 'Self-Service'}
            </Badge>
          </div>
          <span className="text-sm font-semibold text-slate-600">
            Step {transfer.current_step} of {steps.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Current Step */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">{steps[transfer.current_step - 1]?.title}</p>
            <p className="text-xs text-blue-700">{steps[transfer.current_step - 1]?.description}</p>
          </div>
        </div>

        {transfer.user_facing_notes && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-700">{transfer.user_facing_notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Transfer Progress
            <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
              {transfer.status === 'in_progress' ? 'In Progress' : transfer.status === 'on_hold' ? 'On Hold' : 'Completed'}
            </Badge>
          </CardTitle>
          <Badge variant="outline" className="capitalize">
            {transfer.transfer_type === 'speedio_managed' ? 'Speedyo-Managed' : 'Self-Service'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Overview */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Overall Progress</span>
            <span className="text-sm font-semibold text-slate-800">
              {transfer.steps_completed?.length || 0} of {steps.length} steps completed
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const status = getStepStatus(step.number);
            return (
              <div
                key={step.number}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                  status === 'current'
                    ? 'bg-blue-50 border-blue-300 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  ) : status === 'current' ? (
                    <Clock className="w-6 h-6 text-blue-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-800">Step {step.number}:</span>
                    <span className={`font-semibold ${
                      status === 'completed' ? 'text-emerald-800' :
                      status === 'current' ? 'text-blue-800' :
                      'text-slate-600'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* User-Facing Notes */}
        {transfer.user_facing_notes && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Update from Admin</p>
                <p className="text-sm text-blue-800">{transfer.user_facing_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-sm text-slate-600 pt-4 border-t border-slate-200">
          <span>Started: {transfer.initiated_date ? format(new Date(transfer.initiated_date), 'MMM d, yyyy') : 'N/A'}</span>
          {transfer.completed_date && (
            <span>Completed: {format(new Date(transfer.completed_date), 'MMM d, yyyy')}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}