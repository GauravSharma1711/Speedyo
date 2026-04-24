import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function TestDriveStatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return { 
          icon: <Clock className="w-3 h-3" />, 
          color: 'bg-amber-100 text-amber-800 border-amber-200', 
          text: 'Pending' 
        };
      case 'approved':
        return { 
          icon: <CheckCircle className="w-3 h-3" />, 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          text: 'Approved' 
        };
      case 'completed':
        return { 
          icon: <CheckCircle className="w-3 h-3" />, 
          color: 'bg-green-100 text-green-800 border-green-200', 
          text: 'Completed' 
        };
      case 'declined':
        return { 
          icon: <XCircle className="w-3 h-3" />, 
          color: 'bg-red-100 text-red-800 border-red-200', 
          text: 'Declined' 
        };
      case 'no_show':
        return { 
          icon: <AlertCircle className="w-3 h-3" />, 
          color: 'bg-orange-100 text-orange-800 border-orange-200', 
          text: 'No Show' 
        };
      default:
        return { 
          icon: <Clock className="w-3 h-3" />, 
          color: 'bg-slate-100 text-slate-800 border-slate-200', 
          text: status || 'Unknown' 
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge className={`flex items-center gap-1 ${config.color}`}>
      {config.icon}
      {config.text}
    </Badge>
  );
}