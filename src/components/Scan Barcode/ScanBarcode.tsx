"use client"

import { useState } from "react"
import { BarcodeScanner } from "./ScannerComponents/barcode-scanner"
import { ScannedItemsTable } from "./ScannerComponents/scanned-items-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { getErrorMessage } from "@/lib/errors"
import { InventoryItem } from "@/lib/types"
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database"
import { database } from "@/lib/firebase"

export default function Home() {
  const [scannedItems, setScannedItems] = useState<(InventoryItem & { timestamp: Date })[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

  const handleScan = (scannedCode: string) => {
    if (!scannedCode) return
  
    const itemsRef = ref(database, "Items") // Make sure this path matches your DB structure
    const itemsQuery = query(itemsRef, orderByChild("barcodeId"), equalTo(scannedCode))
  
    onValue(itemsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        const itemKey = Object.keys(data)[0]
        const itemData = data[itemKey]
  
        const newItem: InventoryItem & { timestamp: Date } = {
          ...itemData,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        
  
        setScannedItems((prev) => [newItem, ...prev])
      } else {
        toast({
          title: "Item not found",
          description: `No inventory item matches code ${scannedCode}.`,
          variant: "destructive",
        })
      }
  
      setIsScanning(false)
    }, (error) => {
      toast({
        title: "Scan failed",
        description: getErrorMessage(
          error,
          "The scanned code could not be looked up. Please try again."
        ),
        variant: "destructive",
      })
      setIsScanning(false)
    }, {
      onlyOnce: true
    })
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
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Scan QR codes to add items to the table below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isScanning ? (
            <div className="space-y-4">
              <BarcodeScanner
                onScan={handleScan}
                onError={(error) => {
                  toast({
                    title: "Scanner unavailable",
                    description: getErrorMessage(
                      error,
                      "The camera could not start. Use manual entry or try again."
                    ),
                    variant: "destructive",
                  })
                }}
              />
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
