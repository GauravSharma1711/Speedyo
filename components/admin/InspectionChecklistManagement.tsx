"use client"
import React, { useState, useEffect } from "react";
import { VehicleInspectionChecklist, ManagedSaleRequest } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardCheck, Plus, Eye, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import VehicleInspectionChecklistModal from "./VehicleInspectionChecklistModal";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InspectionChecklistManagement() {
  const [checklists, setChecklists] = useState([]);
  const [managedSaleRequests, setManagedSaleRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [checklistToLink, setChecklistToLink] = useState(null);
  const [selectedMSRId, setSelectedMSRId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [checklistsData, msrData] = await Promise.all([
        VehicleInspectionChecklist.list("-created_date", 100),
        ManagedSaleRequest.list("-created_date", 100)
      ]);
      setChecklists(checklistsData);
      setManagedSaleRequests(msrData);
    } catch (error) {
      console.error("Failed to load checklists:", error);
      toast({
        title: "Loading Failed",
        description: "Could not load inspection checklists.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleCreateNew = () => {
    setSelectedChecklist(null);
    setShowChecklistModal(true);
  };

  const handleView = (checklist) => {
    setSelectedChecklist(checklist);
    setShowChecklistModal(true);
  };

  const handleDelete = async (checklistId) => {
    if (window.confirm("Are you sure you want to delete this checklist?")) {
      try {
        await VehicleInspectionChecklist.delete(checklistId);
        toast({
          title: "Checklist Deleted",
          description: "Inspection checklist has been deleted.",
          variant: "success",
        });
        loadData();
      } catch (error) {
        console.error("Failed to delete checklist:", error);
        toast({
          title: "Delete Failed",
          description: "Could not delete the checklist.",
          variant: "destructive",
        });
      }
    }
  };

  const handleLinkToMSR = (checklist) => {
    setChecklistToLink(checklist);
    setSelectedMSRId(checklist.managed_sale_request_id || "");
    setShowLinkModal(true);
  };

  const handleSaveLink = async () => {
    if (!checklistToLink || !selectedMSRId) return;

    try {
      await VehicleInspectionChecklist.update(checklistToLink.id, {
        managed_sale_request_id: selectedMSRId
      });

      toast({
        title: "Link Updated",
        description: "Checklist has been linked to the managed sale request.",
        variant: "success",
      });

      setShowLinkModal(false);
      setChecklistToLink(null);
      setSelectedMSRId("");
      loadData();
    } catch (error) {
      console.error("Failed to link checklist:", error);
      toast({
        title: "Link Failed",
        description: "Could not link the checklist to MSR.",
        variant: "destructive",
      });
    }
  };

  const handleChecklistSave = () => {
    toast({
      title: "Checklist Saved",
      description: "Vehicle inspection checklist has been saved successfully.",
      variant: "success",
    });
    setShowChecklistModal(false);
    setSelectedChecklist(null);
    loadData();
  };

  const getLinkedMSR = (checklistId) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist || !checklist.managed_sale_request_id) return null;
    return managedSaleRequests.find(msr => msr.id === checklist.managed_sale_request_id);
  };

  const filteredChecklists = checklists.filter(checklist =>
    checklist.vehicle_info?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.vehicle_info?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.dealership_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    checklist.vehicle_info?.vin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-500" />
              Vehicle Inspection Checklists
            </CardTitle>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Checklist
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search by make, model, dealership, or VIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Dealership</TableHead>
                  <TableHead>Inspection Date</TableHead>
                  <TableHead>Inspector</TableHead>
                  <TableHead>Linked MSR</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChecklists.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No checklists found. Create your first inspection checklist.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredChecklists.map((checklist) => {
                    const linkedMSR = getLinkedMSR(checklist.id);
                    return (
                      <TableRow key={checklist.id}>
                        <TableCell>
                          <div className="font-medium">
                            {checklist.vehicle_info?.year} {checklist.vehicle_info?.make} {checklist.vehicle_info?.model}
                          </div>
                          {checklist.vehicle_info?.vin && (
                            <div className="text-xs text-slate-500">VIN: {checklist.vehicle_info.vin}</div>
                          )}
                        </TableCell>
                        <TableCell>{checklist.dealership_name || 'N/A'}</TableCell>
                        <TableCell>
                          {checklist.date_of_inspection ? format(new Date(checklist.date_of_inspection), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>{checklist.inspector_name}</TableCell>
                        <TableCell>
                          {linkedMSR ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Linked
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600">
                              Unlinked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(checklist)}
                              title="View Checklist"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLinkToMSR(checklist)}
                              title="Link to MSR"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(checklist.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Checklist Modal */}
      {showChecklistModal && (
        <VehicleInspectionChecklistModal
          isOpen={showChecklistModal}
          onClose={() => {
            setShowChecklistModal(false);
            setSelectedChecklist(null);
          }}
          managedSaleRequest={null}
          existingChecklist={selectedChecklist}
          onSave={handleChecklistSave}
        />
      )}

      {/* Link to MSR Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Checklist to Managed Sale Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-2">
                Select a managed sale request to link this checklist to:
              </p>
              <Select value={selectedMSRId} onValueChange={setSelectedMSRId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select managed sale request" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None (Unlink)</SelectItem>
                  {managedSaleRequests.map((msr) => (
                    <SelectItem key={msr.id} value={msr.id}>
                      {msr.vehicle_details.title} - {msr.vehicle_details.make} {msr.vehicle_details.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLinkModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLink}>
                Save Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}