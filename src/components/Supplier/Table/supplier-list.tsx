import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSuppliers } from "@/services/suppliers-services";

export default function SupplierListTable() {
  const [supplierList, setSupplierList] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = getSuppliers(setSupplierList);
    return () => unsubscribe();
  }, []);
  return (
    <div>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Shop Name</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Description</TableHead>
            <TableHead className="text-center">Phone</TableHead>
            <TableHead className="text-center">Email</TableHead>
            <TableHead className="text-center">Address</TableHead>
            <TableHead className="text-center">Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supplierList.length === 0 ? (
            <div className="p-4">
              <p className="text-zinc-500">No suppliers found.</p>
            </div>
          ) : (
            supplierList.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.shopName}</TableCell>
                <TableCell>{supplier.category}</TableCell>
                <TableCell>{supplier.description}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>
                  <img
                    src={supplier.image}
                    alt={supplier.name}
                    className="w-20 h-20 object-cover mx-auto rounded"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
