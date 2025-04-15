"use client"

import { Trash2 } from "lucide-react"
import type { ScannedItem } from "../ScanBarcode"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

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
            <TableHead>Barcode</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.barcode}</TableCell>
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
