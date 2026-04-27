
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DealershipVehicleAgreement } from '@/entities/DealershipVehicleAgreement'; // Entity name remains as per original file structure
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
  Eye,
  Send,
  XCircle,
  Loader2,
  Copy
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function DealershipAgreementManager() {
  const [agreements, setAgreements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dealership_name: '',
    representative_name: '',
    address: '',
    phone: '',
    email: '',
    license_number: '',
    service_fee_amount: null, // Changed to null to indicate "varies"
    admin_notes: ''
  });

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    setIsLoading(true);
    try {
      const data = await DealershipVehicleAgreement.list('-created_date');
      setAgreements(data);
    } catch (error) {
      console.error('Failed to fetch agreements:', error);
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

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateAgreement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newAgreement = await DealershipVehicleAgreement.create({
        ...formData,
        status: 'draft'
      });

      // Generate signing URL - USE RELATIVE PATH FOR REACT ROUTER
      const signingUrl = createPageUrl(`SignAgreement?id=${newAgreement.id}`);

      await DealershipVehicleAgreement.update(newAgreement.id, {
        agreement_url: signingUrl
      });

      setShowCreateModal(false);
      resetForm();
      fetchAgreements();

      alert('Agreement created successfully!');
    } catch (error) {
      console.error('Failed to create agreement:', error);
      alert('Failed to create agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendSigningEmail = async (agreement) => {
    if (!agreement.email) {
      alert('No email address found for this dealership.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const signingUrl = `https://speedio.app/SignAgreement?id=${agreement.id}`;

      await base44.functions.invoke('sendEmail', {
        to: agreement.email,
        subject: 'Speedio Managed Sales Service Agreement - Action Required',
        fromName: 'Speedio Team',
        fromAddress: 'hello@speedio.app',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" style="width: 140px; filter: brightness(0) invert(1);">
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #2563eb;">Managed Sales Service Agreement Ready for Signature</h2>
              <p>Dear ${agreement.representative_name},</p>
              <p>Your managed sales service agreement for <strong>${agreement.dealership_name}</strong> is ready for your review and signature.</p>
              <p><strong>Agreement Details:</strong></p>
              <ul>
                <li>Dealership: ${agreement.dealership_name}</li>
                <li>Service Fee: Varies per vehicle listing</li>
              </ul>
              <p>This agreement will allow you to list vehicles on our platform with our managed sales service.</p>
              <p>Please review and sign the agreement by clicking the link below:</p>
              <p>
                <a href="${signingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                  Review & Sign Agreement
                </a>
              </p>
              <p>If you have any questions, please don't hesitate to reach out.</p>
              <p>Best regards,<br>The Speedio Team</p>
            </div>
            
            <div style="padding: 20px; background: #f1f5f9; text-align: center; color: #64748b; font-size: 14px;">
              <p style="margin: 0;">© 2025 Speedio. All rights reserved.</p>
            </div>
          </div>
        `
      });

      // Update status to pending_signature if it was draft
      if (agreement.status === 'draft') {
        await DealershipVehicleAgreement.update(agreement.id, {
          status: 'pending_signature'
        });
        fetchAgreements(); // Re-fetch to update status display
      }

      alert('Agreement sent successfully!');
    } catch (error) {
      console.error('Failed to send agreement:', error);
      alert('Failed to send agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAgreementLink = (agreement) => {
    // For external sharing (email, etc.), use full URL
    const fullUrl = `https://speedio.app${agreement.agreement_url}`;
    navigator.clipboard.writeText(fullUrl);
    alert('Agreement link copied to clipboard!');
  };

  const handleSendAgreementEmail = async (agreement) => {
    if (!agreement.email) {
      alert('No email address found for this dealership.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Generate the correct URL based on agreement status
      const viewUrl = agreement.status === 'signed' 
        ? `https://speedio.app/ViewDealershipAgreement?id=${agreement.id}`
        : `https://speedio.app/SignAgreement?id=${agreement.id}`;
      
      await base44.functions.invoke('sendEmail', {
        to: agreement.email,
        subject: 'Your Speedio Managed Sales Service Agreement',
        fromName: 'Speedio Team',
        fromAddress: 'hello@speedio.app',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f1a874100_speedio_logo_official.png" alt="Speedio" style="width: 140px; filter: brightness(0) invert(1);">
            </div>
            
            <div style="padding: 30px; background: #ffffff;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Your Managed Sales Service Agreement</h2>
              
              <p style="color: #475569; margin-bottom: 20px;">
                Hello ${agreement.representative_name},
              </p>
              
              <p style="color: #475569; margin-bottom: 20px;">
                ${agreement.status === 'signed' 
                  ? `Thank you for signing the managed sales service agreement for ${agreement.dealership_name}. You can now list vehicles on our platform with our managed sales service.`
                  : `Thank you for your interest in our managed sales service for ${agreement.dealership_name}.`
                }
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">Agreement Details:</h3>
                <p style="margin: 8px 0;"><strong>Dealership:</strong> ${agreement.dealership_name}</p>
                <p style="margin: 8px 0;"><strong>Representative:</strong> ${agreement.representative_name}</p>
                <p style="margin: 8px 0;"><strong>Service Fee:</strong> Varies per vehicle listing</p>
                <p style="margin: 8px 0;"><strong>Status:</strong> ${agreement.status.replace('_', ' ').toUpperCase()}</p>
              </div>
              
              <p style="color: #475569; margin-bottom: 20px;">
                You can view your agreement at any time by clicking the button below:
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

      alert('Agreement email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAgreement = async (agreement) => {
    try {
      const response = await base44.functions.invoke('generateAgreementPDF', {
        agreementId: agreement.id
      });

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Agreement_${agreement.dealership_name}_Managed_Sales.pdf`; // Updated filename
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Failed to download agreement:', error);
      alert('Failed to download agreement. Please try again.');
    }
  };

  const handleDelete = async (agreementId) => {
    if (window.confirm('Are you sure you want to delete this agreement? This action cannot be undone.')) {
      try {
        setIsSubmitting(true);
        await DealershipVehicleAgreement.delete(agreementId);
        fetchAgreements();
        alert('Agreement deleted successfully!');
      } catch (error) {
        console.error('Failed to delete agreement:', error);
        alert('Failed to delete agreement. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      dealership_name: '',
      representative_name: '',
      address: '',
      phone: '',
      email: '',
      license_number: '',
      service_fee_amount: null,
      admin_notes: ''
    });
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
          <h2 className="text-2xl font-bold text-slate-800">Dealership Managed Sales Agreements</h2>
          <p className="text-slate-600">Manage dealership agreements for managed sales service</p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Dealership Managed Sales Agreement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAgreement} className="space-y-6">
              {/* Dealership Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Dealership Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dealership_name">Dealership Name *</Label>
                    <Input
                      id="dealership_name"
                      name="dealership_name"
                      value={formData.dealership_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="representative_name">Representative Name *</Label>
                    <Input
                      id="representative_name"
                      name="representative_name"
                      value={formData.representative_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="license_number">Business License Number</Label>
                    <Input
                      id="license_number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Service Terms */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-slate-800">Service Terms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_fee_amount">Service Fee (USD) per Vehicle</Label>
                    <Input
                      id="service_fee_amount"
                      name="service_fee_amount"
                      type="number"
                      step="1"
                      placeholder="Varies"
                      value={formData.service_fee_amount || ''}
                      onChange={handleInputChange}
                    />
                    <p className="text-sm text-slate-500 mt-1">Leave empty if fee varies per vehicle</p>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="admin_notes">Admin Notes (Internal Only)</Label>
                    <Textarea
                      id="admin_notes"
                      name="admin_notes"
                      value={formData.admin_notes}
                      onChange={handleInputChange}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Agreement
                    </>
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
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium mb-2">No agreements yet</p>
            <p className="text-sm text-slate-400">Create your first dealership managed sales agreement</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {agreements.map((agreement) => (
            <Card key={agreement.id} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800">{agreement.dealership_name}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Representative: {agreement.representative_name}
                    </p>
                  </div>
                  <Badge
                    className={
                      agreement.status === 'signed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : agreement.status === 'pending_signature'
                        ? 'bg-yellow-100 text-yellow-700'
                        : agreement.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-700'
                    }
                  >
                    {agreement.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-slate-500">Service Fee:</span>
                    <p className="font-semibold text-slate-800">
                      {agreement.service_fee_amount ? `$${agreement.service_fee_amount.toLocaleString()}` : 'Varies per vehicle'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Created:</span>
                    <p className="text-slate-700">{format(new Date(agreement.created_date), 'MMM d, yyyy')}</p>
                  </div>
                  {agreement.signed_at && (
                    <div>
                      <span className="text-slate-500">Signed:</span>
                      <p className="text-slate-700">{format(new Date(agreement.signed_at), 'MMM d, yyyy')}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(agreement.status === 'draft' || agreement.status === 'pending_signature') && (
                    <Button
                      size="sm"
                      onClick={() => handleSendSigningEmail(agreement)}
                      className="bg-blue-500 hover:bg-blue-600"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send to Dealership
                    </Button>
                  )}
                  
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
                      <Link to={agreement.status === 'signed' ? createPageUrl(`ViewDealershipAgreement?id=${agreement.id}`) : agreement.agreement_url}>
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
                  
                  {agreement.status === 'signed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendAgreementEmail(agreement)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send Email (Signed)
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(agreement.id)}
                    disabled={isSubmitting}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
