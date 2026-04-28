"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/TextArea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { motion } from "framer-motion";
import { CheckCircle, Send, Phone, Mail, MapPin, Loader2 } from "lucide-react";
import Footer from "@/components/layout/Footer";

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  ticket_type: string;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
    ticket_type: "general",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Replace with your real API call
      // e.g. POST to /api/contact which creates a support ticket + sends emails
      // await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // Simulate network delay
      await new Promise((res) => setTimeout(res, 1200));
      console.log("Support ticket (dummy):", formData);

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "", ticket_type: "general" });
    } catch (err) {
      console.error("Support ticket submission failed:", err);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────
  if (submitStatus === "success") {
    return (
      <div>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-10 max-w-2xl w-full text-center"
          >
            <CheckCircle className="w-24 h-24 text-emerald-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-800 mb-4">
              Support Ticket Created Successfully!
            </h1>

            <div className="text-left bg-slate-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-slate-800 mb-3">What happens next:</h3>
              <ul className="space-y-2 text-slate-600">
                {[
                  "Your support ticket has been created and assigned a unique ID",
                  `You'll receive an email confirmation at ${formData.email}`,
                  "Our support team will review and respond within 24 hours",
                  "Check your email for updates on your ticket status",
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setSubmitStatus(null)}
                variant="outline"
                className="flex-1 max-w-xs"
              >
                Submit Another Ticket
              </Button>
              <Button
                onClick={() => router.push("/Feed")}
                className="flex-1 max-w-xs bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
              >
                Back to Feed
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <Button
                onClick={() => router.push("/Dashboard")}
                variant="ghost"
                className="flex-1 max-w-xs"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push("/FAQ")}
                variant="ghost"
                className="flex-1 max-w-xs"
              >
                Browse FAQ
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-emerald-50/20 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold text-slate-800 mb-4">Get in Touch</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              We're here to help! Whether you have a question about our services, need assistance
              with your account, or want to provide feedback, please reach out.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* ── Contact Form ── */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
            >
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Send className="w-6 h-6 text-blue-500" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Your Name
                        </label>
                        <Input
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Your Email
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Inquiry Type
                      </label>
                      <Select
                        value={formData.ticket_type}
                        onValueChange={(value) => handleInputChange("ticket_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="billing">Billing & Payments</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="listing_issue">Listing Issue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Subject
                      </label>
                      <Input
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        placeholder="How can we help?"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Message
                      </label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        placeholder="Please describe your issue or question in detail."
                        className="h-32"
                        required
                      />
                    </div>

                    {submitStatus === "error" && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          Failed to send message. Please try again later.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-6">
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Submit Ticket"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* ── Contact Info ── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.4 } }}
              className="space-y-8"
            >
              <h3 className="text-2xl font-bold text-slate-800">Contact Information</h3>
              <p className="text-slate-600">
                For immediate assistance, you can also reach us through the following channels.
                Our support team is available Monday to Friday, 9 AM - 6 PM EST.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Email</h4>
                    <p className="text-slate-600">kevin@speedyo.app</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Phone</h4>
                    <p className="text-slate-600">(800) 555-0199</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-slate-800">Headquarters</h4>
                    <p className="text-slate-600">
                      123 Automotive Ave, Suite 404, Detroit, MI 48226
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">
                  Frequently Asked Questions
                </h3>
                <p className="text-slate-600 mb-4">
                  Have a common question? You might find a quick answer on our FAQ page.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/FAQ">Visit FAQ Page</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}