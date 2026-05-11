"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Building,
  Calendar,
  Car,
  CheckCircle,
  DollarSign,
  Edit,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/TextArea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import CreateVehicleModalUI from "../dashboard/CreateVehicleModalUI";
import { toast } from "@/components/ui/UseToast";

import { UpdateVehicleData, useVehicleListingStore, Vehicle } from "@/store/admin/vehicleListing";
import { useDealershipAgreementStore } from "@/store/admin/dealership";



type VehicleStatus = "available" | "sold";

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type AvailabilitySlot = {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  meetingAddress: string;
};

// type VehicleRow = {
//   id: string;
//   title: string;
//   year: number;
//   make: string;
//   model: string;
//   price: number;

//   status: VehicleStatus;
//   featured: boolean;

//   website_managed: boolean;
//   created_by: string;

//   primary_image_small?: string | null;
//   primary_image?: string | null;

//   recurring_availability?: AvailabilitySlot[];

//   dealership_name?: string | null;
//   dealership_agreement_id?: string | null;
// };

// type DealershipAgreementLite = {
//   id: string;
//   dealership_name: string;
//   status: "signed";
// };

// const MOCK_DEALERSHIPS: DealershipAgreementLite[] = [
//   { id: "d_001", dealership_name: "Taka Cars", status: "signed" },
//   { id: "d_002", dealership_name: "Ok Motors", status: "signed" },
// ];



// const MOCK_VEHICLES: VehicleRow[] = [
//   {
//     id: "v_001",
//     title: "2018 Toyota Aqua (Hybrid) — Clean",
//     year: 2018,
//     make: "Toyota",
//     model: "Aqua",
//     price: 9500,
//     status: "available",
//     featured: true,
//     website_managed: true,
//     created_by: "admin@speedyo.local",
//     primary_image:
//       "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=70",
//     recurring_availability: [
//       {
//         id: "slot_a",
//         dayOfWeek: "Monday",
//         startTime: "09:00",
//         endTime: "18:00",
//         meetingAddress: "Urumu, Okinawa",
//       },
//     ],
//     dealership_name: "Taka Cars",
//     dealership_agreement_id: "d_001",
//   },
//   {
//     id: "v_002",
//     title: "2020 Honda Fit — Great City Car",
//     year: 2020,
//     make: "Honda",
//     model: "Fit",
//     price: 11200,
//     status: "available",
//     featured: false,
//     website_managed: false,
//     created_by: "seller@local.dev",
//     primary_image:
//       "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=70",
//     recurring_availability: [],
//   },
//   {
//     id: "v_003",
//     title: "2016 Nissan Note — Budget Friendly",
//     year: 2016,
//     make: "Nissan",
//     model: "Note",
//     price: 6200,
//     status: "sold",
//     featured: false,
//     website_managed: true,
//     created_by: "admin@speedyo.local",
//     primary_image: null,
//     recurring_availability: [],
//     dealership_name: null,
//     dealership_agreement_id: null,
//   },
// ];



function makeSlot(): AvailabilitySlot {
  return {
    id: `slot_${Math.random().toString(16).slice(2, 10)}`,
    dayOfWeek: "Monday",
    startTime: "09:00",
    endTime: "18:00",
    meetingAddress: "",
  };
}

function dbSlotToAvailabilitySlot(dbSlot: any): AvailabilitySlot {
  return {
    id: dbSlot.id,
    dayOfWeek: dbSlot.requested_date as DayOfWeek,
    startTime: dbSlot.requested_time,
    endTime: dbSlot.endTime ?? "18:00",
    meetingAddress: dbSlot.meetingAddress ?? "",
  };
}

