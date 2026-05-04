
"use client"

import React, { useState, useEffect } from 'react';
import { VehicleInspectionChecklist } from '@/entities/VehicleInspectionChecklist';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, FileText } from 'lucide-react';

const exteriorAreas = [
  'Paint & Body',
  'Front Bumper',
  'Rear Bumper',
  'Headlights / Taillights',
  'Mirrors',
  'Glass / Windows',
  'Tires (Tread & Pressure)',
  'Rims / Wheels',
  'Doors & Locks',
  'Undercarriage / Rust'
];

const interiorAreas = [
  'Seats (Upholstery)',
  'Dashboard & Controls',
  'A/C & Heater',
  'Windows & Locks',
  'Infotainment System',
  'Odor / Cleanliness',
  'Interior Lighting',
  'Seatbelts'
];

const mechanicalComponents = [
  'Engine Start & Idle',
  'Transmission (Shifting)',
  'Brakes (Response & Noise)',
  'Suspension / Steering',
  'Battery Condition',
  'Fluid Levels (Oil, Coolant, etc.)',
  'Exhaust System',
  'Warning Lights / Check Engine'
];

const documents = [
  'Title / Ownership Paper',
  'Shaken / Registration',
  'Maintenance Records',
  'Power of Attorney (if applicable)',
  'Export Certificate (if applicable)',
  'Insurance (if applicable)'
];

const photoTypes = [
  'Exterior Photos (All Angles)',
  'Interior Photos',
  'Engine Bay',
  'Odometer Reading',
  'VIN / Chassis Plate',
  'Test Drive Video (Optional)'
];

