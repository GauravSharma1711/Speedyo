"use client"
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PhotographerAgreement } from '@/entities/PhotographerAgreement';
import { PhotographerApplication } from '@/entities/PhotographerApplication';
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
  Camera,
  Plus,
  Download,
  Eye,
  Send,
  XCircle,
  Loader2,
  Copy,
  UserCheck
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function PhotographerAgreementManager() {
  const [agreements, setAgreements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    agreement_title: 'Speedio Photographer Partnership Agreement',
    position_title: 'Automotive Photographer - Speedio Platform',
    fixed_percentage: 10,
    agreement_start_date: new Date().toISOString().split('T')[0],
    agreement_end_date: '',
    termination_notice_days: 30,
    admin_notes: '',
    email: '' // Added email field for sending agreements
  });

  useEffect(() => {
    fetchAgreementsAndApplications();
  }, []);

  const fetchAgreementsAndApplications = async () => {
    try {
      const [agreementsData, applicationsData] = await Promise.all([
        PhotographerAgreement.list('-created_date'),
        PhotographerApplication.list()
      ]);

      const updatedAgreements = await Promise.all(
        agreementsData.map(async (agreement) => {
          if (agreement.agreement_url && agreement.agreement_url.includes('SignPhotographerAgreement')) {
            const newUrl = agreement.agreement_url.replace('SignPhotographerAgreement', 'PhotographerAgreement');
            try {
              await PhotographerAgreement.update(agreement.id, { agreement_url: newUrl });
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
      setApplications(applicationsData);
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
      agreement_title: 'Speedio Photographer Partnership Agreement',
      position_title: 'Automotive Photographer - Speedio Platform',
      fixed_percentage: 10,
      agreement_start_date: new Date().toISOString().split('T')[0],
      agreement_end_date: '',
      termination_notice_days: 30,
      admin_notes: '',
      email: '' // Reset email field
    });
  };

  const handleCreateAgreement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const currentUser = await base44.auth.me();
      
      // Create with status: 'draft' so it can be sent later
      const newAgreement = await PhotographerAgreement.create({
        ...formData,
        created_by_admin_id: currentUser.id,
        status: 'draft' // Initial status is draft
      });

      const signingUrl = createPageUrl(`PhotographerAgreement?id=${newAgreement.id}`);

      await PhotographerAgreement.update(newAgreement.id, {
        agreement_url: signingUrl
      });

      await fetchAgreementsAndApplications();
      setShowCreateModal(false);
      resetForm();
      alert('Agreement created successfully as a draft! You can now send it for signature.');
    } catch (error) {
      console.error('Failed to create agreement:', error);
      alert('Failed to create agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAgreementLink = (agreement) => {
    const fullUrl = `https://speedio.app${createPageUrl(`PhotographerAgreement?id=${agreement.id}`)}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Agreement link copied to clipboard!');
  };

  const handleDownloadPDF = async (agreement) => {
    try {
      const response = await base44.functions.invoke('generatePhotographerAgreementPDF', {
        agreementId: agreement.id
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Photographer_Agreement_${agreement.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const viewApplication = async (applicationId) => {
    try {
      const appFromState = applications.find(app => app.id === applicationId);
      let foundApplication = appFromState;

      if (!foundApplication) {
        const apps = await PhotographerApplication.filter({ id: applicationId });
        if (apps && apps.length > 0) {
          foundApplication = apps[0];
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

  const handleSendSigningEmail = async (agreement) => {
    if (!agreement.agreement_url) {
      alert('Agreement URL not found. Please try recreating the agreement.');
      return;
    }
    if (!agreement.email) {
      alert('Photographer email not found for this agreement. Please ensure an email is set when creating the agreement.');
      return;
    }

    setIsSubmitting(true);

    try {
      const signingUrl = `https://speedio.app${agreement.agreement_url}`;

      await base44.functions.invoke('sendEmail', {
        to: agreement.email, // Use the email from the agreement
        subject: 'Speedio Photographer Partnership - Complete Your Application',
        fromName: 'Speedio Team',
        fromAddress: 'hello@speedio.app',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" style="width: 140px; filter: brightness(0) invert(1);">
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #2563eb;">Join Our Photographer Network</h2>
              <p>Hello,</p>
              <p>We're excited to invite you to become a photographer for Speedio! Our platform connects skilled automotive photographers with dealerships and sellers.</p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Agreement Details:</h3>
                <p style="margin: 8px 0;"><strong>Position:</strong> ${agreement.position_title}</p>
                <p style="margin: 8px 0;"><strong>Compensation:</strong> ${agreement.fixed_percentage}% of service fee per vehicle photographed and sold</p>
                <p style="margin: 8px 0;"><strong>Minimum Photos:</strong> 5 high-resolution photos per vehicle</p>
              </div>
              
              <p>Click the button below to review the agreement and submit your application:</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${signingUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Review Agreement & Apply
                </a>
              </p>
              
              <p>If you have any questions, please don't hesitate to reach out.</p>
              <p>Best regards,<br><strong>The Speedio Team</strong></p>
            </div>
            
            <div style="padding: 20px; background: #f1f5f9; text-align: center; color: #64748b; font-size: 14px;">
              <p style="margin: 0;">© 2025 Speedio. All rights reserved.</p>
            </div>
          </div>
        `
      });

      // Update status to pending_signature
      await PhotographerAgreement.update(agreement.id, {
        status: 'pending_signature'
      });

      await fetchAgreementsAndApplications();
      alert('Agreement sent successfully!');
    } catch (error) {
      console.error('Failed to send agreement:', error);
      alert('Failed to send agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendApplicationEmail = async (agreement) => {
    try {
      setIsSubmitting(true);
      
      if (!agreement.application_id) {
        alert('No application found for this agreement.');
        return;
      }

      const application = await PhotographerApplication.get(agreement.application_id);
      
      if (!application) {
        alert('Application not found.');
        return;
      }

      const viewUrl = `https://speedio.app/PhotographerAgreement?id=${agreement.id}`;
      
      await base44.functions.invoke('sendEmail', {
        to: application.email,
        subject: 'Your Speedio Photographer Agreement & Application',
        fromName: 'Speedio Team',
        fromAddress: 'hello@speedio.app',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" style="width: 140px; filter: brightness(0) invert(1);">
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Your Photographer Agreement & Application</h2>
              
              <p style="color: #475569; margin-bottom: 20px;">
                Hello ${application.full_name},
              </p>
              
              <p style="color: #475569; margin-bottom: 20px;">
                Thank you for your interest in becoming a Speedio Photographer. This email contains a summary of your agreement and application.
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Agreement Details:</h3>
                <p style="margin: 8px 0;"><strong>Position:</strong> ${agreement.position_title}</p>
                <p style="margin: 8px 0;"><strong>Compensation:</strong> ${agreement.fixed_percentage}% of service fee per vehicle photographed and sold</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> ${agreement.status.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Your Application:</h3>
                <p style="margin: 8px 0;"><strong>Name:</strong> ${application.full_name}</p>
                <p style="margin: 8px 0;"><strong>Email:</strong> ${application.email}</p>
                <p style="margin: 8px 0;"><strong>Phone:</strong> ${application.phone}</p>
                <p style="margin: 8px 0;"><strong>Experience:</strong> ${application.photography_experience_years} years</p>
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
        await PhotographerAgreement.delete(agreementId);
        await fetchAgreementsAndApplications();
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
          <h2 className="text-2xl font-bold text-slate-800">Photographer Agreements</h2>
          <p className="text-slate-600">Manage partnership agreements with automotive photographers</p>
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
              <DialogTitle>Create New Photographer Agreement</DialogTitle>
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position_title">Position Title</Label>
                  <Input
                    id="position_title"
                    name="position_title"
                    value={formData.position_title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Photographer Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">Email address of the photographer to send the agreement to</p>
                </div>
                <div>
                  <Label htmlFor="fixed_percentage">Compensation Percentage (%)</Label>
                  <Input
                    id="fixed_percentage"
                    name="fixed_percentage"
                    type="number"
                    value={formData.fixed_percentage}
                    onChange={handleInputChange}
                    required
                  />
                  <p className="text-sm text-slate-500 mt-1">Percentage of service fee per vehicle photographed and sold</p>
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
                      required
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
                    required
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
            <Camera className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">Create your first photographer agreement</p>
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
                        Compensation: {agreement.fixed_percentage}% of service fee per vehicle photographed and sold
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
                        <Link to={createPageUrl(`PhotographerAgreement?id=${agreement.id}`)}>
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

                    {agreement.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendSigningEmail(agreement)}
                        disabled={isSubmitting}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Send Agreement
                      </Button>
                    )}
                    
                    {agreement.status === 'signed' && agreement.application_id && associatedApplication && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendApplicationEmail(agreement)}
                        disabled={isSubmitting}
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
              <DialogTitle>Photographer Application Details</DialogTitle>
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
                  <Label className="text-slate-600">Experience (Years)</Label>
                  <p className="font-medium">{selectedAgreement.application.photography_experience_years}</p>
                </div>
              </div>
              {selectedAgreement.application.address && (
                <div>
                  <Label className="text-slate-600">Address</Label>
                  <p className="font-medium">{selectedAgreement.application.address}</p>
                </div>
              )}
              {selectedAgreement.application.automotive_photography_experience && (
                <div>
                  <Label className="text-slate-600">Automotive Photography Experience</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.automotive_photography_experience}</p>
                </div>
              )}
              {selectedAgreement.application.equipment && (
                <div>
                  <Label className="text-slate-600">Equipment</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.equipment}</p>
                </div>
              )}
              {selectedAgreement.application.availability && (
                <div>
                  <Label className="text-slate-600">Availability</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.availability}</p>
                </div>
              )}
              {selectedAgreement.application.location_preferences && (
                <div>
                  <Label className="text-slate-600">Location Preferences</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.location_preferences}</p>
                </div>
              )}
              {selectedAgreement.application.motivation && (
                <div>
                  <Label className="text-slate-600">Motivation</Label>
                  <p className="text-slate-700 whitespace-pre-wrap">{selectedAgreement.application.motivation}</p>
                </div>
              )}
              {selectedAgreement.application.portfolio_url && (
                <div>
                  <Label className="text-slate-600">Portfolio</Label>
                  <a
                    href={selectedAgreement.application.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    View Portfolio
                  </a>
                </div>
              )}
              {selectedAgreement.application.sample_work_urls && selectedAgreement.application.sample_work_urls.length > 0 && (
                <div>
                  <Label className="text-slate-600">Sample Work</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {selectedAgreement.application.sample_work_urls.map((url, index) => (
                      <img key={index} src={url} alt={`Sample ${index + 1}`} className="w-full h-32 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
