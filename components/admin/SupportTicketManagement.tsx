"use client";

import React, { useMemo, useState } from "react";

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

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketType = "general" | "payments" | "technical" | "other";

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

const MOCK_TICKETS: SupportTicketRow[] = [
  {
    id: "t_1001",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    name: "Yuki Tanaka",
    email: "yuki@example.com",
    subject: "Can't upload documents",
    message: "Business license upload gets stuck at 0%. Tried two browsers.",
    ticket_type: "technical",
    status: "open",
  },
  {
    id: "t_1002",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    name: "Tanmay Ahuja",
    email: "tanmay@example.com",
    subject: "Subscription question",
    message: "When does the free month end and how do I upgrade to tier2?",
    ticket_type: "payments",
    status: "in_progress",
  },
  {
    id: "t_1003",
    created_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    name: "Hiro Sato",
    email: "hiro@example.com",
    subject: "Account verification",
    message: "Verification status still pending after 3 days.",
    ticket_type: "general",
    status: "resolved",
  },
];

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

  const [tickets, setTickets] = useState<SupportTicketRow[]>(MOCK_TICKETS);
  const [isLoading] = useState(false);

  const sortedTickets = useMemo(() => {
    return [...tickets].sort(
      (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime(),
    );
  }, [tickets]);

  const handleStatusChange = (ticket: SupportTicketRow, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticket.id ? { ...t, status: newStatus } : t)),
    );

    toast({
      title: "Status Updated",
      description: `Ticket #${ticket.id} → ${newStatus.replace("_", " ")}. Email/API wiring pending.`,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading support tickets...</div>;
  }

  return (
    <Card className="bg-white shadow-md">
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
                </TableCell>
              </TableRow>
            ))}

            {sortedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-10">
                  No support tickets yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}