// AuditTrailListTable.tsx
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchAuditTrails, AuditTrailItem } from "@/services/auditTrail-services";
import { reverseGeocode } from "@/utils/geocode";
// import { format } from "date-fns";

export default function AuditTrailListTable() {
  const [auditData, setAuditData] = useState<AuditTrailItem[]>([]);

  useEffect(() => {
    fetchAuditTrails(async (trails) => {
      const withLocations = await Promise.all(
        trails.map(async (trail) => {
          const locationName = await reverseGeocode(trail.latitude, trail.longitude);
          return { ...trail, locationName };
        })
      );
      setAuditData(withLocations);
    });
  }, []);

  return (
    <div className="p-4">
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow >
            <TableHead className="text-center">Item</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Previous Qty</TableHead>
            <TableHead className="text-center">New Qty</TableHead>
            {/* <TableHead className="text-center">Timestamp</TableHead> */}
            <TableHead className="text-center">Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditData.map((item) => (
            <TableRow key={item.uniqueID}>
              <TableCell>{item.itemName}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.previousQuantity}</TableCell>
              <TableCell>{item.newQuantity}</TableCell>
{/* <TableCell>
  {item.timeStamp && !isNaN(Date.parse(item.timeStamp.toString() + "Z"))
    ? format(new Date(item.timeStamp.toString() + "Z"), "PPpp")
    : "Invalid date"}
</TableCell> */}


              <TableCell>{item.locationName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
