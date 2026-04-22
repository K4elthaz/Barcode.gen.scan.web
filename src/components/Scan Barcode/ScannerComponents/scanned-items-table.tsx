"use client"

import { useMemo, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { InventoryItem } from "@/lib/types"

interface ScannedItem extends InventoryItem {
  timestamp: Date
}

interface ScannedItemsTableProps {
  items: ScannedItem[]
  onDelete: (id: string) => void
}

const PAGE_SIZE = 8

export function ScannedItemsTable({ items, onDelete }: ScannedItemsTableProps) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(date)
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return items
    }

    return items.filter((item) =>
      [
        item.productName,
        item.description,
        item.category,
        item.supplierInfo,
        item.sku,
        item.barcodeId,
        item.status,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [items, query])

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE)

  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const getStatusTone = (status: string) => {
    const value = status.toLowerCase()

    if (value.includes("active") || value.includes("available") || value.includes("in stock")) {
      return "border-primary/20 bg-primary/10 text-primary"
    }

    if (value.includes("low") || value.includes("warning")) {
      return "border-secondary/20 bg-secondary/10 text-secondary"
    }

    if (value.includes("out") || value.includes("inactive") || value.includes("unavailable")) {
      return "border-destructive/20 bg-destructive/10 text-destructive"
    }

    return "border-border/60 bg-muted text-muted-foreground"
  }

  if (items.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        No items scanned yet. Start scanning to add items to the table.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="w-full md:max-w-sm">
        <Input
          placeholder="Search scanned items"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/60">
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
              <TableHead>QR Code ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scanned At</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} className="py-10 text-center text-muted-foreground">
                  No items match current search.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id} className="align-top">
                  <TableCell>
                    {item.itemImg ? (
                      <img src={item.itemImg} alt={item.productName} className="h-12 w-12 rounded object-cover" />
                    ) : (
                      <span className="text-muted-foreground italic">No image</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell className="max-w-[220px] whitespace-normal break-words text-muted-foreground">
                    {item.description}
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.unitMeasure}</TableCell>
                  <TableCell>{item.purchasePrice}</TableCell>
                  <TableCell>{item.sellingPrice}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.supplierInfo}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.barcodeId}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusTone(item.status)}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(item.timestamp)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label="Delete item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm text-muted-foreground">
          Showing {paginatedItems.length} of {filteredItems.length} result(s). Page {page} of {totalPages || 1}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((currentPage) => currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
