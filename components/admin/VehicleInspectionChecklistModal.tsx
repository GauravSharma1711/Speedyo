"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FileText, Loader2, Save } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/TextArea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";
import { Checkbox } from "@/components/ui/checkbox";

const exteriorAreas = [
  "Paint & Body",
  "Front Bumper",
  "Rear Bumper",
  "Headlights / Taillights",
  "Mirrors",
  "Glass / Windows",
  "Tires (Tread & Pressure)",
  "Rims / Wheels",
  "Doors & Locks",
  "Undercarriage / Rust",
] as const;

const interiorAreas = [
  "Seats (Upholstery)",
  "Dashboard & Controls",
  "A/C & Heater",
  "Windows & Locks",
  "Infotainment System",
  "Odor / Cleanliness",
  "Interior Lighting",
  "Seatbelts",
] as const;

const mechanicalComponents = [
  "Engine Start & Idle",
  "Transmission (Shifting)",
  "Brakes (Response & Noise)",
  "Suspension / Steering",
  "Battery Condition",
  "Fluid Levels (Oil, Coolant, etc.)",
  "Exhaust System",
  "Warning Lights / Check Engine",
] as const;

const documents = [
  "Title / Ownership Paper",
  "Shaken / Registration",
  "Maintenance Records",
  "Power of Attorney (if applicable)",
  "Export Certificate (if applicable)",
  "Insurance (if applicable)",
] as const;

const photoTypes = [
  "Exterior Photos (All Angles)",
  "Interior Photos",
  "Engine Bay",
  "Odometer Reading",
  "VIN / Chassis Plate",
  "Car Viewing Video (Optional)",
] as const;

type Rating = "excellent" | "good" | "fair" | "poor";

type ConditionItem = {
  area: string;
  rating: Rating;
  notes: string;
};

type MechanicalItem = {
  component: string;
  rating: Rating;
  notes: string;
};

type DocumentItem = {
  document: string;
  verified: boolean;
  notes: string;
};

type PhotoItem = {
  type: string;
  completed: boolean;
  notes: string;
};

type VehicleInfo = {
  make: string;
  model: string;
  year: number | "";
  vin: string;
  mileage: number | "";
  license_plate: string;
  transmission: "automatic" | "manual";
  fuel_type: "gasoline" | "diesel" | "hybrid" | "electric";
  drivetrain: "fwd" | "rwd" | "awd" | "4wd";
};

export type VehicleInspectionChecklistData = {
  date_of_inspection: string; // YYYY-MM-DD
  inspector_name: string;
  dealership_name: string;
  warranty: string;
  repair_service_details: string;

  managed_sale_request_id: string | null;

  vehicle_info: VehicleInfo;

  exterior_condition: ConditionItem[];
  interior_condition: ConditionItem[];
  engine_mechanical: MechanicalItem[];

  documentation: DocumentItem[];
  photos_media: PhotoItem[];

  overall_condition: string;
  recommended_sale_price: number | "" | string;
  verified_by_speedio: string;
  dealership_representative: string;
  inspection_notes: string;
};

type ExistingChecklist = VehicleInspectionChecklistData & {
  id: string;
};

type ManagedSaleRequestLite = {
  id: string;
  vehicle_details?: {
    title?: string;
    dealership_name?: string;
    make?: string;
    model?: string;
    year?: number;
    mileage?: number;
    fuel_type?: "gasoline" | "diesel" | "hybrid" | "electric";
    seller_asking_price?: number | string;
  };
};

function todayYmd() {
  return new Date().toISOString().split("T")[0];
}

