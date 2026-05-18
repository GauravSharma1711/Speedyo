"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useToast } from "@/components/ui/UseToast";
import { Loader2 } from "lucide-react";
import { useSupportTicketsStore } from "@/store/admin/supportTickets";
import type { TicketStatus, TicketType, SupportTicketApi } from "@/services/admin/supportTicketServices";

type SupportTicketRow = {
  id: string;
  created_date: string; // ISO
  name: string;
  email: string;
  subject: string;
  message: string;
  ticket_type: TicketType;
  status: TicketStatus;
};

function statusBadge(status: TicketStatus) {
  const colors: Record<TicketStatus, string> = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-emerald-100 text-emerald-800",
    closed: "bg-slate-100 text-slate-800",
  };

  return (
    <Badge className={colors[status]}>
      {status.replace("_", " ").toUpperCase()}
    </Badge>
  );
}

export default function SupportTicketManagementUI() {
  const { toast } = useToast();
  const { items, isLoading, fetch, updateStatus } = useSupportTicketsStore();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  const tickets: SupportTicketRow[] = useMemo(() => {
    return items.map((t: SupportTicketApi) => ({
      id: t.id,
      created_date: t.createdAt,
      name: t.name,
      email: t.email,
      subject: t.subject,
      message: t.message,
      ticket_type: t.ticket_type,
      status: t.status,
    }));
  }, [items]);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort(
      (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime(),
    );
  }, [tickets]);

  const handleStatusChange = async (ticket: SupportTicketRow, newStatus: TicketStatus) => {
    setIsUpdating(ticket.id);
    try {
      await updateStatus(ticket.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Ticket #${ticket.id} status changed to ${newStatus.replace("_", " ")}. Email sent to user.`,
      });
    } catch (_e) {
      toast({
        title: "Update failed",
        description: "Could not update ticket status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle>Support Ticket Management</CardTitle>
      </CardHeader>

      <CardContent>
        <div>
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
            {isLoading && sortedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10">
                  <div className="flex items-center justify-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : null}

            {sortedTickets.map((ticket) => (
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
                  <Badge variant="secondary" className="capitalize">
                    {ticket.ticket_type}
                  </Badge>
                </TableCell>

                <TableCell className="space-y-2">
                  <div>
                    <Select
                      value={ticket.status}
                      disabled={isUpdating === ticket.id}
                      onValueChange={(value) =>
                        handleStatusChange(ticket, value as TicketStatus)
                      }
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
                  </div>
                    {isUpdating === ticket.id && (
      <Loader2 className="w-4 h-4 animate-spin text-slate-400 flex-shrink-0" />
    )}
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && sortedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-10">
                  No support tickets yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}