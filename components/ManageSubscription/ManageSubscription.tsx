"use client"

import React, { useEffect } from "react";
import { usePaymentStore } from "@/store/paymentStore";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/Separator";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  CreditCard, Download, Eye, Calendar, DollarSign,
  CheckCircle, XCircle, Clock, FileText, ArrowLeft,
  ExternalLink, AlertCircle,
  JapaneseYenIcon
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";


// const MOCK_USER = {
//   user_type: "dealership",
//   seller_subscription: {
//     tier: "tier2",
//     expires_at: "2025-06-15T00:00:00Z",
//     vehicles_sold_this_year: 14,
//     status: "active",
//     cancel_at_period_end: false,
//     current_period_end: "2025-06-15T00:00:00Z",
//   },
// };

// const MOCK_INVOICES = [
//   {
//     id: "inv_1",
//     description: "Professional Dealership Plan - May 2025",
//     created: "2025-05-01T00:00:00Z",
//     period_start: "2025-05-01T00:00:00Z",
//     period_end: "2025-05-31T00:00:00Z",
//     amount: 199.0,
//     currency: "JPY",
//     status: "paid",
//     hosted_invoice_url: "#",
//     invoice_pdf: "#",
//   },
//   {
//     id: "inv_2",
//     description: "Professional Dealership Plan - Apr 2025",
//     created: "2025-04-01T00:00:00Z",
//     period_start: "2025-04-01T00:00:00Z",
//     period_end: "2025-04-30T00:00:00Z",
//     amount: 199.0,
//     currency: "JPY",
//     status: "paid",
//     hosted_invoice_url: "#",
//     invoice_pdf: "#",
//   },
// ];

// const MOCK_PAYMENTS = [
//   {
//     id: "pay_1",
//     description: "Subscription payment - Professional Plan",
//     created: "2025-05-01T10:23:00Z",
//     amount: 199.0,
//     currency: "JPY",
//     status: "succeeded",
//     receipt_url: "#",
//   },
//   {
//     id: "pay_2",
//     description: "Subscription payment - Professional Plan",
//     created: "2025-04-01T09:10:00Z",
//     amount: 199.0,
//     currency: "JPY",
//     status: "succeeded",
//     receipt_url: "#",
//   },
//   {
//     id: "pay_3",
//     description: "Subscription payment - Professional Plan",
//     created: "2025-03-01T08:45:00Z",
//     amount: 199.0,
//     currency: "JPY",
//     status: "failed",
//     receipt_url: null,
//   },
// ];

async function downloadInvoice(invoiceId: string, invoiceNumber: string) {
  try {
    const res = await fetch(`/api/invoice/${invoiceId}`);
    if (!res.ok) throw new Error("Failed to generate PDF");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invoiceNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
  }
}


const STATUS_CONFIG: Record<string, { className: string; icon: React.ElementType }> = {
  succeeded:  { className: "bg-green-100 text-green-800",  icon: CheckCircle },
  paid:       { className: "bg-green-100 text-green-800",  icon: CheckCircle },
  completed:  { className: "bg-green-100 text-green-800",  icon: CheckCircle },
  active:     { className: "bg-green-100 text-green-800",  icon: CheckCircle },
  processing: { className: "bg-blue-100 text-blue-800",    icon: Clock },
  pending:    { className: "bg-amber-100 text-amber-800",  icon: Clock },
  unknown:    { className: "bg-amber-100 text-amber-800",  icon: Clock },
  failed:     { className: "bg-red-100 text-red-800",      icon: XCircle },
  canceled:   { className: "bg-slate-100 text-slate-800",  icon: XCircle },
  expired:    { className: "bg-slate-100 text-slate-800",  icon: XCircle },
};

const TIER_NAMES: Record<string, string> = {
  tier1: "Standard", tier2: "Professional", tier3: "Enterprise", private_seller: "Private Seller", none: "None",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <Badge className={`capitalize ${cfg.className}`}>
      <Icon className="w-3 h-3 mr-1" />{status}
    </Badge>
  );
}

