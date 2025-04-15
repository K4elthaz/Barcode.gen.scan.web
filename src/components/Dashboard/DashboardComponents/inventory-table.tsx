"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import type { InventoryItem } from "@/lib/types"
import { BarcodeDisplay } from "./barcode-display"

interface InventoryTableProps {
  items: InventoryItem[]
}

export function InventoryTable({ items }: InventoryTableProps) {
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">SKU</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-center">Location</TableHead>
            <TableHead className="text-center">Barcode</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="text-center">
              <TableCell className="font-medium text-center">{item.name}</TableCell>
              <TableCell className="text-center">{item.sku}</TableCell>
              <TableCell className="text-center">{item.category}</TableCell>
              <TableCell className="text-center">{item.quantity}</TableCell>
              <TableCell className="text-center">₱{item.price.toFixed(2)}</TableCell>
              <TableCell className="text-center">{item.location}</TableCell>
              <TableCell className="text-center">
                <BarcodeDisplay value={item.barcode} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
