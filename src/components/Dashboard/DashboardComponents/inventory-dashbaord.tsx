"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InventoryTable } from "./inventory-table"
import { AddItemDialog } from "./add-item-dialog"
import type { InventoryItem } from "@/lib/types"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const inventoryRef = ref(database, "Items")
    const unsubscribe = onValue(inventoryRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const formatted = Object.entries(data).map(([id, item]: [string, any]) => ({
          id,
          ...item
        })) as InventoryItem[]
        setItems(formatted)
      } else {
        setItems([])
      }
    })

    return () => unsubscribe()
  }, [])

  const addItem = (item: InventoryItem) => {
    setItems((prev) => [...prev, item])
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