export default function ManageSubscription() {

  const { data: session } = useSession();

    const {
    payments,
    invoices,
    subscription,
    isLoadingHistory,
    historyError,
    getHistory,
  } = usePaymentStore();

  useEffect(() => {
    getHistory();
  }, []);



  const sub = subscription;

  const isDealer = session?.user?.user_type === "dealership";
  const tierLimit = sub?.tier === "tier1" ? "10" : sub?.tier === "tier2" ? "25" : null;


  const subscriptionDetails = subscription;


   if (isLoadingHistory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading payment history...</div>
      </div>
    );
  }

  if (historyError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{historyError}</div>
      </div>
    );
  }




  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <Link href="/Dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Manage Subscription</h1>
          <p className="text-slate-600 mt-1">View your subscription details and payment history</p>
        </div>

            {subscription ? (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />Current Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">

                <div>
                  <p className="text-sm text-slate-500 mb-1">Plan Type</p>
                  <p className="text-lg font-semibold text-slate-800">
                    {isDealer
                      ? `${TIER_NAMES[subscription.tier ?? ""] ?? subscription.tier} Dealership`
                      : "Private Seller"}
                  </p>
                </div>

                {subscription.current_period_end && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Next Billing Date</p>
                    <p className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                    </p>
                  </div>
                )}

                {isDealer && (
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Vehicles Sold This Year</p>
                    <p className="text-lg font-semibold text-slate-800">
                      {subscription.vehicles_sold_this_year ?? 0}
                      {tierLimit
                        ? <span className="text-sm text-slate-500 font-normal"> / {tierLimit} limit</span>
                        : <span className="text-sm text-slate-500 font-normal"> (Unlimited)</span>}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-sm text-slate-500">Subscription Status</p>
                    <div className="mt-1">
                      <StatusBadge status={subscription.status ?? "unknown"} />
                    </div>
                  </div>
                  {subscription.cancel_at_period_end && subscription.current_period_end && (
                    <Alert className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        Your subscription will end on{" "}
                        {format(new Date(subscription.current_period_end), "MMM d, yyyy")}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <Separator />
              <div className="flex gap-3">
                <Link href="/Subscription" className="flex-1">
                  <Button variant="outline" className="w-full">Change Plan</Button>
                </Link>
                {/* ✅ Refresh button wired to getHistory */}
                <Button variant="outline" className="flex-1" onClick={getHistory}>
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          
          isDealer && (
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="py-8 text-center text-slate-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No active subscription found.</p>
                <Link href="/Subscription">
                  <Button className="mt-4">View Plans</Button>
                </Link>
              </CardContent>
            </Card>
          )
        )}


  {/* ── Invoices Card ── */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />Invoices
            </CardTitle>
            <CardDescription>Download or view your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No invoices found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{inv.description}</p>
                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(inv.created), "MMM d, yyyy")}
                          </span>
                          {inv.period_start && inv.period_end && (
                            <span className="text-xs">
                              ({format(new Date(inv.period_start), "MMM d")} – {format(new Date(inv.period_end), "MMM d, yyyy")})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-800">¥{inv.amount.toFixed(2)} {inv.currency}</p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <div className="flex gap-2">
                   
                          <Button variant="outline" size="sm"
                          //  onClick={() => window.open(inv?.invoice_url , "_blank")}
                            onClick={() => window.open(`/api/invoice/${inv.id}?view=true`, "_blank")}
                           >
                            <Eye className="w-4 h-4 mr-2" />View
                          </Button>
                        
                     
                          <Button variant="outline" size="sm"
                          onClick={() => downloadInvoice(inv.id, inv.invoice_number)}
                           >
                            <Download className="w-4 h-4 mr-2" />PDF
                          </Button>
                      
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

   {/* ── Payment History Card ── */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <JapaneseYenIcon className="w-5 h-5 text-blue-500" />Payment History
            </CardTitle>
            <CardDescription>All your transactions and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>No payment history found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((pay) => (
                  <div
                    key={pay.id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex-wrap gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{pay.description}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(pay.created), "MMM d, yyyy h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-slate-800">
                          ¥{Number(pay.amount).toLocaleString()} {pay.currency}
                        </p>
                        <StatusBadge status={pay.status} />
                      </div>
                      {pay.receipt_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          // onClick={() => window.open(pay.receipt_url!, "_blank")}
                           onClick={() => window.open(`/api/payment/${pay.id}/receipt?view=true`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}