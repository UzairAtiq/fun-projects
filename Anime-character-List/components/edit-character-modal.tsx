"use client";

import { useState, useTransition, useEffect } from "react";
import { Upload, ImagePlus, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateCharacter } from "@/app/actions/characters";
import { uploadImage } from "@/app/actions/storage";
import type { Category, CharacterWithCategory } from "@/lib/database.types";

interface EditCharacterModalProps {
  character: CharacterWithCategory | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCharacterModal({
  character,
  categories,
  open,
  onOpenChange,
}: EditCharacterModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (character) {
      setName(character.name || "");
      setCategoryId(character.category_id || "");
      setFile(null);
      setPreview("");
      setError("");
    }
  }, [character]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    setError("");

    if (!name) {
      setError("Name is required");
      return;
    }

    try {
      setUploading(true);

      let imageUrl = "";
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        imageUrl = await uploadImage(formData);
      }

      const characterData = new FormData();
      characterData.append("name", name);
      characterData.append("categoryId", categoryId);
      if (imageUrl) {
        characterData.append("imageUrl", imageUrl);
      }

      startTransition(async () => {
        await updateCharacter(character.id, characterData);
        onOpenChange(false);
        setUploading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update character");
      setUploading(false);
    }
  };

  if (!character) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-[#27272A] bg-[#141417] shadow-[0_0_50px_rgba(220,38,38,0.15)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#27272A] bg-gradient-to-r from-[#DC2626]/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#DC2626]/20 border border-[#DC2626]/30">
                    <Pencil className="h-5 w-5 text-[#DC2626]" />
                  </div>
                  <DialogTitle className="text-xl font-semibold text-[#FAFAFA]">Edit Warrior</DialogTitle>
                </div>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="edit-name" className="text-sm font-medium text-[#FAFAFA]">Warrior Name *</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter warrior name"
                    required
                    className="h-11 bg-[#0D0D0F] border-[#27272A] text-[#FAFAFA] placeholder:text-[#71717A] focus:border-[#DC2626]"
                  />
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Label htmlFor="edit-category" className="text-sm font-medium text-[#FAFAFA]">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-11 bg-[#0D0D0F] border-[#27272A] text-[#FAFAFA]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141417] border-[#27272A]">
                      <SelectItem value="" className="text-[#FAFAFA] focus:bg-[#27272A] focus:text-[#FAFAFA]">No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem 
                          key={category.id} 
                          value={category.id}
                          className="text-[#FAFAFA] focus:bg-[#27272A] focus:text-[#FAFAFA]"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="edit-image" className="text-sm font-medium text-[#FAFAFA]">New Image (optional)</Label>
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="edit-image"
                      className="relative flex items-center justify-center h-40 rounded-lg border-2 border-dashed border-[#27272A] hover:border-[#DC2626]/50 transition-colors cursor-pointer bg-[#0D0D0F] group overflow-hidden"
                    >
                      {preview || character.image_url ? (
                        <div className="relative w-full h-full">
                          <img
                            src={preview || character.image_url}
                            alt={character.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImagePlus className="h-8 w-8 text-[#DC2626]" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <ImagePlus className="h-10 w-10 mx-auto mb-2 text-[#71717A] group-hover:text-[#DC2626] transition-colors" />
                          <p className="text-sm font-medium text-[#71717A] group-hover:text-[#FAFAFA] transition-colors">
                            Click to upload new image
                          </p>
                        </div>
                      )}
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-sm text-[#DC2626] px-3 py-2 bg-[#DC2626]/10 rounded-lg border border-[#DC2626]/20"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="font-medium truncate">{file.name}</span>
                      </motion.div>
                    )}
                    {!file && (
                      <p className="text-xs text-[#71717A] px-1">
                        Leave empty to keep current image
                      </p>
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-[#DC2626] bg-[#DC2626]/10 px-3 py-2 rounded-lg border border-[#DC2626]/20"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <DialogFooter className="pt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isPending || uploading}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isPending || uploading}
                    className="flex-1 sm:flex-none"
                  >
                    {uploading || isPending ? (
                      <>
                        <motion.div
                          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Updating...
                      </>
                    ) : (
                      "Update Warrior"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