export default function VehicleInspectionChecklistModal({ isOpen, onClose, managedSaleRequest, existingChecklist, onSave }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date_of_inspection: new Date().toISOString().split('T')[0],
    inspector_name: '',
    dealership_name: managedSaleRequest?.vehicle_details?.dealership_name || '',
    warranty: '',
    repair_service_details: '',
    managed_sale_request_id: managedSaleRequest?.id || null, // Added for linking or independent checklists
    vehicle_info: {
      make: managedSaleRequest?.vehicle_details?.make || '',
      model: managedSaleRequest?.vehicle_details?.model || '',
      year: managedSaleRequest?.vehicle_details?.year || '',
      vin: '',
      mileage: managedSaleRequest?.vehicle_details?.mileage || '',
      license_plate: '',
      transmission: 'automatic',
      fuel_type: managedSaleRequest?.vehicle_details?.fuel_type || 'gasoline',
      drivetrain: 'fwd'
    },
    exterior_condition: exteriorAreas.map(area => ({ area, rating: 'good', notes: '' })),
    interior_condition: interiorAreas.map(area => ({ area, rating: 'good', notes: '' })),
    engine_mechanical: mechanicalComponents.map(component => ({ component, rating: 'good', notes: '' })),
    documentation: documents.map(document => ({ document, verified: false, notes: '' })),
    photos_media: photoTypes.map(type => ({ type, completed: false, notes: '' })),
    overall_condition: '',
    recommended_sale_price: managedSaleRequest?.vehicle_details?.seller_asking_price || '',
    verified_by_speedio: '',
    dealership_representative: '',
    inspection_notes: ''
  });

  useEffect(() => {
    if (existingChecklist) {
      setFormData(existingChecklist);
    }
  }, [existingChecklist]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const checklistData = {
        ...formData,
        // managed_sale_request_id is now part of formData state
      };

      if (existingChecklist) {
        await VehicleInspectionChecklist.update(existingChecklist.id, checklistData);
      } else {
        await VehicleInspectionChecklist.create(checklistData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save checklist:', error);
      alert('Failed to save checklist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVehicleInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vehicle_info: { ...prev.vehicle_info, [field]: value }
    }));
  };

  const updateConditionItem = (conditionType, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [conditionType]: prev[conditionType].map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const updateConditionRating = (conditionType, index, value) => {
    updateConditionItem(conditionType, index, 'rating', value);
  };

  const updateConditionNotes = (conditionType, index, value) => {
    updateConditionItem(conditionType, index, 'notes', value);
  };

  const updateDocumentVerification = (index, checked) => {
    setFormData(prev => ({
      ...prev,
      documentation: prev.documentation.map((item, i) =>
        i === index ? { ...item, verified: checked } : item
      )
    }));
  };

  const updateDocumentNotes = (index, value) => {
    setFormData(prev => ({
      ...prev,
      documentation: prev.documentation.map((item, i) =>
        i === index ? { ...item, notes: value } : item
      )
    }));
  };

  const updatePhotoCompletion = (index, checked) => {
    setFormData(prev => ({
      ...prev,
      photos_media: prev.photos_media.map((item, i) =>
        i === index ? { ...item, completed: checked } : item
      )
    }));
  };

  const updatePhotoNotes = (index, value) => {
    setFormData(prev => ({
      ...prev,
      photos_media: prev.photos_media.map((item, i) =>
        i === index ? { ...item, notes: value } : item
      )
    }));
  };

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vehicle Inspection Checklist
              {managedSaleRequest && (
                <span className="text-sm font-normal text-slate-500 truncate">
                  - {managedSaleRequest.vehicle_details.title}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="dealership" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 overflow-x-auto px-6 border-b scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full mb-0">
                <TabsTrigger value="dealership" className="whitespace-nowrap">Dealership</TabsTrigger>
                <TabsTrigger value="vehicle" className="whitespace-nowrap">Vehicle</TabsTrigger>
                <TabsTrigger value="exterior" className="whitespace-nowrap">Exterior</TabsTrigger>
                <TabsTrigger value="interior" className="whitespace-nowrap">Interior</TabsTrigger>
                <TabsTrigger value="mechanical" className="whitespace-nowrap">Mechanical</TabsTrigger>
                <TabsTrigger value="documents" className="whitespace-nowrap">Documents</TabsTrigger>
                <TabsTrigger value="summary" className="whitespace-nowrap">Summary</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-6">
                {/* Dealership Information */}
                <TabsContent value="dealership" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dealership Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Date of Inspection</Label>
                          <Input
                            type="date"
                            value={formData.date_of_inspection}
                            onChange={(e) => setFormData({ ...formData, date_of_inspection: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Inspector Name</Label>
                          <Input
                            value={formData.inspector_name}
                            onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                            placeholder="Enter inspector name"
                          />
                        </div>
                        <div>
                          <Label>Dealership Name</Label>
                          <Input
                            value={formData.dealership_name}
                            onChange={(e) => setFormData({ ...formData, dealership_name: e.target.value })}
                            placeholder="Enter dealership name"
                          />
                        </div>
                        <div>
                          <Label>Warranty</Label>
                          <Input
                            value={formData.warranty}
                            onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                            placeholder="Enter warranty details"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Repair Service Details</Label>
                        <Textarea
                          value={formData.repair_service_details}
                          onChange={(e) => setFormData({ ...formData, repair_service_details: e.target.value })}
                          placeholder="Enter repair service details"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vehicle Information */}
                <TabsContent value="vehicle" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Make</Label>
                          <Input
                            value={formData.vehicle_info.make}
                            onChange={(e) => handleVehicleInfoChange('make', e.target.value)}
                            placeholder="e.g., Toyota"
                          />
                        </div>
                        <div>
                          <Label>Model</Label>
                          <Input
                            value={formData.vehicle_info.model}
                            onChange={(e) => handleVehicleInfoChange('model', e.target.value)}
                            placeholder="e.g., Camry"
                          />
                        </div>
                        <div>
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={formData.vehicle_info.year}
                            onChange={(e) => handleVehicleInfoChange('year', parseInt(e.target.value))}
                            placeholder="e.g., 2020"
                          />
                        </div>
                        <div>
                          <Label>VIN</Label>
                          <Input
                            value={formData.vehicle_info.vin}
                            onChange={(e) => handleVehicleInfoChange('vin', e.target.value)}
                            placeholder="Enter VIN number"
                          />
                        </div>
                        <div>
                          <Label>Mileage</Label>
                          <Input
                            type="number"
                            value={formData.vehicle_info.mileage}
                            onChange={(e) => handleVehicleInfoChange('mileage', parseInt(e.target.value))}
                            placeholder="Enter mileage"
                          />
                        </div>
                        <div>
                          <Label>License Plate</Label>
                          <Input
                            value={formData.vehicle_info.license_plate}
                            onChange={(e) => handleVehicleInfoChange('license_plate', e.target.value)}
                            placeholder="Enter license plate"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Transmission</Label>
                          <RadioGroup
                            value={formData.vehicle_info.transmission}
                            onValueChange={(value) => handleVehicleInfoChange('transmission', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="automatic" id="auto" />
                              <Label htmlFor="auto" className="font-normal">Automatic</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="manual" id="manual" />
                              <Label htmlFor="manual" className="font-normal">Manual</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label>Fuel Type</Label>
                          <RadioGroup
                            value={formData.vehicle_info.fuel_type}
                            onValueChange={(value) => handleVehicleInfoChange('fuel_type', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="gasoline" id="gasoline" />
                              <Label htmlFor="gasoline" className="font-normal">Gasoline</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="diesel" id="diesel" />
                              <Label htmlFor="diesel" className="font-normal">Diesel</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="hybrid" id="hybrid" />
                              <Label htmlFor="hybrid" className="font-normal">Hybrid</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="electric" id="electric" />
                              <Label htmlFor="electric" className="font-normal">Electric</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label>Drivetrain</Label>
                          <RadioGroup
                            value={formData.vehicle_info.drivetrain}
                            onValueChange={(value) => handleVehicleInfoChange('drivetrain', value)}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="fwd" id="fwd" />
                              <Label htmlFor="fwd" className="font-normal">FWD</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="rwd" id="rwd" />
                              <Label htmlFor="rwd" className="font-normal">RWD</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="awd" id="awd" />
                              <Label htmlFor="awd" className="font-normal">AWD</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="4wd" id="4wd" />
                              <Label htmlFor="4wd" className="font-normal">4WD</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Exterior Condition */}
                <TabsContent value="exterior" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exterior Condition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.exterior_condition.map((item, index) => (
                          <div key={index} className="border-b pb-4 last:border-0">
                            <Label className="font-semibold mb-2 block">{item.area}</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RadioGroup
                                value={item.rating}
                                onValueChange={(value) => updateConditionRating('exterior_condition', index, value)}
                              >
                                <div className="flex flex-wrap gap-4">
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="excellent" id={`ext-exc-${index}`} />
                                    <Label htmlFor={`ext-exc-${index}`} className="font-normal">Excellent</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="good" id={`ext-good-${index}`} />
                                    <Label htmlFor={`ext-good-${index}`} className="font-normal">Good</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fair" id={`ext-fair-${index}`} />
                                    <Label htmlFor={`ext-fair-${index}`} className="font-normal">Fair</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="poor" id={`ext-poor-${index}`} />
                                    <Label htmlFor={`ext-poor-${index}`} className="font-normal">Poor</Label>
                                  </div>
                                </div>
                              </RadioGroup>
                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) => updateConditionNotes('exterior_condition', index, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Interior Condition */}
                <TabsContent value="interior" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interior Condition</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.interior_condition.map((item, index) => (
                          <div key={index} className="border-b pb-4 last:border-0">
                            <Label className="font-semibold mb-2 block">{item.area}</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RadioGroup
                                value={item.rating}
                                onValueChange={(value) => updateConditionRating('interior_condition', index, value)}
                              >
                                <div className="flex flex-wrap gap-4">
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="excellent" id={`int-exc-${index}`} />
                                    <Label htmlFor={`int-exc-${index}`} className="font-normal">Excellent</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="good" id={`int-good-${index}`} />
                                    <Label htmlFor={`int-good-${index}`} className="font-normal">Good</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fair" id={`int-fair-${index}`} />
                                    <Label htmlFor={`int-fair-${index}`} className="font-normal">Fair</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="poor" id={`int-poor-${index}`} />
                                    <Label htmlFor={`int-poor-${index}`} className="font-normal">Poor</Label>
                                  </div>
                                </div>
                              </RadioGroup>
                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) => updateConditionNotes('interior_condition', index, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Engine & Mechanical */}
                <TabsContent value="mechanical" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Engine & Mechanical</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.engine_mechanical.map((item, index) => (
                          <div key={index} className="border-b pb-4 last:border-0">
                            <Label className="font-semibold mb-2 block">{item.component}</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RadioGroup
                                value={item.rating}
                                onValueChange={(value) => updateConditionRating('engine_mechanical', index, value)}
                              >
                                <div className="flex flex-wrap gap-4">
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="excellent" id={`mech-exc-${index}`} />
                                    <Label htmlFor={`mech-exc-${index}`} className="font-normal">Excellent</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="good" id={`mech-good-${index}`} />
                                    <Label htmlFor={`mech-good-${index}`} className="font-normal">Good</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="fair" id={`mech-fair-${index}`} />
                                    <Label htmlFor={`mech-fair-${index}`} className="font-normal">Fair</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="poor" id={`mech-poor-${index}`} />
                                    <Label htmlFor={`mech-poor-${index}`} className="font-normal">Poor</Label>
                                  </div>
                                </div>
                              </RadioGroup>
                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) => updateConditionNotes('engine_mechanical', index, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents & Photos */}
                <TabsContent value="documents" className="mt-0">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Vehicle Documentation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.documentation.map((item, index) => (
                          <div key={index} className="border-b pb-4 last:border-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={item.verified}
                                  onCheckedChange={(checked) => updateDocumentVerification(index, checked)}
                                  id={`doc-${index}`}
                                />
                                <Label htmlFor={`doc-${index}`} className="font-semibold cursor-pointer">
                                  {item.document}
                                </Label>
                              </div>
                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) => updateDocumentNotes(index, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Photos & Media</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {formData.photos_media.map((item, index) => (
                          <div key={index} className="border-b pb-4 last:border-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={(checked) => updatePhotoCompletion(index, checked)}
                                  id={`photo-${index}`}
                                />
                                <Label htmlFor={`photo-${index}`} className="font-semibold cursor-pointer">
                                  {item.type}
                                </Label>
                              </div>
                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) => updatePhotoNotes(index, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Summary */}
                <TabsContent value="summary" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Inspection Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Overall Condition</Label>
                        <Textarea
                          value={formData.overall_condition}
                          onChange={(e) => setFormData({ ...formData, overall_condition: e.target.value })}
                          placeholder="Summarize the overall condition of the vehicle"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>Recommended Sale Price</Label>
                        <Input
                          type="number"
                          value={formData.recommended_sale_price}
                          onChange={(e) => setFormData({ ...formData, recommended_sale_price: parseFloat(e.target.value) })}
                          placeholder="Enter recommended sale price"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Verified by Speedio Representative</Label>
                          <Input
                            value={formData.verified_by_speedio}
                            onChange={(e) => setFormData({ ...formData, verified_by_speedio: e.target.value })}
                            placeholder="Enter Speedio representative name"
                          />
                        </div>
                        <div>
                          <Label>Dealership Representative</Label>
                          <Input
                            value={formData.dealership_representative}
                            onChange={(e) => setFormData({ ...formData, dealership_representative: e.target.value })}
                            placeholder="Enter dealership representative name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea
                          value={formData.inspection_notes}
                          onChange={(e) => setFormData({ ...formData, inspection_notes: e.target.value })}
                          placeholder="Any additional notes or observations"
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </div>
          </Tabs>

          <div className="flex justify-end gap-3 p-6 border-t flex-shrink-0">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Checklist
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}