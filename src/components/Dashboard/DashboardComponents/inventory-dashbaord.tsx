"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InventoryTable } from "./inventory-table"
import { AddItemDialog } from "./add-item-dialog"
import type { InventoryItem } from "@/lib/types"

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Wireless Headphones",
      sku: "WH-001",
      category: "Electronics",
      quantity: 25,
      price: 79.99,
      supplier: "Audio Tech Inc.",
      location: "Warehouse A, Shelf 3",
      minStockLevel: 5,
      barcode: "9876543210123",
    },
    {
      id: "2",
      name: "Office Chair",
      sku: "OC-102",
      category: "Furniture",
      quantity: 12,
      price: 149.99,
      supplier: "Comfort Seating Co.",
      location: "Warehouse B, Section 2",
      minStockLevel: 3,
      barcode: "1234567890123",
    },
    {
      id: "3",
      name: "Notebook Set",
      sku: "NS-205",
      category: "Stationery",
      quantity: 150,
      price: 12.99,
      supplier: "Paper Products Ltd.",
      location: "Warehouse A, Shelf 7",
      minStockLevel: 30,
      barcode: "5678901234567",
    },
  ])

  const [open, setOpen] = useState(false)

  const addItem = (item: InventoryItem) => {
    setItems([...items, item])
    setOpen(false)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Inventory Items</h2>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
        <InventoryTable items={items} />
        <AddItemDialog open={open} setOpen={setOpen} onAddItem={addItem} />
      </CardContent>
    </Card>
  )
}
