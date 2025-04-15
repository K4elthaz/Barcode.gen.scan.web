"use client"

import { useState } from "react"
import { BarcodeScanner } from "./ScannerComponents/barcode-scanner"
import { ScannedItemsTable } from "./ScannerComponents/scanned-items-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type ScannedItem = {
  id: string
  barcode: string
  timestamp: Date
}

export default function Home() {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([])
  const [isScanning, setIsScanning] = useState(false)

  const handleScan = (barcode: string) => {
    if (barcode) {
      const newItem: ScannedItem = {
        id: crypto.randomUUID(),
        barcode,
        timestamp: new Date(),
      }
      setScannedItems((prev) => [newItem, ...prev])
      setIsScanning(false)
    }
  }

  const handleDelete = (id: string) => {
    setScannedItems((prev) => prev.filter((item) => item.id !== id))
  }

  const clearAll = () => {
    setScannedItems([])
  }

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Barcode Scanner</CardTitle>
          <CardDescription>Scan barcodes to add them to the table below</CardDescription>
        </CardHeader>
        <CardContent>
          {isScanning ? (
            <div className="space-y-4">
              <BarcodeScanner onScan={handleScan} onError={(err) => console.error(err)} />
              <Button variant="outline" onClick={() => setIsScanning(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsScanning(true)}>Start Scanning</Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Scanned Items</CardTitle>
            <CardDescription>
              {scannedItems.length} item{scannedItems.length !== 1 ? "s" : ""} scanned
            </CardDescription>
          </div>
          {scannedItems.length > 0 && (
            <Button variant="outline" onClick={clearAll}>
              Clear All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ScannedItemsTable items={scannedItems} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </main>
  )
}
