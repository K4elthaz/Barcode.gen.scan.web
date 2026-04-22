"use client"

import { useEffect, useState } from "react"
import { Boxes, PackageSearch, Plus, Tags, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryTable } from "./inventory-table"
import { AddItemDialog } from "./add-item-dialog"
import type { InventoryItem } from "@/lib/types"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [open, setOpen] = useState(false)

  const totalUnits = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
  const trackedCategories = new Set(
    items.map((item) => item.category).filter(Boolean)
  ).size
  const lowStockCount = items.filter(
    (item) => Number(item.quantity || 0) > 0 && Number(item.quantity || 0) < 10
  ).length
  const mappedLocations = items.filter(
    (item) => item.location?.lat !== undefined && item.location?.lng !== undefined
  ).length

  const summaryCards = [
    {
      title: "Items tracked",
      value: items.length,
      description: "Total active product records in inventory.",
      icon: Boxes,
    },
    {
      title: "Units on hand",
      value: totalUnits,
      description: "Combined quantity across all listed products.",
      icon: PackageSearch,
    },
    {
      title: "Categories",
      value: trackedCategories,
      description: "Distinct stock groups currently represented.",
      icon: Tags,
    },
    {
      title: "Low stock",
      value: lowStockCount,
      description: `${mappedLocations} item locations mapped for lookup.`,
      icon: TriangleAlert,
    },
  ]

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
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title} className="border-border/60 bg-card/90 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-3xl font-bold tracking-tight">
                  {value}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Inventory Items</CardTitle>
            <CardDescription>
              Review stock details, locations, barcode IDs, and quick actions.
            </CardDescription>
          </div>
          <Button onClick={() => setOpen(true)} className="sm:self-start">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <InventoryTable items={items} />
          <AddItemDialog open={open} setOpen={setOpen} onAddItem={addItem} />
        </CardContent>
      </Card>
    </div>
  )
}
