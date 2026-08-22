import { supabase } from "@/lib/supabase";
import type { Suppliers } from "@/types/suppliers";

const BUCKET = "item-images";

/** Emitted so supplier tables re-fetch after a create/update/delete. */
export function notifySuppliersUpdated() {
  window.dispatchEvent(new CustomEvent("suppliers-updated"));
}

export const addSupplier = async (
  name: string,
  shopName: string,
  category: string,
  description: string,
  phone: string,
  email: string,
  address: string,
  image: File,
) => {
  const uploadPath = `suppliers/${image.name}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(uploadPath, image, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(uploadPath);

  const { error: insertError } = await supabase.from("suppliers").insert({
    name,
    shop_name: shopName,
    category,
    description,
    phone,
    email,
    address,
    image: urlData.publicUrl,
  });
  if (insertError) throw insertError;

  notifySuppliersUpdated();
};

export const checkIfSupplierExists = async (name: string) => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("name")
    .eq("name", name)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
};

export const getSuppliers = async (): Promise<Suppliers[]> => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    shopName: row.shop_name ?? "",
    category: row.category ?? "",
    description: row.description ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    image: row.image ?? "",
    createdAt: row.created_at,
  }));
};