"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { X, Crop, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import getCroppedImg from "@/utils/cropImage";

type ImageCropperProps = {
  imageSrc: string;
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
};

export default function ImageCropper({
  imageSrc,
  onCrop,
  onCancel,
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const onCropComplete = useCallback(
    (_: { x: number; y: number; width: number; height: number }, percentCroppedArea: { x: number; y: number; width: number; height: number }) => {
      setCroppedAreaPixels(percentCroppedArea);
    },
    []
  );

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    try {
      const { url, blob } = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const file = new File([blob], "cropped-image.webp", { type: "image/webp" });
      URL.revokeObjectURL(url);
      onCrop(file);
    } catch (err) {
      console.error("Crop failed:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80"
    >
      <div className="bg-white rounded-xl p-4 max-w-lg w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Crop className="w-5 h-5" />
            Crop Image
          </h3>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Viewport */}
        <div className="relative w-full h-80 bg-slate-900 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            rotation={rotation}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            classes={{ containerClassName: "cropper-container" }}
          />
        </div>

        <p className="text-xs text-center text-slate-500 mt-2">
          Drag to pan · Use buttons to zoom or rotate
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-slate-600 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleRotate}>
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Apply Crop
          </Button>
        </div>
      </div>
    </motion.div>
  );
}