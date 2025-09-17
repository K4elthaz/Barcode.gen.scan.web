// AuditTrailServices.ts
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";

// TypeScript type for audit trail item
export interface AuditTrailItem {
  id: string;
  uniqueID: string;
  productName: string;
  user: string;
  latitude: number;
  longitude: number;
  timeStamp: string;
  newQuantity: number;
  previousQuantity: number;
  status: string;
  locationName?: string; // Optional field for the converted address
}

// Fetch all audit trails from Firebase
export function fetchAuditTrails(callback: (data: AuditTrailItem[]) => void) {
  const auditTrailRef = ref(database, "AuditTrail");

  onValue(auditTrailRef, async (snapshot) => {
    const trails: AuditTrailItem[] = [];

    const data = snapshot.val();
    if (!data) return callback([]);

    for (const id in data) {
      const records = data[id];
      for (const uniqueID in records) {
        const entry = records[uniqueID];
        trails.push({
          id,
          uniqueID,
          ...entry,
        });
      }
    }

    callback(trails);
  });
}