function buildDefaultForm(managedSaleRequest?: ManagedSaleRequestLite | null): VehicleInspectionChecklistData {
  const vd = managedSaleRequest?.vehicle_details;

  return {
    date_of_inspection: todayYmd(),
    inspector_name: "",
    dealership_name: vd?.dealership_name ?? "",
    warranty: "",
    repair_service_details: "",
    managed_sale_request_id: managedSaleRequest?.id ?? null,

    vehicle_info: {
      make: vd?.make ?? "",
      model: vd?.model ?? "",
      year: typeof vd?.year === "number" ? vd.year : "",
      vin: "",
      mileage: typeof vd?.mileage === "number" ? vd.mileage : "",
      license_plate: "",
      transmission: "automatic",
      fuel_type: vd?.fuel_type ?? "gasoline",
      drivetrain: "fwd",
    },

    exterior_condition: exteriorAreas.map((area) => ({ area, rating: "good", notes: "" })),
    interior_condition: interiorAreas.map((area) => ({ area, rating: "good", notes: "" })),
    engine_mechanical: mechanicalComponents.map((component) => ({
      component,
      rating: "good",
      notes: "",
    })),

    documentation: documents.map((document) => ({ document, verified: false, notes: "" })),
    photos_media: photoTypes.map((type) => ({ type, completed: false, notes: "" })),

    overall_condition: "",
    recommended_sale_price: vd?.seller_asking_price ?? "",
    verified_by_speedio: "",
    dealership_representative: "",
    inspection_notes: "",
  };
}

