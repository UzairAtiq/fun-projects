"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { CharacterWithCategory } from "@/lib/database.types";

export async function getCharacters(): Promise<CharacterWithCategory[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("characters")
    .select(`
      *,
      category:categories(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as CharacterWithCategory[];
}

export async function createCharacter(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const imageUrl = formData.get("imageUrl") as string;

  // Use a fixed user ID since we removed authentication
  const userId = "00000000-0000-0000-0000-000000000000";

  const { error } = await supabase.from("characters").insert({
    name,
    category_id: categoryId || null,
    image_url: imageUrl,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function updateCharacter(
  id: string,
  formData: FormData
) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const imageUrl = formData.get("imageUrl") as string;

  const updateData: any = {
    name,
    category_id: categoryId || null,
  };

  // Only update image_url if a new one is provided
  if (imageUrl) {
    updateData.image_url = imageUrl;
  }

  const { error } = await supabase
    .from("characters")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function deleteCharacter(id: string) {
  const supabase = await createClient();

  // Get the character to find the image URL
  const { data: character } = await supabase
    .from("characters")
    .select("image_url")
    .eq("id", id)
    .single();

  // Delete from database
  const { error } = await supabase.from("characters").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  // Delete image from storage if it exists
  if (character?.image_url) {
    const fileName = character.image_url.split("/").pop();
    if (fileName) {
      await supabase.storage
        .from("character-images")
        .remove([fileName]);
    }
  }

  revalidatePath("/dashboard");
}
