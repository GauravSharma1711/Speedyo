"use client"
import React, { useState, useEffect } from "react";
import { Vehicle, PublicUser, Notification, User } from "@/entities/all";
import { DealershipVehicleAgreement } from '@/entities/DealershipVehicleAgreement';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Car, Star, Calendar, DollarSign, Building, XCircle, CheckCircle } from "lucide-react";
import CreateVehicleModal from "../dashboard/CreateVehicleModal";
import AdminAvailabilityManager from "./AdminAvailabilityManager";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from
"@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from
"@/components/ui/select";

export default function ListingManagement({ initialEditVehicleId }) {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [managingAvailabilityVehicle, setManagingAvailabilityVehicle] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [dealerships, setDealerships] = useState([]);
  const [showAssociateDealershipModal, setShowAssociateDealershipModal] = useState(false);
  const [selectedVehicleForAssociation, setSelectedVehicleForAssociation] = useState(null);
  const [selectedDealershipId, setSelectedDealershipId] = useState('');

  useEffect(() => {
    loadVehicles();
    loadCurrentUser();
    loadDealerships();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load current user:", error);
    }
  };

  // Handle initial edit request from URL parameter
  useEffect(() => {
    if (initialEditVehicleId && vehicles.length > 0) {
      const vehicleToEdit = vehicles.find((v) => v.id === initialEditVehicleId);
      if (vehicleToEdit) {
        handleEditVehicle(vehicleToEdit);
      }
    }
  }, [initialEditVehicleId, vehicles]);

  const loadVehicles = async () => {
    setIsLoading(true);
    try {
      const allVehicles = await Vehicle.list("-created_date", 100);
      setVehicles(allVehicles);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }
    setIsLoading(false);
  };

  const loadDealerships = async () => {
    try {
      const agreements = await DealershipVehicleAgreement.filter({ status: 'signed' });
      setDealerships(agreements);
    } catch (error) {
      console.error('Failed to load dealerships:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing permanently?")) {
      try {
        await Vehicle.delete(id);
        loadVehicles();
      } catch (e) {
        alert("Failed to delete listing.");
      }
    }
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleManageAvailability = (vehicle) => {
    setManagingAvailabilityVehicle(vehicle);
    setShowAvailabilityModal(true);
  };

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      await Vehicle.update(editingVehicle.id, vehicleData);
      setShowEditModal(false);
      setEditingVehicle(null);
      loadVehicles();

      // Notify the original owner if this is a managed sale
      if (editingVehicle.website_managed && editingVehicle.original_owner_id) {
        try {
          const ownerProfiles = await PublicUser.filter({ user_id: editingVehicle.original_owner_id });

          if (ownerProfiles && ownerProfiles.length > 0) {
            await Notification.create({
              recipient_id: editingVehicle.original_owner_id,
              sender_id: currentUser?.id || 'admin',
              type: "managed_sale_status",
              content: `Your managed sale listing "${editingVehicle.title}" has been updated by our team.`,
              related_entity_type: "Vehicle",
              related_entity_id: editingVehicle.id,
              url: createPageUrl(`Vehicle?id=${editingVehicle.id}`),
              icon: "Edit"
            });
          }
        } catch (notificationError) {
          console.error("Failed to send notification to owner:", notificationError);
        }
      }

      alert("Vehicle listing updated successfully!");
    } catch (error) {
      console.error("Failed to update vehicle:", error);
      alert("Failed to update vehicle listing. Please try again.");
    }
  };

  const handleToggleFeatured = async (vehicleId) => {
    try {
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle) {
        await Vehicle.update(vehicleId, { featured: !vehicle.featured });

        // Show confirmation message
        const action = vehicle.featured ? 'removed from' : 'added to';
        alert(`Vehicle ${action} featured listings successfully!`);

        loadVehicles(); // Reload to see changes
      }
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      alert("Failed to update featured status. Please try again.");
    }
  };

  const handleMarkAsSold = async (vehicleId) => {
    if (window.confirm("Are you sure you want to mark this vehicle as sold?")) {
      try {
        await Vehicle.update(vehicleId, { status: 'sold' });
        alert("Vehicle marked as sold successfully!");
        loadVehicles();
      } catch (error) {
        console.error("Failed to mark as sold:", error);
        alert("Failed to mark vehicle as sold. Please try again.");
      }
    }
  };

  const handleAssociateDealership = (vehicle) => {
    setSelectedVehicleForAssociation(vehicle);
    setSelectedDealershipId(vehicle.dealership_agreement_id || '');
    setShowAssociateDealershipModal(true);
  };

  const handleSaveAssociation = async () => {
    if (!selectedVehicleForAssociation || !selectedDealershipId) return;

    try {
      const dealership = dealerships.find((d) => d.id === selectedDealershipId);

      await Vehicle.update(selectedVehicleForAssociation.id, {
        dealership_name: dealership.dealership_name,
        dealership_agreement_id: dealership.id
      });

      await loadVehicles();
      setShowAssociateDealershipModal(false);
      setSelectedVehicleForAssociation(null);
      setSelectedDealershipId('');
      alert('Vehicle successfully associated with dealership!');
    } catch (error) {
      console.error('Failed to associate vehicle:', error);
      alert('Failed to associate vehicle. Please try again.');
    }
  };

  const handleRemoveAssociation = async (vehicle) => {
    if (!window.confirm('Remove dealership association from this vehicle?')) return;

    try {
      await Vehicle.update(vehicle.id, {
        dealership_name: null,
        dealership_agreement_id: null
      });

      await loadVehicles();
      alert('Dealership association removed!');
    } catch (error) {
      console.error('Failed to remove association:', error);
      alert('Failed to remove association. Please try again.');
    }
  };

  const filteredVehicles = vehicles.filter((v) =>
    v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
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
              <Card key={vehicle.id} className="border border-slate-200 hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Vehicle Image */}
                    <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0">
                      {vehicle.primary_image_small || vehicle.primary_image ? (
                        <img
                          src={vehicle.primary_image_small || vehicle.primary_image}
                          alt={vehicle.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Car className="w-12 h-12 text-slate-400" />
                      )}
                    </div>

                    {/* Vehicle display info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-lg text-slate-900">{vehicle.title}</div>
                      <div className="text-sm text-slate-500">{`${vehicle.year} ${vehicle.make} ${vehicle.model}`}</div>
                      {/* Price updated to USD format */}
                      <div className="mt-2 text-xl font-bold text-slate-900">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD"
                        }).format(parseFloat(vehicle.price || 0))}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`capitalize ${
                            vehicle.status === 'sold' 
                              ? 'bg-green-100 text-green-800 border-green-300' 
                              : 'text-slate-700 border-slate-300'
                          }`}
                        >
                          {vehicle.status === 'sold' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {vehicle.status}
                        </Badge>
                        <Badge variant="outline" className="text-slate-700 border-slate-300">
                          {vehicle.website_managed ? "Speedio Managed" : "Self Listed"}
                        </Badge>
                        {vehicle.featured && (
                          <Badge className="bg-amber-500 text-white border-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <span className="text-sm text-slate-600 whitespace-nowrap">Listed by: {vehicle.created_by}</span>
                      </div>

                      {/* Dealership Association Badge */}
                      {vehicle.dealership_name && (
                        <Badge variant="outline" className="mt-2 text-slate-700 border-slate-300">
                          <Building className="w-3 h-3 mr-1" />
                          {vehicle.dealership_name}
                        </Badge>
                      )}

                      {/* Availability Status for Managed Vehicles */}
                      {vehicle.website_managed && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-slate-800">Test Drive Availability</h4>
                              {vehicle.recurring_availability && vehicle.recurring_availability.length > 0 ? (
                                <p className="text-sm text-slate-600">
                                  {vehicle.recurring_availability.length} time slots configured
                                </p>
                              ) : (
                                <p className="text-sm text-slate-600">No availability set - manual coordination required</p>
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
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2 min-w-fit mt-4 sm:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditVehicle(vehicle)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Listing
                      </Button>

                      {/* Mark as Sold Button */}
                      {vehicle.status === 'available' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsSold(vehicle.id)}
                          className="text-slate-700 border-slate-300 hover:bg-slate-100"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Mark as Sold
                        </Button>
                      )}

                      {/* Featured Toggle Button */}
                      <Button
                        variant={vehicle.featured ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleFeatured(vehicle.id)}
                        className={vehicle.featured ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-slate-700 border-slate-300 hover:bg-slate-100"}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        {vehicle.featured ? "Remove Featured" : "Make Featured"}
                      </Button>

                      {/* Associate with Dealership Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssociateDealership(vehicle)}
                        className="text-slate-700 border-slate-300 hover:bg-slate-100"
                      >
                        <Building className="w-4 h-4 mr-2" />
                        {vehicle.dealership_name ? 'Change Dealership' : 'Associate Dealership'}
                      </Button>

                      {vehicle.dealership_name && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveAssociation(vehicle)}
                          className="text-slate-700 border-slate-300 hover:bg-slate-100"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Remove Association
                        </Button>
                      )}

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
          </div>
        </CardContent>
      </Card>

      {/* Edit Vehicle Modal */}
      {showEditModal && editingVehicle && (
        <CreateVehicleModal
          isOpen={showEditModal}
          vehicleToEdit={editingVehicle}
          user={currentUser}
          onVehicleCreated={handleUpdateVehicle}
          onClose={() => {
            setShowEditModal(false);
            setEditingVehicle(null);
          }}
        />
      )}

      {/* Admin Availability Management Modal */}
      {showAvailabilityModal && managingAvailabilityVehicle && (
        <AdminAvailabilityManager
          isOpen={showAvailabilityModal}
          onClose={() => {
            setShowAvailabilityModal(false);
            setManagingAvailabilityVehicle(null);
          }}
          vehicle={managingAvailabilityVehicle}
          onUpdate={() => {
            loadVehicles();
            setShowAvailabilityModal(false);
            setManagingAvailabilityVehicle(null);
          }}
        />
      )}

      {/* Associate Dealership Modal */}
      {showAssociateDealershipModal &&
        <Dialog open={showAssociateDealershipModal} onOpenChange={setShowAssociateDealershipModal}>
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
                    {dealerships.length > 0 ?
                      dealerships.map((dealership) =>
                        <SelectItem key={dealership.id} value={dealership.id}>
                          {dealership.dealership_name} - {dealership.vehicle_year} {dealership.vehicle_make} {dealership.vehicle_model}
                        </SelectItem>
                      ) :

                      <SelectItem value="no-dealerships" disabled>No signed dealership agreements found.</SelectItem>
                    }
                  </SelectContent>
                </Select>
                {dealerships.length === 0 &&
                  <p className="text-sm text-amber-600 mt-2">
                    No signed dealership agreements found. Create and sign an agreement first.
                  </p>
                }
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAssociateDealershipModal(false)}>

                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAssociation}
                  disabled={!selectedDealershipId}
                  className="bg-gradient-to-r from-blue-500 to-emerald-500">

                  Associate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    </>
  );
}