export default function VehicleInspectionChecklistModalUI(props: {
  isOpen: boolean;
  onClose: () => void;
  managedSaleRequest?: ManagedSaleRequestLite | null;
  existingChecklist?: ExistingChecklist | null;
  onSave?: (data: VehicleInspectionChecklistData) => Promise<void> | void;
}) {
  const { isOpen, onClose, managedSaleRequest, existingChecklist, onSave } = props;

  const defaultForm = useMemo(
    () => buildDefaultForm(managedSaleRequest),
    [managedSaleRequest?.id],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VehicleInspectionChecklistData>(defaultForm);

  useEffect(() => {
    if (existingChecklist) {
      setFormData(existingChecklist);
      return;
    }
    setFormData(defaultForm);
  }, [existingChecklist, defaultForm]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const checklistData: VehicleInspectionChecklistData = { ...formData };
      await onSave?.(checklistData);
      onClose();
    } catch (e) {
      console.error("Failed to save checklist:", e);
      alert("Failed to save checklist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVehicleInfoChange = <K extends keyof VehicleInfo>(field: K, value: VehicleInfo[K]) => {
    setFormData((prev) => ({
      ...prev,
      vehicle_info: { ...prev.vehicle_info, [field]: value },
    }));
  };

  const updateConditionItem = <
    T extends "exterior_condition" | "interior_condition" | "engine_mechanical",
  >(
    conditionType: T,
    index: number,
    field: "rating" | "notes",
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [conditionType]: (prev[conditionType] as any[]).map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const updateDocumentVerification = (index: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      documentation: prev.documentation.map((item, i) =>
        i === index ? { ...item, verified: checked } : item,
      ),
    }));
  };

  const updateDocumentNotes = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      documentation: prev.documentation.map((item, i) =>
        i === index ? { ...item, notes: value } : item,
      ),
    }));
  };

  const updatePhotoCompletion = (index: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      photos_media: prev.photos_media.map((item, i) =>
        i === index ? { ...item, completed: checked } : item,
      ),
    }));
  };

  const updatePhotoNotes = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      photos_media: prev.photos_media.map((item, i) =>
        i === index ? { ...item, notes: value } : item,
      ),
    }));
  };

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vehicle Inspection Checklist
              {managedSaleRequest?.vehicle_details?.title ? (
                <span className="text-sm font-normal text-slate-500 truncate">
                  - {managedSaleRequest.vehicle_details.title}
                </span>
              ) : null}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="dealership" className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-shrink-0 overflow-x-auto px-6 border-b scrollbar-hide">
              <TabsList className="inline-flex w-max min-w-full mb-0">
                <TabsTrigger value="dealership" className="whitespace-nowrap">
                  Dealership
                </TabsTrigger>
                <TabsTrigger value="vehicle" className="whitespace-nowrap">
                  Vehicle
                </TabsTrigger>
                <TabsTrigger value="exterior" className="whitespace-nowrap">
                  Exterior
                </TabsTrigger>
                <TabsTrigger value="interior" className="whitespace-nowrap">
                  Interior
                </TabsTrigger>
                <TabsTrigger value="mechanical" className="whitespace-nowrap">
                  Mechanical
                </TabsTrigger>
                <TabsTrigger value="documents" className="whitespace-nowrap">
                  Documents
                </TabsTrigger>
                <TabsTrigger value="summary" className="whitespace-nowrap">
                  Summary
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="p-6">
                {/* Dealership */}
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
                            onChange={(e) =>
                              setFormData({ ...formData, date_of_inspection: e.target.value })
                            }
                          />
                        </div>

                        <div>
                          <Label>Inspector Name</Label>
                          <Input
                            value={formData.inspector_name}
                            onChange={(e) =>
                              setFormData({ ...formData, inspector_name: e.target.value })
                            }
                            placeholder="Enter inspector name"
                          />
                        </div>

                        <div>
                          <Label>Dealership Name</Label>
                          <Input
                            value={formData.dealership_name}
                            onChange={(e) =>
                              setFormData({ ...formData, dealership_name: e.target.value })
                            }
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
                          onChange={(e) =>
                            setFormData({ ...formData, repair_service_details: e.target.value })
                          }
                          placeholder="Enter repair service details"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vehicle */}
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
                            onChange={(e) => handleVehicleInfoChange("make", e.target.value)}
                            placeholder="e.g., Toyota"
                          />
                        </div>

                        <div>
                          <Label>Model</Label>
                          <Input
                            value={formData.vehicle_info.model}
                            onChange={(e) => handleVehicleInfoChange("model", e.target.value)}
                            placeholder="e.g., Camry"
                          />
                        </div>

                        <div>
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={formData.vehicle_info.year}
                            onChange={(e) =>
                              handleVehicleInfoChange("year", e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="e.g., 2020"
                          />
                        </div>

                        <div>
                          <Label>VIN</Label>
                          <Input
                            value={formData.vehicle_info.vin}
                            onChange={(e) => handleVehicleInfoChange("vin", e.target.value)}
                            placeholder="Enter VIN number"
                          />
                        </div>

                        <div>
                          <Label>Mileage</Label>
                          <Input
                            type="number"
                            value={formData.vehicle_info.mileage}
                            onChange={(e) =>
                              handleVehicleInfoChange("mileage", e.target.value ? Number(e.target.value) : "")
                            }
                            placeholder="Enter mileage"
                          />
                        </div>

                        <div>
                          <Label>License Plate</Label>
                          <Input
                            value={formData.vehicle_info.license_plate}
                            onChange={(e) => handleVehicleInfoChange("license_plate", e.target.value)}
                            placeholder="Enter license plate"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Transmission</Label>
                          <RadioGroup
                            value={formData.vehicle_info.transmission}
                            onValueChange={(value) =>
                              handleVehicleInfoChange("transmission", value as VehicleInfo["transmission"])
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="automatic" id="trans-auto" />
                              <Label htmlFor="trans-auto" className="font-normal">
                                Automatic
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="manual" id="trans-manual" />
                              <Label htmlFor="trans-manual" className="font-normal">
                                Manual
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label>Fuel Type</Label>
                          <RadioGroup
                            value={formData.vehicle_info.fuel_type}
                            onValueChange={(value) =>
                              handleVehicleInfoChange("fuel_type", value as VehicleInfo["fuel_type"])
                            }
                          >
                            {(["gasoline", "diesel", "hybrid", "electric"] as const).map((f) => (
                              <div key={f} className="flex items-center space-x-2">
                                <RadioGroupItem value={f} id={`fuel-${f}`} />
                                <Label htmlFor={`fuel-${f}`} className="font-normal capitalize">
                                  {f}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>

                        <div>
                          <Label>Drivetrain</Label>
                          <RadioGroup
                            value={formData.vehicle_info.drivetrain}
                            onValueChange={(value) =>
                              handleVehicleInfoChange("drivetrain", value as VehicleInfo["drivetrain"])
                            }
                          >
                            {(["fwd", "rwd", "awd", "4wd"] as const).map((d) => (
                              <div key={d} className="flex items-center space-x-2">
                                <RadioGroupItem value={d} id={`drive-${d}`} />
                                <Label htmlFor={`drive-${d}`} className="font-normal uppercase">
                                  {d}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Exterior */}
                <TabsContent value="exterior" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exterior Condition</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {formData.exterior_condition.map((item, index) => (
                          <div key={`${item.area}-${index}`} className="border-b pb-4 last:border-0">
                            <Label className="font-semibold mb-2 block">{item.area}</Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RadioGroup
                                value={item.rating}
                                onValueChange={(value) =>
                                  updateConditionItem("exterior_condition", index, "rating", value as Rating)
                                }
                              >
                                <div className="flex flex-wrap gap-4">
                                  {(["excellent", "good", "fair", "poor"] as const).map((r) => (
                                    <div key={r} className="flex items-center space-x-2">
                                      <RadioGroupItem value={r} id={`ext-${r}-${index}`} />
                                      <Label htmlFor={`ext-${r}-${index}`} className="font-normal capitalize">
                                        {r}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>

                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) =>
                                  updateConditionItem("exterior_condition", index, "notes", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Interior */}
                <TabsContent value="interior" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Interior Condition</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {formData.interior_condition.map((item, index) => (
                          <div key={`${item.area}-${index}`} className="border-b pb-4 last:border-0">
                            <Label className="font-semibold mb-2 block">{item.area}</Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RadioGroup
                                value={item.rating}
                                onValueChange={(value) =>
                                  updateConditionItem("interior_condition", index, "rating", value as Rating)
                                }
                              >
                                <div className="flex flex-wrap gap-4">
                                  {(["excellent", "good", "fair", "poor"] as const).map((r) => (
                                    <div key={r} className="flex items-center space-x-2">
                                      <RadioGroupItem value={r} id={`int-${r}-${index}`} />
                                      <Label htmlFor={`int-${r}-${index}`} className="font-normal capitalize">
                                        {r}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>

                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) =>
                                  updateConditionItem("interior_condition", index, "notes", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Mechanical */}
                <TabsContent value="mechanical" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>Engine & Mechanical</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {formData.engine_mechanical.map((item, index) => (
                          <div key={`${item.component}-${index}`} className="border-b pb-4 last:border-0">
                            <Label className="font-semibold mb-2 block">{item.component}</Label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <RadioGroup
                                value={item.rating}
                                onValueChange={(value) =>
                                  updateConditionItem("engine_mechanical", index, "rating", value as Rating)
                                }
                              >
                                <div className="flex flex-wrap gap-4">
                                  {(["excellent", "good", "fair", "poor"] as const).map((r) => (
                                    <div key={r} className="flex items-center space-x-2">
                                      <RadioGroupItem value={r} id={`mech-${r}-${index}`} />
                                      <Label htmlFor={`mech-${r}-${index}`} className="font-normal capitalize">
                                        {r}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </RadioGroup>

                              <Input
                                placeholder="Notes"
                                value={item.notes}
                                onChange={(e) =>
                                  updateConditionItem("engine_mechanical", index, "notes", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Documents */}
                <TabsContent value="documents" className="mt-0">
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Vehicle Documentation</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        {formData.documentation.map((item, index) => (
                          <div key={`${item.document}-${index}`} className="border-b pb-4 last:border-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={item.verified}
                                  onCheckedChange={(checked) =>
                                    updateDocumentVerification(index, Boolean(checked))
                                  }
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
                          <div key={`${item.type}-${index}`} className="border-b pb-4 last:border-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={item.completed}
                                  onCheckedChange={(checked) =>
                                    updatePhotoCompletion(index, Boolean(checked))
                                  }
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
                          onChange={(e) =>
                            setFormData({ ...formData, overall_condition: e.target.value })
                          }
                          placeholder="Summarize the overall condition of the vehicle"
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>Recommended Sale Price</Label>
                        <Input
                          type="number"
                          value={formData.recommended_sale_price as any}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recommended_sale_price: e.target.value ? Number(e.target.value) : "",
                            })
                          }
                          placeholder="Enter recommended sale price"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Verified by Speedio Representative</Label>
                          <Input
                            value={formData.verified_by_speedio}
                            onChange={(e) =>
                              setFormData({ ...formData, verified_by_speedio: e.target.value })
                            }
                            placeholder="Enter Speedio representative name"
                          />
                        </div>

                        <div>
                          <Label>Dealership Representative</Label>
                          <Input
                            value={formData.dealership_representative}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                dealership_representative: e.target.value,
                              })
                            }
                            placeholder="Enter dealership representative name"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Additional Notes</Label>
                        <Textarea
                          value={formData.inspection_notes}
                          onChange={(e) =>
                            setFormData({ ...formData, inspection_notes: e.target.value })
                          }
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