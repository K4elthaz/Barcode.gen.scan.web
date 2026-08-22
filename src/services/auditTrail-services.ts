// AuditTrailServices.ts
import { supabase } from "@/lib/supabase";

// TypeScript type for audit trail item
export interface AuditTrailItem {
  id: string
  uniqueID: string
  productName: string
  user: string
  latitude: number
  longitude: number
  timeStamp: string
  newQuantity: number
  previousQuantity: number
  status: string
  locationName?: string // Optional field for the converted address
  defaultAddress?: string
  locationStatus?: string
  address?: string
}

// Fetch all audit trails from Supabase
export async function fetchAuditTrails(): Promise<AuditTrailItem[]> {
  const { data, error } = await supabase
    .from("audit_trails")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    uniqueID: row.unique_id ?? row.id,
    productName: row.product_name ?? "",
    user: row.user ?? "",
    latitude: Number(row.latitude) || 0,
    longitude: Number(row.longitude) || 0,
    timeStamp: row.time_stamp ?? "",
    newQuantity: Number(row.new_quantity) || 0,
    previousQuantity: Number(row.previous_quantity) || 0,
    status: row.status ?? "",
    locationName: row.location_name ?? undefined,
    defaultAddress: row.default_address ?? undefined,
    locationStatus: row.location_status ?? undefined,
    address: row.address ?? undefined,
  }));
}