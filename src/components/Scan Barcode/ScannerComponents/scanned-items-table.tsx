"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InventoryItem } from "@/lib/types"

interface ScannedItem extends InventoryItem {
  timestamp: Date
}

interface ScannedItemsTableProps {
  items: ScannedItem[]
  onDelete: (id: string) => void
}

export function ScannedItemsTable({ items, onDelete }: ScannedItemsTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(date)
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No items scanned yet. Start scanning to add items to the table.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Product Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Barcode ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scanned At</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                {item.itemImg ? (
                  <img src={item.itemImg} alt={item.productName} className="h-12 w-12 object-cover rounded" />
                ) : (
                  <span className="text-muted-foreground italic">No image</span>
                )}
              </TableCell>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.unitMeasure}</TableCell>
              <TableCell>{item.purchasePrice}</TableCell>
              <TableCell>{item.sellingPrice}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.supplierInfo}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.barcodeId}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{formatDate(item.timestamp)}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete item">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
