import React from "react";

export default function ManagedSaleRequestSubmittedEmail({
  full_name,
  request_id,
  app_url,
}: {
  full_name: string;
  request_id: string;
  app_url: string;
}) {
  const managedUrl = `${app_url}/Dashboard`;

  return (
    <div style={{ fontFamily: 'Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial', color: '#0f172a' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 24, background: '#ffffff' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>Thanks — we received your request</h1>
        <p style={{ marginTop: 12, color: '#334155' }}>
          Hi {full_name},
        </p>
        <p style={{ color: '#334155' }}>
          Thanks for submitting your managed sale request. We've received your request (ID: {request_id}) and our team will review it within 24-48 hours.
        </p>

        <div style={{ marginTop: 12, padding: 12, background: '#ecfeff', borderRadius: 8 }}>
          <strong style={{ color: '#065f46' }}>What happens next</strong>
          <ul style={{ marginTop: 8, color: '#065f46' }}>
            <li>Our team reviews your request and verifies the details.</li>
            <li>If approved, we will create and publish a professional listing for your vehicle.</li>
            <li>We will contact you with any questions or next steps.</li>
          </ul>
        </div>

        <p style={{ marginTop: 16, color: '#334155' }}>
          You can view your request and its status from your dashboard:
        </p>

        <p style={{ marginTop: 8 }}>
          <a href={managedUrl} style={{ display: 'inline-block', padding: '10px 16px', background: 'linear-gradient(90deg,#3b82f6,#10b981)', color: '#fff', borderRadius: 6, textDecoration: 'none' }}>View in Dashboard</a>
        </p>

        <p style={{ marginTop: 20, color: '#64748b', fontSize: 13 }}>
          If you didn't submit this request or have questions, reply to this email and our support team will assist you.
        </p>

        <p style={{ marginTop: 24, color: '#94a3b8', fontSize: 12 }}>
          — The Speedyo Team
        </p>
      </div>
    </div>
  );
}
