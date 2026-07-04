import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Button } from "./Button";

interface ImageCropperModalProps {
  imageUrl: string;
  aspect: number;
  onCrop: (blob: Blob) => void;
  onClose: () => void;
}

export function ImageCropperModal({ imageUrl, aspect, onCrop, onClose }: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const getCroppedBlob = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageUrl;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, "image/jpeg", 0.9);
  }, [imageUrl, croppedAreaPixels, onCrop]);

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl w-full max-w-lg overflow-hidden shadow-modal animate-fade-in">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="font-headline-md text-headline-md text-text">Adjust image</h2>
            <button onClick={onClose} className="text-text-secondary hover:text-text transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="relative w-full h-[400px] bg-black">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>

          <div className="flex items-center gap-3 px-5 py-4 border-t border-border">
            <span className="material-symbols-outlined text-text-secondary text-[20px]">zoom_out</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-accent"
            />
            <span className="material-symbols-outlined text-text-secondary text-[20px]">zoom_in</span>
          </div>

          <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={getCroppedBlob}>Apply</Button>
          </div>
        </div>
      </div>
    </>
  );
}