export default function ListingManagementUI(props: {
  initialEditVehicleId?: string | null;
}) {


   const {
    vehicles,
    isLoading: vehiclesLoading,
    getAll,
    update,
    remove,
    toggleFeatured,
    markSold,
    associateDealership,
    removeDealershipAssociation,
    manageTestDriveAvailability,
  } = useVehicleListingStore();

  const {
    agreements,
    isLoading: dealershipsLoading,
    getAll: getDealerships,
  } = useDealershipAgreementStore();

  const signedDealerships = useMemo(
    () => agreements.filter((d) => d.status === "signed"),
    [agreements]
  );

  useEffect(() => {
    getAll();
    getDealerships();
  }, []);









  // const [vehicles, setVehicles] = useState<VehicleRow[]>(MOCK_VEHICLES);
  // const [dealerships] = useState<DealershipAgreementLite[]>(MOCK_DEALERSHIPS);


  const [searchTerm, setSearchTerm] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle  | null>(null);

  const [showAssociateDealershipModal, setShowAssociateDealershipModal] =
    useState(false);
  const [selectedVehicleForAssociation, setSelectedVehicleForAssociation] =
    useState<Vehicle  | null>(null);
  const [selectedDealershipId, setSelectedDealershipId] = useState("");

  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [managingAvailabilityVehicle, setManagingAvailabilityVehicle] =
    useState<Vehicle  | null>(null);

  // auto-open edit modal if passed via query param
  useEffect(() => {
    if (!props.initialEditVehicleId) return;
    const v = vehicles.find((x) => x.id === props.initialEditVehicleId);
    if (v) handleEditVehicle(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.initialEditVehicleId, vehicles.length]);

  const filteredVehicles = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return vehicles;

    return vehicles.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q),
    );
  }, [vehicles, searchTerm]);

   const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing permanently?")) return;
    try {
      await remove(id);
      toast({ title: "Deleted", description: "Vehicle listing deleted." });
    } catch {
      toast({ title: "Error", description: "Failed to delete vehicle.", variant: "destructive" });
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };

 const handleUpdateVehicle = async (patch: CreateVehiclePatch) => {
  if (!editingVehicle) return;
  const formData = new FormData();

  formData.append("make", patch.make);
  formData.append("model", patch.model);
  formData.append("year", String(patch.year));
  formData.append("price", String(patch.price));
  formData.append("mileage", String(patch.mileage));
  formData.append("condition", patch.condition);
  formData.append("description", patch.description);
  formData.append("location", patch.location);
  formData.append("fuel_type", patch.fuel_type);
  formData.append("transmission", patch.transmission);
  formData.append("status", patch.status);


  patch.imageFiles.forEach((file) => formData.append("images", file));

  const primaryIsNew = patch.primary_image?.startsWith("blob:");
  if (primaryIsNew) {
    // Find the matching file by index
    const idx = patch.images.findIndex((url) => url === patch.primary_image);
    if (idx !== -1 && patch.imageFiles[idx]) {
      formData.append("primary_image", patch.imageFiles[idx]);
    }
  } else if (patch.primary_image) {
    formData.append("primary_image", patch.primary_image);
  }

  try {
    await update(editingVehicle.id, formData);
    setShowEditModal(false);
    setEditingVehicle(null);
    toast({ title: "Saved", description: "Vehicle updated." });
  } catch {
    toast({ title: "Error", description: "Failed to update vehicle.", variant: "destructive" });
  }
};

    const handleToggleFeatured = async (vehicleId: string) => {
    try {
      await toggleFeatured(vehicleId);
    } catch {
      toast({ title: "Error", description: "Failed to toggle featured.", variant: "destructive" });
    }
  };


  const handleMarkAsSold = async (vehicleId: string) => {
    if (!window.confirm("Mark this vehicle as sold?")) return;
    try {
      await markSold(vehicleId);
    } catch {
      toast({ title: "Error", description: "Failed to mark as sold.", variant: "destructive" });
    }
  };

   const handleAssociateDealership = (vehicle: Vehicle) => {
    setSelectedVehicleForAssociation(vehicle);
    setSelectedDealershipId(vehicle.dealershipAgreementId ?? "");
    setShowAssociateDealershipModal(true);
  };

    const handleSaveAssociation = async () => {
    if (!selectedVehicleForAssociation || !selectedDealershipId) return;
    try {
      await associateDealership(selectedVehicleForAssociation.id, selectedDealershipId);
      setShowAssociateDealershipModal(false);
      setSelectedVehicleForAssociation(null);
      setSelectedDealershipId("");
      toast({ title: "Saved", description: "Dealership associated." });
    } catch {
      toast({ title: "Error", description: "Failed to associate dealership.", variant: "destructive" });
    }
  };

   const handleRemoveAssociation = async (vehicle: Vehicle) => {
    if (!window.confirm("Remove dealership association from this vehicle?")) return;
    try {
      await removeDealershipAssociation(vehicle.id);
      toast({ title: "Removed", description: "Dealership association removed." });
    } catch {
      toast({ title: "Error", description: "Failed to remove association.", variant: "destructive" });
    }
  };

  const handleManageAvailability = (vehicle: Vehicle) => {
    setManagingAvailabilityVehicle(vehicle);
    setShowAvailabilityModal(true);
  };

 const handleSaveAvailability = async (vehicleId: string, slots: AvailabilitySlot[]) => {
  const mapped = slots.map((s) => ({
    requested_date: s.dayOfWeek,
    requested_time: s.startTime,
    endTime: s.endTime,
    meetingAddress: s.meetingAddress,
  }));
  try {
    await manageTestDriveAvailability(vehicleId, mapped);
    setShowAvailabilityModal(false);
    setManagingAvailabilityVehicle(null);
    toast({ title: "Saved", description: "Availability updated." });
  } catch {
    toast({ title: "Error", description: "Failed to save availability.", variant: "destructive" });
  }
};

  if (vehiclesLoading && vehicles.length === 0) {
    return <div className="p-8 text-center text-slate-500">Loading vehicles...</div>;
  }

  return (
    <>
      <Card className="bg-white shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-500" />
            Vehicle Listings Management
          </CardTitle>

          <div className="mt-4">
            <Input
              placeholder="Search by title, make, or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 mt-4">
            {filteredVehicles.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="border border-slate-200 hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {vehicle.primary_image_small || vehicle.primary_image ? (
                        <img
                          src={vehicle.primary_image_small ?? vehicle.primary_image ?? ""}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="w-12 h-12 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-lg text-slate-900">
                        {vehicle.title}
                      </div>
                      <div className="text-sm text-slate-500">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </div>

                      <div className="mt-2 text-xl font-bold text-slate-900">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "JPY",
                        }).format(vehicle.price)}
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`capitalize ${vehicle.status === "sold"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "text-slate-700 border-slate-300"
                            }`}
                        >
                          {vehicle.status === "sold" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : null}
                          {vehicle.status}
                        </Badge>

                        <Badge
                          variant="outline"
                          className="text-slate-700 border-slate-300"
                        >
                          {vehicle.website_managed ? "Speedio Managed" : "Self Listed"}
                        </Badge>

                        {vehicle.featured ? (
                          <Badge className="bg-amber-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        ) : null}

                        <span className="text-sm text-slate-600 whitespace-nowrap">
                          Listed by: {vehicle.created_by}
                        </span>
                      </div>

                      {vehicle.dealership_name ? (
                        <Badge
                          variant="outline"
                          className="mt-2 text-slate-700 border-slate-300"
                        >
                          <Building className="w-3 h-3 mr-1" />
                          {vehicle.dealership_name}
                        </Badge>
                      ) : null}

                      {vehicle.website_managed ? (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-slate-800">
                                Test Drive Availability
                              </h4>
                              {vehicle.recurring_availability?.length ? (
                                <p className="text-sm text-slate-600">
                                  {vehicle.recurring_availability.length} time slots configured
                                </p>
                              ) : (
                                <p className="text-sm text-slate-600">
                                  No availability set - manual coordination required
                                </p>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageAvailability(vehicle)}
                              className="text-slate-700 border-slate-300 hover:bg-slate-100"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Manage Availability
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 min-w-fit mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Listing
                      </Button>

                      {vehicle.status === "available" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsSold(vehicle.id)}
                          className="text-slate-700 border-slate-300 hover:bg-slate-100"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Mark as Sold
                        </Button>
                      ) : null}

                      <Button
                        variant={vehicle.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleFeatured(vehicle.id)}
                        className={
                          vehicle.featured
                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                            : "text-slate-700 border-slate-300 hover:bg-slate-100"
                        }
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {vehicle.featured ? "Remove Featured" : "Make Featured"}
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssociateDealership(vehicle)}
                        className="text-slate-700 border-slate-300 hover:bg-slate-100"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        {vehicle.dealershipAgreement?.dealership_name ? "Change Dealership" : "Associate Dealership"}
                      </Button>

                      {vehicle.dealershipAgreement?.dealership_name ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAssociation(vehicle)}
                          className="text-slate-700 border-slate-300 hover:bg-slate-100"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove Association
                        </Button>
                      ) : null}

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Listing
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredVehicles.length === 0 ? (
              <div className="text-sm text-slate-600">No vehicles match your search.</div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {showEditModal && editingVehicle && (
        <CreateVehicleModalUI
          isOpen={showEditModal}
          vehicleToEdit={editingVehicle}
          onClose={() => {
            setShowEditModal(false);
            setEditingVehicle(null);
          }}
          onSave={handleUpdateVehicle}
        />
      )}
      {showAvailabilityModal && managingAvailabilityVehicle ? (
        <AvailabilityManagerModal
          open={showAvailabilityModal}
          onOpenChange={(open) => {
            setShowAvailabilityModal(open);
            if (!open) setManagingAvailabilityVehicle(null);
          }}
          vehicle={managingAvailabilityVehicle}
          onSave={(slots) => handleSaveAvailability(managingAvailabilityVehicle.id, slots)}
        />
      ) : null}

      {/* Associate Dealership Modal */}
      {showAssociateDealershipModal ? (
        <Dialog
          open={showAssociateDealershipModal}
          onOpenChange={setShowAssociateDealershipModal}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Associate Vehicle with Dealership</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Vehicle</Label>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedVehicleForAssociation?.title}
                </p>
              </div>

              <div>
                <Label htmlFor="dealership">Select Dealership</Label>
                <Select value={selectedDealershipId} onValueChange={setSelectedDealershipId}>
                  <SelectTrigger id="dealership">
                    <SelectValue placeholder="Choose a dealership..." />
                  </SelectTrigger>
                  <SelectContent>
                    {signedDealerships.length ? (
                      signedDealerships.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.dealership_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-dealerships" disabled>
                        No signed dealership agreements found.
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>

                {!signedDealerships.length ? (
                  <p className="text-sm text-amber-600 mt-2">
                    No signed dealership agreements found. Create and sign an agreement first.
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssociateDealershipModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAssociation}
                  disabled={!selectedDealershipId}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500"
                >
                  Associate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

function EditVehicleForm(props: {
  vehicle: VehicleRow;
  onCancel: () => void;
  onSave: (patch: Partial<VehicleRow>) => void;
}) {
  const [title, setTitle] = useState(props.vehicle.title);
  const [price, setPrice] = useState(String(props.vehicle.price));
  const [status, setStatus] = useState<VehicleStatus>(props.vehicle.status);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="price">Price (JPY)</Label>
          <Input
            id="price"
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as VehicleStatus)}>
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">available</SelectItem>
              <SelectItem value="sold">sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={props.onCancel}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            const numeric = Number(price);
            props.onSave({
              title: title.trim() || props.vehicle.title,
              price: Number.isFinite(numeric) ? numeric : props.vehicle.price,
              status,
            });
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function AvailabilityManagerModal(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: VehicleRow;
  onSave: (slots: AvailabilitySlot[]) => void;
}) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>(() => {
   const existing = (props.vehicle.recurring_availability ?? []).map(dbSlotToAvailabilitySlot);
return existing.length ? existing : [makeSlot()];
  });

useEffect(() => {
  const existing = (props.vehicle.recurring_availability ?? []).map(dbSlotToAvailabilitySlot);
  setSlots(existing.length ? existing : [makeSlot()]);
}, [props.vehicle.id]);

  const setSlot = (id: string, patch: Partial<AvailabilitySlot>) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSlot = (id: string) => {
    setSlots((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)));
  };

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Set Test Drive Availability
            <div className="mt-1 text-sm font-normal text-slate-500">
              {props.vehicle.title}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-slate-600">
          Configure recurring weekly availability for test drives. Current availability is loaded automatically.
        </div>

        <div className="mt-4 space-y-4">
          {slots.map((slot, idx) => (
            <Card key={slot.id} className="border border-slate-200">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-800">Time Slot #{idx + 1}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSlot(slot.id)}
                    className="text-slate-500"
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Day of Week</Label>
                    <Select
                      value={slot.dayOfWeek}
                      onValueChange={(v) => setSlot(slot.id, { dayOfWeek: v as DayOfWeek })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
                        ].map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => setSlot(slot.id, { startTime: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => setSlot(slot.id, { endTime: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Meeting Address for Test Drive</Label>
                  <Textarea
                    value={slot.meetingAddress}
                    onChange={(e) => setSlot(slot.id, { meetingAddress: e.target.value })}
                    rows={2}
                    placeholder="e.g. Urumu, Okinawa"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => setSlots((p) => [...p, makeSlot()])}>
              + Add Another Time Slot
            </Button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => props.onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                props.onSave(slots);
                props.onOpenChange(false);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Availability
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}