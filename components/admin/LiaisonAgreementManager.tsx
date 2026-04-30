"use client"
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LiaisonAgreement } from '@/entities/LiaisonAgreement';
import { LiaisonApplication } from '@/entities/LiaisonApplication';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Download,
  Eye,
  Send,
  XCircle,
  Loader2,
  Copy, // Keep ExternalLink in imports in case it's used elsewhere or for future features
  UserCheck
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { invokeFunction } from '@/api/entities';
import { format } from 'date-fns';

export default function LiaisonAgreementManager() {
  const [agreements, setAgreements] = useState([]);
  const [applications, setApplications] = useState([]); // New state for applications
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    agreement_title: 'Speedio Dealership Partnership Liaison Agreement',
    position_title: 'Liaison Agent',
    fixed_fee_percentage: 10,
    residual_pay_percentage: 3,
    agreement_start_date: new Date().toISOString().split('T')[0],
    agreement_end_date: '',
    termination_notice_days: 30,
    admin_notes: ''
  });

  useEffect(() => {
    fetchAgreementsAndApplications(); // Modified to fetch both
  }, []);

  const fetchAgreementsAndApplications = async () => { // Renamed function
    try {
      const agreementsData = await LiaisonAgreement.list('-created_date');
      const applicationsData = await LiaisonApplication.list(); // Fetch all applications

      const updatedAgreements = await Promise.all(
        agreementsData.map(async (agreement) => {
          if (agreement.agreement_url && agreement.agreement_url.includes('SignLiaisonAgreement')) {
            const newUrl = agreement.agreement_url.replace('SignLiaisonAgreement', 'LiaisonAgreement');
            try {
              await LiaisonAgreement.update(agreement.id, { agreement_url: newUrl });
              return { ...agreement, agreement_url: newUrl };
            } catch (error) {
              console.error(`Failed to update agreement URL for ${agreement.id}:`, error);
              return agreement;
            }
          }
          return agreement;
        })
      );
      
      setAgreements(updatedAgreements);
      setApplications(applicationsData); // Set applications state
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      agreement_title: 'Speedio Dealership Partnership Liaison Agreement',
      position_title: 'Liaison Agent',
      fixed_fee_percentage: 10,
      residual_pay_percentage: 3,
      agreement_start_date: new Date().toISOString().split('T')[0],
      agreement_end_date: '',
      termination_notice_days: 30,
      admin_notes: ''
    });
  };

  const handleCreateAgreement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUser = await base44.auth.me();
      
      const newAgreement = await LiaisonAgreement.create({
        ...formData,
        created_by_admin_id: currentUser.id,
        status: 'pending_signature'
      });

      const signingUrl = createPageUrl(`LiaisonAgreement?id=${newAgreement.id}`);

      await LiaisonAgreement.update(newAgreement.id, {
        agreement_url: signingUrl
      });

      await fetchAgreementsAndApplications(); // Refetch all data after creation
      setShowCreateModal(false);
      resetForm();
      alert('Agreement created successfully! Share the link with potential liaisons.');
    } catch (error) {
      console.error('Failed to create agreement:', error);
      alert('Failed to create agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAgreementLink = (agreement) => {
    const fullUrl = `https://speedio.app${createPageUrl(`LiaisonAgreement?id=${agreement.id}`)}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Agreement link copied to clipboard!');
  };

  const handleDownloadPDF = async (agreement) => {
    try {
      const response = await invokeFunction<{ url?: string }>('generateLiaisonAgreementPDF', {
        agreementId: agreement.id
      });
      
      if (response?.url) {
        window.open(response.url, "_blank", "noopener,noreferrer");
        return;
      }
      alert("PDF generation is not configured yet.");
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const viewApplication = async (applicationId) => {
    try {
      // Use the already fetched applications list first, then fall back to API if not found
      const appFromState = applications.find(app => app.id === applicationId);
      let foundApplication = appFromState;

      if (!foundApplication) {
        const apps = await LiaisonApplication.filter({ id: applicationId });
        if (apps && apps.length > 0) {
          foundApplication = apps[0];
          // Optionally update applications state if a new one was fetched
          setApplications(prev => {
            if (!prev.some(app => app.id === foundApplication.id)) {
              return [...prev, foundApplication];
            }
            return prev;
          });
        }
      }

      if (foundApplication) {
        const associatedAgreement = agreements.find(ag => ag.application_id === applicationId);
        if (associatedAgreement) {
          setSelectedAgreement({ ...associatedAgreement, application: foundApplication });
        } else {
          console.warn('Associated agreement not found for application ID:', applicationId);
          alert('Associated agreement not found for this application.');
        }
      } else {
        alert('Application details not found.');
      }
    } catch (error) {
      console.error('Failed to load application:', error);
      alert('Failed to load application details.');
    }
  };

  const handleSendApplicationEmail = async (agreement) => {
    try {
      setIsSubmitting(true);
      
      // Fetch the application
      if (!agreement.application_id) {
        alert('No application found for this agreement.');
        return;
      }

      const application = await LiaisonApplication.get(agreement.application_id);
      
      if (!application) {
        alert('Application not found.');
        return;
      }

      // Generate the correct URL - always use LiaisonAgreement page
      const viewUrl = `https://speedio.app/LiaisonAgreement?id=${agreement.id}`;
      
      await invokeFunction('sendEmail', {
        to: application.email,
        subject: 'Your Speedio Liaison Agreement & Application',
        fromName: 'Speedio Team',
        fromAddress: 'hello@speedio.app',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" style="width: 140px; filter: brightness(0) invert(1);">
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Your Liaison Agreement & Application</h2>
              
              <p style="color: #475569; margin-bottom: 20px;">
                Hello ${application.full_name},
              </p>
              
              <p style="color: #475569; margin-bottom: 20px;">
                Thank you for your interest in becoming a Speedio Liaison Agent. This email contains a summary of your agreement and application.
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Agreement Details:</h3>
                <p style="margin: 8px 0;"><strong>Position:</strong> ${agreement.position_title}</p>
                <p style="margin: 8px 0;"><strong>Fixed Fee:</strong> ${agreement.fixed_fee_percentage}% of service fee</p>
                <p style="margin: 8px 0;"><strong>Residual Pay:</strong> ${agreement.residual_pay_percentage}% for subsequent sales</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> ${agreement.status.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Your Application:</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${application.full_name}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${application.email}</p>
                <p style="margin: 8px 0;"><strong>Phone:</strong> ${application.phone}</p>
                <p style="margin: 8px 0;"><strong>Language Proficiency:</strong> ${application.language_proficiency}</p>
                <p style="margin: 8px 0;"><strong>Application Status:</strong> ${application.status.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <p style="color: #475569; margin-bottom: 20px;">
                You can view your agreement and application at any time by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${viewUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Agreement
                </a>
              </div>
              
              <p style="color: #475569; margin-top: 30px;">
                If you have any questions, please don't hesitate to reach out.
              </p>
              
              <p style="color: #475569; margin-top: 20px;">
                Best regards,<br>
                <strong>The Speedio Team</strong>
              </p>
            </div>
            
            <div style="padding: 20px; background: #f1f5f9; text-align: center; color: #64748b; font-size: 14px;">
              <p style="margin: 0;">© 2025 Speedio. All rights reserved.</p>
            </div>
          </div>
        `
      });

      alert('Application email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (agreementId) => {
    if (window.confirm('Are you sure you want to delete this agreement? This action cannot be undone.')) {
      try {
        await LiaisonAgreement.delete(agreementId);
        await fetchAgreementsAndApplications(); // Use the combined fetch function
        alert('Agreement deleted successfully!');
      } catch (error) {
        console.error('Failed to delete agreement:', error);
        alert('Failed to delete agreement. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Liaison Agreements</h2>
          <p className="text-slate-600">Manage partnership agreements with dealership liaisons</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Liaison Agreement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAgreement} className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="agreement_title">Agreement Title</Label>
                  <Input
                    id="agreement_title"
                    name="agreement_title"
                    value={formData.agreement_title}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="position_title">Position Title</Label>
                  <Input
                    id="position_title"
                    name="position_title"
                    value={formData.position_title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fixed_fee_percentage">Fixed Fee Percentage (%)</Label>
                    <Input
                      id="fixed_fee_percentage"
                      name="fixed_fee_percentage"
                      type="number"
                      value={formData.fixed_fee_percentage}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="residual_pay_percentage">Residual Pay Percentage (%)</Label>
                    <Input
                      id="residual_pay_percentage"
                      name="residual_pay_percentage"
                      type="number"
                      value={formData.residual_pay_percentage}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agreement_start_date">Agreement Start Date</Label>
                    <Input
                      id="agreement_start_date"
                      name="agreement_start_date"
                      type="date"
                      value={formData.agreement_start_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="agreement_end_date">Agreement End Date</Label>
                    <Input
                      id="agreement_end_date"
                      name="agreement_end_date"
                      type="date"
                      value={formData.agreement_end_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="termination_notice_days">Termination Notice (Days)</Label>
                  <Input
                    id="termination_notice_days"
                    name="termination_notice_days"
                    type="number"
                    value={formData.termination_notice_days}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="admin_notes">Admin Notes</Label>
                  <Textarea
                    id="admin_notes"
                    name="admin_notes"
                    value={formData.admin_notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Agreement'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {agreements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">Create your first liaison agreement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agreements.map((agreement) => {
            const associatedApplication = applications.find(app => app.id === agreement.application_id);
            
            return (
              <Card key={agreement.id} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800">{agreement.position_title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Fixed Fee: {agreement.fixed_fee_percentage}% | Residual: {agreement.residual_pay_percentage}%
                      </p>
                    </div>
                    <Badge
                      className={
                        agreement.status === 'signed'
                          ? 'bg-green-100 text-green-800'
                          : agreement.status === 'pending_signature'
                          ? 'bg-amber-100 text-amber-800'
                          : agreement.status === 'terminated'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-800'
                      }
                    >
                      {agreement.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-slate-500">Start Date:</span>
                      <p className="text-slate-700">
                        {agreement.agreement_start_date
                          ? format(new Date(agreement.agreement_start_date), 'MMM d, yyyy')
                          : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Created:</span>
                      <p className="text-slate-700">{format(new Date(agreement.created_date), 'MMM d, yyyy')}</p>
                    </div>
                    {agreement.application_id && (
                      <div className="col-span-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewApplication(agreement.application_id)}
                          className="w-full"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          View Submitted Application
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {agreement.agreement_url && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyAgreementLink(agreement)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                        <Link to={createPageUrl(`LiaisonAgreement?id=${agreement.id}`)}>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Agreement
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    {agreement.status === 'signed' && agreement.application_id && associatedApplication && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendApplicationEmail(agreement)}
                        disabled={isSubmitting} // Use the general isSubmitting state
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Email
                      </Button>
                    )}

                    {agreement.status === 'signed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadPDF(agreement)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(agreement.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {selectedAgreement && selectedAgreement.application && (
        <Dialog open={!!selectedAgreement} onOpenChange={() => setSelectedAgreement(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Liaison Application Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-600">Full Name</Label>
                  <p className="font-medium">{selectedAgreement.application.full_name}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Email</Label>
                  <p className="font-medium">{selectedAgreement.application.email}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Phone</Label>
                  <p className="font-medium">{selectedAgreement.application.phone}</p>
                </div>
                <div>
                  <Label className="text-slate-600">Language Proficiency</Label>
                  <p className="font-medium">{selectedAgreement.application.language_proficiency?.replace('_', ' ')}</p>
                </div>
              </div>
              {selectedAgreement.application.address && (
                <div>
                  <Label className="text-slate-600">Address</Label>
                  <p className="font-medium">{selectedAgreement.application.address}</p>
                </div>
              )}
              {selectedAgreement.application.previous_experience && (
                <div>
                  <Label className="text-slate-600">Previous Experience</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.previous_experience}</p>
                </div>
              )}
              {selectedAgreement.application.automotive_knowledge && (
                <div>
                  <Label className="text-slate-600">Automotive Knowledge</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.automotive_knowledge}</p>
                </div>
              )}
              {selectedAgreement.application.availability && (
                <div>
                  <Label className="text-slate-600">Availability</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.availability}</p>
                </div>
              )}
              {selectedAgreement.application.motivation && (
                <div>
                  <Label className="text-slate-600">Motivation</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.motivation}</p>
                </div>
              )}
              {selectedAgreement.application.resume_url && (
                <div>
                  <Label className="text-slate-600">Resume/CV</Label>
                  <a
                    href={selectedAgreement.application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </a>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
