import { supabase } from "@/lib/supabase";
import type { InventoryItem } from "@/lib/types";

/** Emitted so inventory tables re-fetch after a create/update/delete. */
export function notifyItemsUpdated() {
  window.dispatchEvent(new CustomEvent("items-updated"));
}

type ItemInput = Omit<InventoryItem, "id" | "purchasePrice" | "sellingPrice"> & {
  purchasePrice: string | number
  sellingPrice: string | number
}

interface ItemRow {
  id: string
  product_name: string | null
  description: string | null
  category: string | null
  unit_measure: string | null
  purchase_price: number | null
  selling_price: number | null
  quantity: number | null
  supplier_info: string | null
  user: string | null
  item_img: string | null
  sku: string | null
  barcode_id: string | null
  barcode_img: string | null
  status: string | null
  lat: number | null
  lng: number | null
  address: string | null
}

/** Map a snake_case Supabase items row to the app's camelCase InventoryItem. */
function mapRowToItem(row: ItemRow): InventoryItem {
  const lat = Number(row.lat);
  const lng = Number(row.lng);

  return {
    id: row.id,
    productName: row.product_name ?? "",
    description: row.description ?? "",
    category: row.category ?? "",
    unitMeasure: row.unit_measure ?? "",
    purchasePrice: String(row.purchase_price ?? ""),
    sellingPrice: String(row.selling_price ?? ""),
    quantity: Number(row.quantity ?? 0),
    supplierInfo: row.supplier_info ?? "",
    user: row.user ?? "",
    itemImg: row.item_img ?? "",
    sku: row.sku ?? "",
    barcodeId: row.barcode_id ?? "",
    barcodeImg: row.barcode_img ?? "",
    status: row.status ?? "",
    location:
      Number.isFinite(lat) && Number.isFinite(lng)
        ? { lat, lng }
        : { lat: 0, lng: 0 },
    address: row.address ?? "",
  };
}

export const getItems = async (): Promise<InventoryItem[]> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRowToItem);
};

export const createItem = async (item: ItemInput) => {
  const { error } = await supabase.from("items").insert({
    product_name: item.productName,
    description: item.description,
    category: item.category,
    unit_measure: item.unitMeasure,
    purchase_price: item.purchasePrice,
    selling_price: item.sellingPrice,
    quantity: item.quantity,
    supplier_info: item.supplierInfo,
    item_img: item.itemImg,
    sku: item.sku,
    barcode_id: item.barcodeId,
    barcode_img: item.barcodeImg,
    status: item.status,
    user: item.user,
    lat: item.location?.lat,
    lng: item.location?.lng,
    address: item.address,
  });
  if (error) throw error;

  notifyItemsUpdated();
};

export const deleteItem = async (id: string) => {
  const { error } = await supabase.from("items").delete().eq("id", id);
  if (error) throw error;

  notifyItemsUpdated();
};

export const findItemByBarcode = async (
  barcodeId: string,
): Promise<InventoryItem | null> => {
  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("barcode_id", barcodeId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapRowToItem(data) : null;
};