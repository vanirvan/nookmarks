"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

interface ImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
}

export function ImageDialog({ open, onOpenChange, src }: ImageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/90 backdrop-blur-md" />
        <DialogContent
          showCloseButton={false}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-none border-none bg-transparent p-0 ring-0 shadow-none flex items-center justify-center pointer-events-none"
        >
          <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-10 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-50 h-10 w-10"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            <Image
              src={src}
              alt="Full view"
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
