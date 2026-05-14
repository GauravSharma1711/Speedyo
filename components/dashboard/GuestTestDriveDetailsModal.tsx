
"use client"

import Link from "next/link";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { X, Calendar, Clock as ClockIcon, Car, CheckCircle2, XCircle, Info, MessageSquare, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

import { useRouter } from "next/navigation";

const TestDriveStatusInfo = ({ status }: { status: string }) => {
    const statusConfig: Record<string, { icon: React.ReactNode; text: string; color: string }> = {
        pending_review: { icon: <ClockIcon className="w-4 h-4" />, text: "Pending Seller Approval", color: "bg-amber-100 text-amber-800" },
        approved: { icon: <CheckCircle2 className="w-4 h-4" />, text: "Approved by Seller", color: "bg-emerald-100 text-emerald-800" },
        declined: { icon: <XCircle className="w-4 h-4" />, text: "Declined by Seller", color: "bg-red-100 text-red-800" },
        cancelled: { icon: <Info className="w-4 h-4" />, text: "Cancelled by You", color: "bg-slate-100 text-slate-800" },
        completed: { icon: <CheckCircle2 className="w-4 h-4" />, text: "Completed", color: "bg-blue-100 text-blue-800" },
    };
    const config = statusConfig[status] || statusConfig.pending_review;

    return (
        <Badge className={`gap-2 text-sm ${config.color}`}>
            {config.icon}
            {config.text}
        </Badge>
    );
};

export default function GuestTestDriveDetailsModal({ isOpen, onClose, testDriveMessage, vehicle, seller, onCancelRequest }: {
    isOpen: boolean;
    onClose: () => void;
    testDriveMessage: any;
    vehicle?: any;
    seller?: any;
    onCancelRequest?: (messageId: string) => void;
}) {
    const router = useRouter();
    if (!isOpen || !testDriveMessage) return null;

    const details = testDriveMessage._parsedTestDriveDetails || testDriveMessage.test_drive_details;
    const vehicleInfo = vehicle || (details?.vehicle_title ? {
      title: details.vehicle_title,
      primary_image: null,
      price: null,
      year: null,
      make: null,
      model: null,
    } : null);

    if (!vehicleInfo) return null;
    const canBeCancelled = details?.status === 'pending_review';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-lg"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Card className="bg-white/95 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle>Car Viewing Request Details</CardTitle>
                                <CardDescription>Your request sent to the seller</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-700">Status:</span>
                                <TestDriveStatusInfo status={details?.status || 'pending_review'} />
                            </div>

                            {/* Vehicle Info */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                                <div className="w-24 h-16 bg-slate-200 rounded-md overflow-hidden flex-shrink-0">
                                    {vehicleInfo.primary_image ? (
                                        <img src={vehicleInfo.primary_image} alt={vehicleInfo.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <Car className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-800">{vehicleInfo.title || 'Car Viewing Request'}</h4>
                                    <p className="text-lg font-bold text-blue-600">${vehicleInfo.price?.toLocaleString() || 'N/A'}</p>
                                    <p className="text-sm text-slate-500">{vehicleInfo.year || ''} {vehicleInfo.make || ''} {vehicleInfo.model || ''}</p>
                                </div>
                            </div>

                            {/* Seller Info */}
                            {seller && (
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                                    <UserIcon className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-slate-800">Seller: {seller.full_name}</p>
                                        <p className="text-sm text-slate-600">{seller.email}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Request Details */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    Request Details
                                </h4>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Preferred Date:</span>
                                        <p className="font-medium">
                                            {details?.preferred_date 
                                                ? format(new Date(details.preferred_date), 'EEE, MMM d, yyyy')
                                                : 'Not specified'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Preferred Time:</span>
                                        <p className="font-medium">{details?.preferred_time || 'Not specified'}</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <span className="text-slate-500">Location:</span>
                                    <p className="font-medium">{details?.location || 'Not specified'}</p>
                                </div>
                                
                                {details?.notes && (
                                    <div>
                                        <span className="text-slate-500">Your Notes:</span>
                                        <div className="mt-1 p-3 bg-white border border-slate-200 rounded-md">
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{details.notes}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submission Info */}
                            <div className="text-xs text-slate-500 border-t pt-4">
                                Request submitted on {format(new Date(testDriveMessage.created_date), 'MMM d, yyyy \'at\' h:mm a')}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                {seller && (
    <Link href={`/messages?recipientId=${seller.id}&vehicleId=${vehicle.id}`}>
    <Button variant="outline" className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Message Seller
    </Button>
</Link>
                                )}
                                
                                {canBeCancelled && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => onCancelRequest?.(testDriveMessage.id)}
                                        className="flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel Request
                                    </Button>
                                )}
                                
                                <Button variant="outline" onClick={onClose} className="ml-auto">
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}