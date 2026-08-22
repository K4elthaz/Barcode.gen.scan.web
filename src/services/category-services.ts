import { supabase } from "@/lib/supabase";
import type { Category } from "@/types/category";

const BUCKET = "item-images";

/** Emitted so category tables re-fetch after a create/update/delete. */
export function notifyCategoriesUpdated() {
  window.dispatchEvent(new CustomEvent("categories-updated"));
}

export const createCategory = async (
  categoryName: string,
  categoryDescription: string,
  categoryImage: File,
) => {
  const uploadPath = `categories/${categoryImage.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(uploadPath, categoryImage, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(uploadPath);

  const { error: insertError } = await supabase.from("categories").insert({
    name: categoryName,
    description: categoryDescription,
    image: urlData.publicUrl,
  });
  if (insertError) throw insertError;

  notifyCategoriesUpdated();
};

export const checkIfCategoryExists = async (categoryName: string) => {
  const { data, error } = await supabase
    .from("categories")
    .select("name")
    .eq("name", categoryName)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    image: row.image ?? "",
    createdAt: row.created_at,
  }));
};