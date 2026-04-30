"use client"
import React, { useState, useEffect } from 'react';
import { LiaisonApplication } from '@/entities/LiaisonApplication';
import { User } from '@/entities/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { invokeFunction } from '@/api/entities';

export default function LiaisonApplicationManager() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadApplications();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const allApplications = await LiaisonApplication.list("-created_date", 100);
      setApplications(allApplications);
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
    setIsLoading(false);
  };
  
  const handleStatusChange = async (application, newStatus) => {
    try {
      await LiaisonApplication.update(application.id, { status: newStatus });
      
      // Send email notification to applicant about status change
      if (currentUser && currentUser.email) {
        const statusMessages = {
          under_review: {
            subject: `Your application is under review - Speedio Liaison Position`,
            title: "Application Under Review",
            message: "We're currently reviewing your application for the Liaison Agent position. We'll update you soon with our decision."
          },
          approved: {
            subject: `Congratulations! Your application has been approved - Speedio Liaison Position`,
            title: "✅ Application Approved",
            message: "We're excited to inform you that your application has been approved! Our team will contact you shortly to discuss the next steps and onboarding process."
          },
          declined: {
            subject: `Application Update - Speedio Liaison Position`,
            title: "Application Status Update",
            message: "Thank you for your interest in the Liaison Agent position. After careful consideration, we've decided to move forward with other candidates at this time. We appreciate your interest in Speedio and encourage you to apply for future opportunities."
          }
        };

        const statusInfo = statusMessages[newStatus];
        if (statusInfo) {
          await invokeFunction('sendEmail', {
            to: application.email,
            subject: statusInfo.subject,
            fromName: 'Speedio Team',
            fromAddress: 'hello@speedio.app',
            html: `<table width="100%" bgcolor="#f5f7fa" style="padding:20px;">
                    <tr>
                      <td align="center">
                        <table width="600" style="background:#ffffff;border-radius:12px;padding:20px;font-family:sans-serif;color:#333;">
                          <tr>
                            <td align="center" style="padding-bottom:20px;">
                              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" width="140">
                            </td>
                          </tr>
                          <tr>
                            <td>
                              <h2 style="color:#007BFF;">${statusInfo.title}</h2>
                              <p>Hi ${application.full_name},</p>
                              <p>${statusInfo.message}</p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:15px;background:#f5f7fa;border-radius:8px;">
                              <p><strong>Application ID:</strong> #${application.id}</p>
                              <p><strong>Status:</strong> <span style="background:${newStatus === 'approved' ? '#28A745' : newStatus === 'under_review' ? '#FFC107' : '#6C757D'};color:#fff;padding:4px 8px;border-radius:4px;">${newStatus.replace('_', ' ').toUpperCase()}</span></p>
                              <p><strong>Updated:</strong> ${new Date().toLocaleDateString()}</p>
                            </td>
                          </tr>
                          <tr>
                            <td align="center" style="padding:20px;">
                              <p style="color:#666;font-size:12px;">Questions? Contact us at kevin@speedio.app</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>`
          });

          alert('Status updated and email sent successfully!');
        }
      }

      loadApplications();
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert('Failed to update application status. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending_review: "bg-amber-100 text-amber-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-emerald-100 text-emerald-800",
      declined: "bg-red-100 text-red-800",
    };
    return (
      <Badge className={colors[status] || colors.pending_review}>{status.replace('_', ' ').toUpperCase()}</Badge>
    );
  };

  const getProficiencyLabel = (proficiency) => {
    const labels = {
      native_both: 'Native in Both',
      fluent_both: 'Fluent in Both',
      business_level: 'Business Level'
    };
    return labels[proficiency] || proficiency;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle>Liaison Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Language Proficiency</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applications.map(application => (
              <TableRow key={application.id}>
                <TableCell>
                  <div className="font-medium">{application.full_name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{application.email}</div>
                  <div className="text-sm text-slate-500">{application.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{getProficiencyLabel(application.language_proficiency)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{format(new Date(application.created_date), 'MMM d, yyyy')}</div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(application.status)}
                </TableCell>
                <TableCell>
                  <Select 
                    value={application.status} 
                    onValueChange={(value) => handleStatusChange(application, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}