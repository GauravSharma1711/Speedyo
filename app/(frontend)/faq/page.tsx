"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/Accordion";
import Footer from "@/components/layout/Footer";

const faqs = {
  General: [
    {
      question: "What is Speedio?",
      answer:
        "Speedio is a comprehensive automotive marketplace and social community platform. We connect car buyers, sellers, and enthusiasts, providing powerful tools for transactions and a vibrant space for sharing automotive passion.",
    },
    {
      question: "Is it free to join Speedio?",
      answer:
        "Yes, creating an account, browsing listings, and participating in the community feed is completely free. We offer paid services for sellers, such as one-time listing fees for private sellers and subscription plans for dealerships.",
    },
  ],
  "For Buyers": [
    {
      question: "How do I know a listing is trustworthy?",
      answer:
        "We encourage sellers to opt for our 'Verified Vehicle' service, which includes a professional inspection. Look for the 'Verified' badge on listings. Additionally, our secure messaging system allows you to communicate safely with sellers before meeting.",
    },
    {
      question: "How do I request a test drive?",
      answer:
        "You can request a test drive directly from the vehicle listing page or through the chat interface when messaging a seller. This sends a formal request to the seller with your preferred time and location.",
    },
  ],
  "For Sellers": [
    {
      question: "What is the 'Managed Sale' service?",
      answer:
        "Our Managed Sale service is the ultimate hassle-free way to sell your car. We handle everything: professional photography, listing creation, marketing, buyer inquiries, negotiations, and secure payment processing. You set the price you want, and we add our service fee on top, so it costs you nothing out-of-pocket.",
    },
    {
      question: "What are the fees for selling a car?",
      answer:
        "Private sellers can list a single vehicle for a one-time fee of $50. Dealerships have monthly subscription plans with different listing limits and features. For our Managed Sale service, we add a 6% service fee to your asking price, which is paid by the buyer.",
    },
  ],
} as const;

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-slate-600">
                Find answers to common questions about buying, selling, and
                connecting on Speedio.
              </p>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-6 md:p-8">
                {Object.entries(faqs).map(([category, questions]) => (
                  <div key={category} className="mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6 pb-2 border-b-2 border-blue-200">
                      {category}
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                      {questions.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${category}-${index}`}
                        >
                          <AccordionTrigger className="text-lg text-left hover:no-underline">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-slate-700 text-base leading-relaxed">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

