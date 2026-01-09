"use client";

import { useState, useTransition } from "react";
import { Plus, Upload, ImagePlus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createCharacter } from "@/app/actions/characters";
import { uploadImage } from "@/app/actions/storage";
import type { Category } from "@/lib/database.types";

interface AddCharacterModalProps {
  categories: Category[];
}

export function AddCharacterModal({ categories }: AddCharacterModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string>("");

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
    setError("");

    if (!name || !file) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("file", file);
      const imageUrl = await uploadImage(formData);

      const characterData = new FormData();
      characterData.append("name", name);
      characterData.append("categoryId", categoryId);
      characterData.append("imageUrl", imageUrl);

      startTransition(async () => {
        await createCharacter(characterData);
        setOpen(false);
        setName("");
        setCategoryId("");
        setFile(null);
        setPreview("");
        setUploading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create character");
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Character</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 bg-gradient-to-br from-white via-white to-primary/5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/40 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5"
                    whileHover={{ rotate: 5 }}
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                  <DialogTitle className="text-xl font-semibold">Add New Character</DialogTitle>
                </div>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="name" className="text-sm font-medium">Character Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Naruto Uzumaki"
                    required
                    className="h-11"
                  />
                </motion.div>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
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
                  <Label htmlFor="image" className="text-sm font-medium">Character Image *</Label>
                  <div className="flex flex-col gap-3">
                    <label
                      htmlFor="image"
                      className="relative flex items-center justify-center h-40 rounded-xl border-2 border-dashed border-border/60 hover:border-primary/40 transition-colors cursor-pointer bg-gradient-to-br from-muted/30 to-muted/10 group"
                    >
                      {preview ? (
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ImagePlus className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <ImagePlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                            Click to upload image
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 5MB • JPG, PNG, WebP, GIF
                          </p>
                        </div>
                      )}
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="sr-only"
                      />
                    </label>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 text-sm text-primary px-3 py-2 bg-primary/5 rounded-lg border border-primary/20"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="font-medium truncate">{file.name}</span>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/20"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <DialogFooter className="pt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={isPending || uploading}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1 sm:flex-none">
                    <Button 
                      type="submit" 
                      disabled={isPending || uploading}
                      className="w-full shadow-md shadow-primary/20 bg-gradient-to-r from-primary to-primary/90"
                    >
                      {uploading || isPending ? (
                        <>
                          <motion.div
                            className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Adding...
                        </>
                      ) : (
                        "Add Character"
                      )}
                    </Button>
                  </motion.div>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
