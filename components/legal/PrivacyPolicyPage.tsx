import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Separator } from "@/components/ui/Separator";
import Footer from "@/components/layout/Footer";

const sections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "collection", title: "2. Information We Collect" },
  { id: "use", title: "3. How We Use Your Information" },
  { id: "sharing", title: "4. How We Share Your Information" },
  { id: "rights", title: "5. Your Data Protection Rights" },
  { id: "security", title: "6. Data Security" },
  { id: "children", title: "7. Children's Privacy" },
  { id: "contact", title: "8. Contact Us" },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <Button asChild variant="outline" className="mb-4 md:mb-0">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Speedyo
              </Link>
            </Button>
            <div className="text-sm text-slate-600">Last updated: January 15, 2025</div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Please read this Privacy Policy carefully to understand how we collect, use, and
              protect your personal information.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8">
            {/* Table of Contents Sidebar */}
            <div className="lg:sticky lg:top-8 lg:self-start order-last lg:order-first">
              <Card className="bg-white/80 backdrop-blur-sm shadow-md border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="min-w-0">
              <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl border-0 mb-8">
                <CardContent className="p-6 md:p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-blue-600 prose-li:marker:text-blue-600 prose-blockquote:border-l-blue-600 prose-code:bg-slate-100 prose-pre:bg-slate-50 prose-pre:p-4">
                  <section id="introduction" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">1. Introduction</h2>
                    <p>
                      Speedyo (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to
                      protecting your privacy. This Privacy Policy explains how we collect, use,
                      disclose, and safeguard your information when you use our Service. By using
                      the Service, you consent to the data practices described in this policy. This
                      policy is incorporated into our Terms of Service.
                    </p>
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of
                      any changes by posting the new Privacy Policy on this page and updating the
                      &quot;Last updated&quot; date. You are advised to review this Privacy Policy
                      periodically for any changes.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="collection" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      2. Information We Collect
                    </h2>
                    <p>We may collect personal information in the following ways:</p>
                    <ul>
                      <li>
                        <strong>Information You Provide to Us:</strong> This includes information
                        you provide when you register for an account, create a listing, or
                        communicate with us, such as your name, email address, phone number,
                        physical address, and payment information.
                      </li>
                      <li>
                        <strong>Information from Your Content:</strong> We collect information you
                        provide in your listings, posts, and messages, including vehicle details,
                        images, and communications with other users.
                      </li>
                      <li>
                        <strong>Information We Collect Automatically:</strong> When you use the
                        Service, we may automatically collect certain information, such as your IP
                        address, browser type, operating system, device information, and usage data
                        (pages visited, time spent on pages). We may use cookies and similar
                        tracking technologies to collect this information.
                      </li>
                      <li>
                        <strong>Information from Third Parties:</strong> We may receive information
                        from third parties, such as payment processors or social media platforms,
                        when you link your accounts or use third-party services in connection with
                        our Service.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="use" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      3. How We Use Your Information
                    </h2>
                    <p>We use the information we collect for various purposes, including to:</p>
                    <ul>
                      <li>Provide, operate, and maintain our Service.</li>
                      <li>Process your transactions and manage your subscriptions.</li>
                      <li>Improve, personalize, and expand our Service.</li>
                      <li>
                        Communicate with you, including for customer service, to provide you with
                        updates, and for marketing purposes.
                      </li>
                      <li>Improve, personalize, and expand our Service.</li>
                      <li>Monitor and analyze usage and trends to improve your experience.</li>
                      <li>Detect and prevent fraud and security issues.</li>
                      <li>Comply with legal obligations and enforce our Terms of Service.</li>
                      <li>
                        Send you targeted advertisements or promotional materials, with your
                        consent where required.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="sharing" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      4. How We Share Your Information
                    </h2>
                    <p>
                      We do not sell your personal information. We may share your information in
                      the following situations:
                    </p>
                    <ul>
                      <li>
                        <strong>With Other Users:</strong> When you create a listing or interact
                        with other users, certain information like your name and vehicle details
                        will be visible to them to facilitate communication and transactions.
                      </li>
                      <li>
                        <strong>With Service Providers:</strong> We may share your information with
                        third-party vendors and service providers who perform services for us, such
                        as payment processing (Stripe), cloud hosting, and email delivery. These
                        providers are required to maintain the confidentiality of your information.
                      </li>
                      <li>
                        <strong>For Legal Reasons:</strong> We may disclose your information if
                        required to do so by law or in response to valid requests by public
                        authorities (e.g., a court or a government agency).
                      </li>
                      <li>
                        <strong>To Protect Rights:</strong> We may disclose your information to
                        protect the rights, property, or safety of Speedyo, our users, or others.
                      </li>
                      <li>
                        <strong>In Business Transfers:</strong> If Speedyo is involved in a merger,
                        acquisition, or asset sale, your information may be transferred. We will
                        provide notice before your information is transferred and becomes subject
                        to a different Privacy Policy.
                      </li>
                    </ul>
                  </section>

                  <Separator className="my-8" />

                  <section id="rights" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      5. Your Data Protection Rights
                    </h2>
                    <p>
                      You have certain rights regarding your personal information, subject to local
                      law. These may include the right to:
                    </p>
                    <ul>
                      <li>Access, update, or delete the information we have on you.</li>
                      <li>Object to the processing of your personal information.</li>
                      <li>Request that we restrict the processing of your personal information.</li>
                      <li>Request a copy of your data in a portable format.</li>
                      <li>
                        Withdraw consent where we are relying on consent to process your personal
                        information.
                      </li>
                      <li>File a complaint with a data protection authority.</li>
                    </ul>
                    <p>
                      You can exercise these rights by accessing your account settings or by
                      contacting us directly at{" "}
                      <a href="mailto:support@speedio.com">support@speedio.com</a>. We may ask you
                      to verify your identity before responding to such requests.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="security" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">6. Data Security</h2>
                    <p>
                      We implement a variety of security measures to maintain the safety of your
                      personal information. However, no method of transmission over the Internet
                      or method of electronic storage is 100% secure. While we strive to use
                      commercially acceptable means to protect your personal information, we cannot
                      guarantee its absolute security. You are responsible for keeping your account
                      credentials secure.
                    </p>
                    <p>
                      We retain your personal information only for as long as necessary to fulfill
                      the purposes we collected it for, including for the purposes of satisfying
                      any legal, accounting, or reporting requirements.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="children" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">
                      7. Children&apos;s Privacy
                    </h2>
                    <p>
                      Our Service is not intended for use by children under the age of 18. We do
                      not knowingly collect personally identifiable information from children under
                      18. If we become aware that we have collected personal information from a
                      child under 18, we will take steps to delete such information. If you are a
                      parent or guardian and believe your child has provided us with personal
                      information, please contact us immediately.
                    </p>
                  </section>

                  <Separator className="my-8" />

                  <section id="contact" className="scroll-mt-0">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2">8. Contact Us</h2>
                    <p>
                      If you have any questions about this Privacy Policy, please contact us at{" "}
                      <a href="mailto:support@speedio.com">support@speedio.com</a>.
                    </p>
                    <p>
                      For data protection inquiries, you can also reach our Data Protection Officer
                      at the same email address.
                    </p>
                  </section>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

