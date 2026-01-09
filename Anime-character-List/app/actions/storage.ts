"use server";

import { createClient } from "@/lib/supabase/server";

export async function uploadImage(formData: FormData): Promise<string> {
  const supabase = await createClient();

  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file provided");
  }

  // Validate file type
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 5MB.");
  }

  // Create unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from("character-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("character-images").getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteImage(imageUrl: string) {
  const supabase = await createClient();

  const fileName = imageUrl.split("/").pop();

  if (!fileName) {
    throw new Error("Invalid image URL");
  }

  const { error } = await supabase.storage
    .from("character-images")
    .remove([fileName]);

  if (error) {
    throw new Error(error.message);
  }
}
