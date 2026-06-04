// "use client"

// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/Button';
// import { Input } from '@/components/ui/Input';
// import { Textarea } from '@/components/ui/TextArea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
// import { Label } from '@/components/ui/Label';
// import { Loader2, Trash2, ChevronLeft, ChevronRight, CheckCircle, Upload } from 'lucide-react';
// import { useToast } from "@/components/ui/UseToast";
// import { userService } from "@/services/dashboard/userService";
// import { Dialog, DialogContent, DialogTitle } from "@/components/ui/Dialog";

// // Client-side image processor
// const processImageToMultipleSizes = async (file) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
    
//     reader.onload = async (e) => {
//       const img = new Image();
      
//       img.onload = async () => {
//         try {
//           const sizes = [
//             { name: 'thumbnail', width: 150, quality: 0.75, maxSizeKB: 100 },
//             { name: 'small', width: 640, quality: 0.80, maxSizeKB: 150 },
//             { name: 'medium', width: 1024, quality: 0.80, maxSizeKB: 200 },
//             { name: 'large', width: 1920, quality: 0.85, maxSizeKB: 250 }
//           ];
          
//           const results = {};
//           const stats = [];
          
//           for (const sizeConfig of sizes) {
//             const scale = Math.min(sizeConfig.width / img.width, sizeConfig.width / img.height, 1);
//             const targetWidth = Math.round(img.width * scale);
//             const targetHeight = Math.round(img.height * scale);
            
//             const canvas = document.createElement('canvas');
//             canvas.width = targetWidth;
//             canvas.height = targetHeight;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
            
//             let quality = sizeConfig.quality;
//             let blob = await new Promise(res => canvas.toBlob(res, 'image/webp', quality));
//             let attempts = 0;
//             const maxAttempts = 5;
            
//             if (sizeConfig.maxSizeKB) {
//               const maxSizeBytes = sizeConfig.maxSizeKB * 1024;
              
//               while (blob.size > maxSizeBytes && attempts < maxAttempts && quality > 0.5) {
//                 attempts++;
//                 quality -= 0.05;
//                 blob = await new Promise(res => canvas.toBlob(res, 'image/webp', quality));
//               }
//             }
            
//             const finalSizeKB = blob.size / 1024;
//             const meetsTarget = !sizeConfig.maxSizeKB || finalSizeKB <= sizeConfig.maxSizeKB;
            
//             const webpFile = new File(
//               [blob], 
//               file.name.replace(/\.[^.]+$/, `_${sizeConfig.name}.webp`),
//               { type: 'image/webp' }
//             );
            
//             results[sizeConfig.name] = webpFile;
//             stats.push({
//               size: sizeConfig.name,
//               dimensions: `${targetWidth}x${targetHeight}`,
//               fileSize: finalSizeKB.toFixed(2),
//               quality: (quality * 100).toFixed(0),
//               meetsTarget
//             });
//           }
          
//           resolve({ files: results, stats });
//         } catch (error) {
//           reject(error);
//         }
//       };
      
//       img.onerror = reject;
//       img.src = e.target.result;
//     };
    
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// };

// export default function CreateVehicleModal({ isOpen, onClose, onVehicleCreated, vehicleToEdit, user, isSubmitting: propIsSubmitting }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState({
//     make: '',
//     model: '',
//     year: '',
//     price: '',
//     mileage: '',
//     condition: 'good',
//     description: '',
//     location: '',
//     fuel_type: 'gasoline',
//     transmission: 'automatic',
//     status: 'available', // Add status field
//     images: [],
//     primary_image: null,
//   });
//   const [isUploading, setIsUploading] = useState(false);
//   const [localLoading, setLocalLoading] = useState(false);
//   const { toast } = useToast();

//   const totalSteps = 3;

//   const steps = [
//     {
//       number: 1,
//       title: "Basic Information",
//       description: "Tell us about your vehicle"
//     },
//     {
//       number: 2,
//       title: "Details & Condition",
//       description: "Describe your vehicle's condition"
//     },
//     {
//       number: 3,
//       title: "Photos & Review",
//       description: "Add photos and review your listing"
//     }
//   ];

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const userMe = await userService.me();
//         setCurrentUser(userMe);
//       } catch (error) {
//         console.error("Failed to fetch current user:", error);
//         toast({ title: "Error", description: "Failed to load user information. Please try again.", variant: "destructive" });
//       }
//     };
//     if (!user) {
//       fetchCurrentUser();
//     } else {
//       setCurrentUser(user);
//     }
//   }, [user, toast]);

