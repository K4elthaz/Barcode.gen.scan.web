"use client"

import type React from "react"

import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarcodeDisplay } from "./barcode-display"
import type { InventoryItem } from "@/lib/types"

interface AddItemDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onAddItem: (item: InventoryItem) => void
}

export function AddItemDialog({ open, setOpen, onAddItem }: AddItemDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    price: 0,
    supplier: "",
    location: "",
    minStockLevel: 0,
  })

  // Generate a barcode based on UUID
  const [barcode, setBarcode] = useState("")

  const generateBarcode = () => {
    // Generate a UUID and use part of it for the barcode
    // Real barcodes would follow specific formats, but this is a simplified example
    const uuid = uuidv4()
    const numericPart = uuid.replace(/[^0-9]/g, "").substring(0, 13)
    setBarcode(numericPart)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "quantity" || name === "price" || name === "minStockLevel" ? Number.parseFloat(value) || 0 : value,
    })
  }

  const handleCategoryChange = (value: string) => {
    setFormData({
      ...formData,
      category: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!barcode) {
      generateBarcode()
      return
    }

    const newItem: InventoryItem = {
      id: uuidv4(),
      barcode,
      ...formData,
    }

    onAddItem(newItem)

    // Reset form
    setFormData({
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      price: 0,
      supplier: "",
      location: "",
      minStockLevel: 0,
    })
    setBarcode("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the details for the new inventory item. Click generate to create a unique barcode.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Stationery">Stationery</SelectItem>
                    <SelectItem value="Clothing">Clothing</SelectItem>
                    <SelectItem value="Food">Food & Beverage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Unit Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minStockLevel">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  name="minStockLevel"
                  type="number"
                  min="0"
                  value={formData.minStockLevel || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Barcode</Label>
                <Button type="button" variant="outline" size="sm" onClick={generateBarcode}>
                  Generate Barcode
                </Button>
              </div>

              {barcode ? (
                <div className="p-4 border rounded-md flex justify-center">
                  <BarcodeDisplay value={barcode} />
                </div>
              ) : (
                <div className="p-4 border rounded-md flex justify-center items-center h-20 text-muted-foreground">
                  Click generate to create a barcode
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
