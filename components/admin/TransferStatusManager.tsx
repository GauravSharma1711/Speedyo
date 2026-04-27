
"use client"
import React, { useState, useEffect } from 'react';
import { VehicleTransfer, Vehicle, Notification } from '@/entities/all';
import { PublicUser } from '@/entities/PublicUser';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const SPEEDIO_MANAGED_STEPS = [
  { number: 1, title: 'Documents Prepared' },
  { number: 2, title: 'LTO Inspection Completed' },
  { number: 3, title: 'PDI Insurance Purchased' },
  { number: 4, title: 'JSVRO Paperwork Submitted' },
  { number: 5, title: 'Y-Plates Purchased & Installed' },
  { number: 6, title: 'JSVRO Finalization Complete' }
];

const SELF_SERVICE_STEPS = [
  { number: 1, title: 'JSVRO Paperwork Submitted' },
  { number: 2, title: 'Y-Plates Purchased & Installed' },
  { number: 3, title: 'LTO Inspection Completed' },
  { number: 4, title: 'Returned to JSVRO' },
  { number: 5, title: 'Road Tax Conversion Complete' },
  { number: 6, title: 'Final SOFA Registration Complete' }
];

export default function TransferStatusManager() {
  const [transfers, setTransfers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [transfersData, vehiclesData, usersData] = await Promise.all([
        VehicleTransfer.list('-created_date', 100),
        Vehicle.list('-created_date', 100),
        PublicUser.list()
      ]);
      setTransfers(transfersData);
      setVehicles(vehiclesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transfer data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTransfers = transfers.filter((transfer) => {
    const vehicle = vehicles.find(v => v.id === transfer.vehicle_id);
    const buyer = users.find(u => u.user_id === transfer.buyer_id);
    
    return (
      vehicle?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      buyer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleUpdateTransfer = async (transferId, updates) => {
    try {
      await VehicleTransfer.update(transferId, updates);
      
      // Send notification to buyer
      const transfer = transfers.find(t => t.id === transferId);
      if (transfer?.buyer_id) {
        await Notification.create({
          recipient_id: transfer.buyer_id,
          type: 'vehicle_edit_request',
          content: `Your vehicle transfer status has been updated: Step ${updates.current_step || transfer.current_step} completed.`,
          related_entity_type: 'VehicleTransfer',
          related_entity_id: transferId,
          icon: 'CheckCircle'
        });
      }

      // Send notification to seller if managed sale
      if (transfer?.seller_id) {
        await Notification.create({
          recipient_id: transfer.seller_id,
          type: 'vehicle_edit_request',
          content: `Transfer status updated for your managed vehicle.`,
          related_entity_type: 'VehicleTransfer',
          related_entity_id: transferId,
          icon: 'CheckCircle'
        });
      }

      toast({
        title: 'Success',
        description: 'Transfer status updated successfully'
      });
      
      await loadData();
      setShowEditModal(false);
    } catch (error) {
      console.error('Failed to update transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transfer status',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Transfer Status Management</h2>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <CreateTransferModal 
              vehicles={vehicles} 
              users={users} 
              onSuccess={() => {
                setShowCreateModal(false);
                loadData();
              }} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search by vehicle, buyer, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Transfers List */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-slate-600 py-8">Loading transfers...</p>
        ) : filteredTransfers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No transfers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredTransfers.map((transfer) => {
            const vehicle = vehicles.find(v => v.id === transfer.vehicle_id);
            const buyer = users.find(u => u.user_id === transfer.buyer_id);
            const seller = users.find(u => u.user_id === transfer.seller_id);

            return (
              <Card key={transfer.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {vehicle?.title || 'Unknown Vehicle'}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'} className="capitalize">
                          {transfer.status === 'in_progress' ? 'In Progress' : transfer.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {transfer.transfer_type === 'speedio_managed' ? 'Speedio-Managed' : 'Self-Service'}
                        </Badge>
                        <span className="text-sm text-slate-600">
                          Step {transfer.current_step} of {transfer.transfer_type === 'speedio_managed' ? 6 : 6}
                        </span>
                      </div>
                    </div>
                    <Dialog open={showEditModal && selectedTransfer?.id === transfer.id} onOpenChange={(open) => {
                      setShowEditModal(open);
                      if (!open) setSelectedTransfer(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransfer(transfer)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                        <EditTransferModal
                          transfer={transfer}
                          vehicle={vehicle}
                          onUpdate={handleUpdateTransfer}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500">Buyer</p>
                      <p className="font-medium text-slate-800">{buyer?.full_name || 'Unknown'}</p>
                    </div>
                    {seller && (
                      <div>
                        <p className="text-slate-500">Seller</p>
                        <p className="font-medium text-slate-800">{seller?.full_name}</p>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                        style={{ width: `${((transfer.steps_completed?.length || 0) / 6) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

function CreateTransferModal({ vehicles, users, onSuccess }) {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    transfer_type: 'speedio_managed',
    buyer_id: '',
    seller_id: '',
    current_step: 1,
    steps_completed: [],
    status: 'in_progress',
    user_facing_notes: '',
    admin_notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await VehicleTransfer.create({
        ...formData,
        initiated_date: new Date().toISOString()
      });

      toast({
        title: 'Success',
        description: 'Transfer created successfully'
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create transfer:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transfer',
        variant: 'destructive'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create New Transfer</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label>Vehicle</Label>
          <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({...formData, vehicle_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map(vehicle => (
                <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Transfer Type</Label>
          <Select value={formData.transfer_type} onValueChange={(value) => setFormData({...formData, transfer_type: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="speedio_managed">Speedio-Managed</SelectItem>
              <SelectItem value="self_service">Self-Service</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Buyer</Label>
          <Select value={formData.buyer_id} onValueChange={(value) => setFormData({...formData, buyer_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select buyer" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>{user.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Seller (Optional)</Label>
          <Select value={formData.seller_id} onValueChange={(value) => setFormData({...formData, seller_id: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select seller (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={null}>None</SelectItem>
              {users.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>{user.full_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>User-Facing Notes</Label>
          <Textarea
            value={formData.user_facing_notes}
            onChange={(e) => setFormData({...formData, user_facing_notes: e.target.value})}
            placeholder="Notes visible to buyer and seller..."
          />
        </div>

        <div>
          <Label>Admin Notes</Label>
          <Textarea
            value={formData.admin_notes}
            onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
            placeholder="Internal notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Create Transfer</Button>
      </div>
    </form>
  );
}

function EditTransferModal({ transfer, vehicle, onUpdate }) {
  const [formData, setFormData] = useState({
    current_step: transfer.current_step,
    steps_completed: transfer.steps_completed || [],
    status: transfer.status,
    user_facing_notes: transfer.user_facing_notes || '',
    admin_notes: transfer.admin_notes || ''
  });

  const steps = transfer.transfer_type === 'speedio_managed' ? SPEEDIO_MANAGED_STEPS : SELF_SERVICE_STEPS;

  const handleStepToggle = (stepNumber) => {
    const isCompleted = formData.steps_completed.includes(stepNumber);
    const newStepsCompleted = isCompleted
      ? formData.steps_completed.filter(s => s !== stepNumber)
      : [...formData.steps_completed, stepNumber].sort((a, b) => a - b);

    // Auto-update current_step to the next incomplete step
    const nextStep = steps.find(s => !newStepsCompleted.includes(s.number));
    
    setFormData({
      ...formData,
      steps_completed: newStepsCompleted,
      current_step: nextStep ? nextStep.number : steps.length,
      status: newStepsCompleted.length === steps.length ? 'completed' : formData.status,
      completed_date: newStepsCompleted.length === steps.length ? new Date().toISOString() : null
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(transfer.id, formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>Update Transfer Status</DialogTitle>
        <p className="text-sm text-slate-600">{vehicle?.title}</p>
      </DialogHeader>

      <div className="space-y-4">
        <div>
          <Label className="mb-3 block">Completed Steps</Label>
          <div className="space-y-2">
            {steps.map((step) => (
              <div key={step.number} className="flex items-center space-x-2">
                <Checkbox
                  id={`step-${step.number}`}
                  checked={formData.steps_completed.includes(step.number)}
                  onCheckedChange={() => handleStepToggle(step.number)}
                />
                <label
                  htmlFor={`step-${step.number}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Step {step.number}: {step.title}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>User-Facing Notes</Label>
          <Textarea
            value={formData.user_facing_notes}
            onChange={(e) => setFormData({...formData, user_facing_notes: e.target.value})}
            placeholder="Notes visible to buyer and seller..."
            rows={3}
          />
        </div>

        <div>
          <Label>Admin Notes (Internal)</Label>
          <Textarea
            value={formData.admin_notes}
            onChange={(e) => setFormData({...formData, admin_notes: e.target.value})}
            placeholder="Internal notes..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
}