//   useEffect(() => {
//     if (vehicleToEdit) {
//       setFormData({
//         make: vehicleToEdit.make || '',
//         model: vehicleToEdit.model || '',
//         year: vehicleToEdit.year || '',
//         price: vehicleToEdit.price || '',
//         mileage: vehicleToEdit.mileage || '',
//         condition: vehicleToEdit.condition || 'good',
//         description: vehicleToEdit.description || '',
//         location: vehicleToEdit.location || '',
//         fuel_type: vehicleToEdit.fuel_type || 'gasoline',
//         transmission: vehicleToEdit.transmission || 'automatic',
//         status: vehicleToEdit.status || 'available', // Add status
//         images: vehicleToEdit.images ? vehicleToEdit.images.map((url) => {
//           if (typeof url === 'string') {
//             return {
//               thumbnail: url,
//               small: url,
//               medium: url,
//               large: url,
//               original: url,
//             };
//           }
//           return url;
//         }) : [],
//         primary_image: vehicleToEdit.primary_image ? (
//           typeof vehicleToEdit.primary_image === 'string' ? {
//             thumbnail: vehicleToEdit.primary_image,
//             small: vehicleToEdit.primary_image,
//             medium: vehicleToEdit.primary_image,
//             large: vehicleToEdit.primary_image,
//             original: vehicleToEdit.primary_image,
//           } : vehicleToEdit.primary_image
//         ) : null,
//       });
//     }
//   }, [vehicleToEdit]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSelectChange = (name, value) => {
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageSelect = async (e) => {
//     e.preventDefault();
//     toast({
//       title: "Image Upload",
//       description: "Image upload functionality is coming soon. Please add images after creating the listing.",
//     });
//     e.target.value = '';
//   };

//   const handleSubmit = async (e) => {
//     if (e) {
//       e.preventDefault();
//       e.stopPropagation();
//     }

//     const submitter = user || currentUser;
//     if (!submitter) {
//       toast({ title: "Error", description: "User information missing. Cannot create listing.", variant: "destructive" });
//       return;
//     }

//     if (!validateStep(1) || !validateStep(2)) {
//       toast({ title: "Please complete all required fields in Step 1 and Step 2.", variant: "destructive" });
//       return;
//     }

//     setLocalLoading(true);

//     try {
//       const primaryImgUrl = formData.primary_image ? formData.primary_image.original : null;

//       const vehicleData = {
//         title: `${formData.year} ${formData.make} ${formData.model}`,
//         make: formData.make,
//         model: formData.model,
//         year: parseInt(formData.year),
//         price: parseFloat(formData.price),
//         mileage: parseInt(formData.mileage),
//         condition: formData.condition,
//         description: formData.description,
//         primary_image: primaryImgUrl,
//         location: formData.location,
//         fuel_type: formData.fuel_type,
//         transmission: formData.transmission,
//         status: formData.status,
//         author_id: submitter.id,
//         author_name: submitter.full_name,
//         author_avatar: submitter.profile_image,
//         author_user_type: submitter.user_type,
//         author_verified: submitter.verified,
//         author_bio: submitter.bio,
//         author_location: submitter.location
//       };

//       let resultVehicle;
//       if (vehicleToEdit) {
//         resultVehicle = await onVehicleCreated(vehicleToEdit.id, vehicleData);
//         toast({ title: "Success!", description: "Vehicle listing updated successfully." });
//       } else {
//         resultVehicle = await onVehicleCreated(vehicleData);
//         toast({ title: "Success!", description: "Vehicle listing submitted successfully." });
//       }
//       onClose();
//     } catch (error) {
//       console.error('Failed to submit vehicle:', error);
//       toast({ title: "Submission Failed", description: `Could not save the vehicle listing: ${error.message || "An unknown error occurred."}`, variant: "destructive" });
//     } finally {
//       setLocalLoading(false);
//     }
//   };

//   const removeImage = (indexToRemove) => {
//     setFormData((prev) => {
//       const updatedImages = prev.images.filter((_, i) => i !== indexToRemove);

//       let newPrimaryImage = prev.primary_image;
//       if (prev.primary_image && prev.images[indexToRemove] && prev.images[indexToRemove].original === prev.primary_image.original) {
//         newPrimaryImage = updatedImages.length > 0 ? updatedImages[0] : null;
//       }

//       return {
//         ...prev,
//         images: updatedImages,
//         primary_image: newPrimaryImage,
//       };
//     });
//   };

//   const validateStep = (step) => {
//     switch (step) {
//       case 1:
//         return formData.make && formData.model && formData.year && formData.price && formData.mileage;
//       case 2:
//         return formData.condition && formData.fuel_type && formData.transmission && formData.location && formData.description;
//       case 3:
//         return true;
//       default:
//         return false;
//     }
//   };

//   const handleNext = () => {
//     if (validateStep(currentStep)) {
//       setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
//     } else {
//       toast({
//         title: "Please complete all required fields",
//         description: "Fill in all required information before proceeding.",
//         variant: "destructive"
//       });
//     }
//   };

//   const handlePrevious = () => {
//     setCurrentStep((prev) => Math.max(prev - 1, 1));
//   };

//   // const handleSubmit = async (e) => {
//   //   if (e) {
//   //     e.preventDefault();
//   //     e.stopPropagation();
//   //   }

//   //   const submitter = user || currentUser;
//   //   if (!submitter) {
//   //     toast({ title: "Error", description: "User information missing. Cannot create listing.", variant: "destructive" });
//   //     return;
//   //   }

//   //   if (!validateStep(1) || !validateStep(2)) {
//   //     toast({ title: "Please complete all required fields in Step 1 and Step 2.", variant: "destructive" });
//   //     return;
//   //   }

//   //   setLocalLoading(true);

//   //   try {
//   //     const validImageUrls = formData.images.map(img => img.original).filter(Boolean);
//   //     const primaryImgUrl = formData.primary_image ? formData.primary_image.original : (validImageUrls.length > 0 ? validImageUrls[0] : null);

//   //     const vehicleData = {
//   //       title: `${formData.year} ${formData.make} ${formData.model}`,
//   //       make: formData.make,
//   //       model: formData.model,
//   //       year: parseInt(formData.year),
//   //       price: parseFloat(formData.price),
//   //       mileage: parseInt(formData.mileage),
//   //       condition: formData.condition,
//   //       description: formData.description,
//   //       primary_image: primaryImgUrl,
//   //       images: validImageUrls,
//   //       location: formData.location,
//   //       fuel_type: formData.fuel_type,
//   //       transmission: formData.transmission,
//   //       status: formData.status, // Include status
//   //       author_id: submitter.id,
//   //       author_name: submitter.full_name,
//   //       author_avatar: submitter.profile_image,
//   //       author_user_type: submitter.user_type,
//   //       author_verified: submitter.verified,
//   //       author_bio: submitter.bio,
//   //       author_location: submitter.location
//   //     };

//   //     let resultVehicle;
//   //     if (vehicleToEdit) {
//   //       resultVehicle = await onVehicleCreated(vehicleToEdit.id, vehicleData);
//   //       toast({ title: "Success!", description: "Vehicle listing updated successfully." });
//   //     } else {
//   //       resultVehicle = await onVehicleCreated(vehicleData);
//   //       toast({ title: "Success!", description: "Vehicle listing submitted successfully." });

//   //       if (resultVehicle && resultVehicle.id) {
//   //         try {
//   //           await base44.functions.invoke('notifyFollowersOfNewVehicle', { vehicleId: resultVehicle.id });
//   //           toast({ title: "Notification Sent", description: "Followers have been notified about your new listing." });
//   //         } catch (notifError) {
//   //           console.error("Failed to notify followers:", notifError);
//   //           toast({ title: "Notification Failed", description: "Could not notify followers, but vehicle was created.", variant: "warning" });
//   //         }
//   //       }
//   //     }
//   //     onClose();
//   //   } catch (error) {
//   //     console.error('Failed to submit vehicle:', error);
//   //     toast({ title: "Submission Failed", description: `Could not save the vehicle listing: ${error.message || "An unknown error occurred."}`, variant: "destructive" });
//   //   } finally {
//   //     setLocalLoading(false);
//   //   }
//   // };

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-6">
//               <h3 className="text-lg font-semibold text-slate-800">Basic Vehicle Information</h3>
//               <p className="text-sm text-slate-600 mt-1">Let's start with the essential details about your vehicle</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="make">Make *</Label>
//                 <Input id="make" name="make" value={formData.make} onChange={handleChange} placeholder="e.g. Toyota" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="model">Model *</Label>
//                 <Input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. Camry" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="year">Year *</Label>
//                 <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} placeholder="e.g. 2020" required />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="price">Price (JPY) *</Label>
//                 <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g. 25000" required />
//               </div>
//               <div className="space-y-2 md:col-span-2">
//                 <Label htmlFor="mileage">Mileage *</Label>
//                 <Input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} placeholder="e.g. 50000" required />
//               </div>
//             </div>
//           </div>
//         );

//       case 2:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-6">
//               <h3 className="text-lg font-semibold text-slate-800">Vehicle Details & Condition</h3>
//               <p className="text-sm text-slate-600 mt-1">Help buyers understand your vehicle better</p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="condition">Condition *</Label>
//                 <Select name="condition" value={formData.condition} onValueChange={(v) => handleSelectChange('condition', v)}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="excellent">Excellent Condition</SelectItem>
//                     <SelectItem value="good">Good Condition</SelectItem>
//                     <SelectItem value="fair">Fair Condition</SelectItem>
//                     <SelectItem value="poor">Poor Condition</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="fuel_type">Fuel Type *</Label>
//                 <Select name="fuel_type" value={formData.fuel_type} onValueChange={(v) => handleSelectChange('fuel_type', v)}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="gasoline">Gasoline</SelectItem>
//                     <SelectItem value="diesel">Diesel</SelectItem>
//                     <SelectItem value="hybrid">Hybrid</SelectItem>
//                     <SelectItem value="electric">Electric</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="transmission">Transmission *</Label>
//                 <Select name="transmission" value={formData.transmission} onValueChange={(v) => handleSelectChange('transmission', v)}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="automatic">Automatic</SelectItem>
//                     <SelectItem value="manual">Manual</SelectItem>
//                     <SelectItem value="cvt">CVT</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             {/* Status Dropdown - Only show when editing */}
//             {vehicleToEdit && (
//               <div className="space-y-2">
//                 <Label htmlFor="status">Listing Status *</Label>
//                 <Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
//                   <SelectTrigger><SelectValue /></SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="available">Available</SelectItem>
//                     <SelectItem value="unavailable">Unavailable</SelectItem>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="sold">Sold</SelectItem>
//                     <SelectItem value="cancelled">Cancelled</SelectItem>
//                     <SelectItem value="hidden">Hidden</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <p className="text-xs text-slate-500 mt-1">
//                   Set to "Unavailable" to temporarily hide from marketplace, or "Hidden" if seller downgraded to guest
//                 </p>
//               </div>
//             )}

//             <div className="space-y-2">
//               <Label htmlFor="location">Location *</Label>
//               <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Los Angeles, CA" required />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description *</Label>
//               <Textarea
//                 id="description"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//                 required
//                 className="min-h-[120px]"
//                 placeholder="Describe your vehicle's features, maintenance history, and any other relevant details..."
//               />
//             </div>
//           </div>
//         );

//       case 3:
//         return (
//           <div className="space-y-6">
//             <div className="text-center mb-6">
//               <h3 className="text-lg font-semibold text-slate-800">Photos & Final Review</h3>
//               <p className="text-sm text-slate-600 mt-1">Add photos to make your listing stand out</p>
//             </div>

//             <div className="space-y-2">
//               <Label>Vehicle Photos</Label>
//               <div className="mt-2">
//                 <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
//                   <div className="flex flex-col items-center justify-center pt-5 pb-6">
//                     {isUploading ? (
//                       <>
//                         <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
//                         <p className="text-sm text-slate-500">Processing and uploading files...</p>
//                       </>
//                     ) : (
//                       <>
//                         <Upload className="w-8 h-8 text-slate-400 mb-2" />
//                         <p className="text-sm text-slate-500">
//                           <span className="font-semibold">Click to upload</span> or drag and drop
//                         </p>
//                         <p className="text-xs text-slate-500">PNG, JPG, GIF up to 30MB each (optimized to WebP)</p>
//                       </>
//                     )}
//                   </div>
//                   <input
//                     type="file"
//                     className="hidden"
//                     multiple
//                     accept="image/*"
//                     onChange={handleImageSelect}
//                     disabled={isUploading}
//                   />
//                 </label>
//               </div>

//               {formData.images.length > 0 && (
//                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
//                   {formData.images.map((image, index) => (
//                     <div key={index} className="relative group aspect-square">
//                       <img src={image.thumbnail || image.original} alt={`upload preview ${index}`} className="w-full h-full object-cover rounded-md shadow-md" />
//                       {formData.primary_image && image.original === formData.primary_image.original && (
//                         <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
//                           Primary
//                         </div>
//                       )}
//                       <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removeImage(index)}>
//                         <Trash2 className="h-3 w-3" />
//                       </Button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="mt-8 p-6 bg-slate-50 rounded-lg">
//               <h4 className="font-semibold text-slate-800 mb-4">Review Your Listing</h4>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="font-medium text-slate-600">Vehicle:</span> {formData.year} {formData.make} {formData.model}
//                 </div>
//                 <div>
//                   <span className="font-medium text-slate-600">Price:</span> ${parseFloat(formData.price || 0).toLocaleString()}
//                 </div>
//                 <div>
//                   <span className="font-medium text-slate-600">Mileage:</span> {parseInt(formData.mileage || 0).toLocaleString()} miles
//                 </div>
//                 <div>
//                   <span className="font-medium text-slate-600">Condition:</span> {formData.condition}
//                 </div>
//                 <div>
//                   <span className="font-medium text-slate-600">Location:</span> {formData.location}
//                 </div>
//                 <div>
//                   <span className="font-medium text-slate-600">Photos:</span> {formData.images.length} uploaded
//                 </div>
//                 {vehicleToEdit && (
//                   <div>
//                     <span className="font-medium text-slate-600">Status:</span> {formData.status}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl w-full max-h-[90vh] flex flex-col p-0">
//         <DialogTitle className="sr-only">
//           {vehicleToEdit ? 'Edit Vehicle Listing' : 'Create New Vehicle Listing'}
//         </DialogTitle>
//         <div className="bg-gradient-to-r from-blue-600 to-emerald-500 text-white p-6 rounded-t-lg">
//           <div className="flex items-center gap-3">
//             <div>
//               <h2 className="text-2xl font-bold">
//                 {vehicleToEdit ? 'Edit Vehicle Listing' : 'Create New Vehicle Listing'}
//               </h2>
//               <p className="text-blue-100 text-sm mt-1">
//                 {vehicleToEdit ? 'Update your vehicle details' : 'List your vehicle for sale on Speedio'}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
//           <div className="flex items-center justify-between">
//             {steps.map((step, index) => (
//               <div key={step.number} className="flex items-center">
//                 <div className="flex items-center">
//                   <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
//                     currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
//                   }`}>
//                     {validateStep(step.number) && currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
//                   </div>
//                   <div className="ml-3 hidden sm:block">
//                     <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-slate-900' : 'text-slate-500'}`}>
//                       {step.title}
//                     </p>
//                     <p className="text-xs text-slate-500">{step.description}</p>
//                   </div>
//                 </div>
//                 {index < steps.length - 1 && (
//                   <div className={`w-8 sm:w-16 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-slate-200'}`} />
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="flex-1 overflow-y-auto p-6">
//           {renderStepContent()}
//         </div>

//         <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
//           <div>
//             {currentStep > 1 && (
//               <Button type="button" variant="outline" onClick={handlePrevious} disabled={localLoading || propIsSubmitting}>
//                 <ChevronLeft className="w-4 h-4 mr-2" />
//                 Previous
//               </Button>
//             )}
//           </div>

//           <div className="flex gap-3">
//             <Button type="button" variant="outline" onClick={onClose} disabled={localLoading || propIsSubmitting}>
//               Cancel
//             </Button>

//             {currentStep < totalSteps ? (
//               <Button
//                 type="button"
//                 onClick={handleNext}
//                 className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
//                 disabled={!validateStep(currentStep) || localLoading || propIsSubmitting}
//               >
//                 Next
//                 <ChevronRight className="w-4 h-4 ml-2" />
//               </Button>
//             ) : (
//               <Button
//                 type="button"
//                 onClick={handleSubmit}
//                 disabled={localLoading || propIsSubmitting || isUploading || (!user && !currentUser)}
//                 className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600"
//               >
//                 {(localLoading || propIsSubmitting) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                 {vehicleToEdit ? 'Update Listing' : 'Create Listing'}
//               </Button>
//             )}
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }


export default function CreateVehicleModal() {
  return null;
  
  
}