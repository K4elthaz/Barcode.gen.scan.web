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
import { Activity, QrCode, ScanLine, ShieldCheck } from "lucide-react"

export default function Home() {
  const [scannedItems, setScannedItems] = useState<(InventoryItem & { timestamp: Date })[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

  const uniqueCategories = new Set(
    scannedItems.map((item) => item.category).filter(Boolean)
  ).size
  const lowStockCount = scannedItems.filter((item) => Number(item.quantity || 0) < 10).length

  const summaryCards = [
    {
      title: "Scanned items",
      value: scannedItems.length,
      description: "Total rows scanned this session.",
      icon: QrCode,
    },
    {
      title: "Categories",
      value: uniqueCategories,
      description: "Distinct groups in scanned results.",
      icon: Activity,
    },
    {
      title: "Low stock",
      value: lowStockCount,
      description: "Items under 10 units found in scan list.",
      icon: ShieldCheck,
    },
  ]

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
    <main className="space-y-6 py-2">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.5fr,0.9fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Realtime scanning
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Scan Barcode
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Scan QR codes, validate item records, and keep temporary scan queue ready for receiving and verification workflows.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/15 via-transparent to-primary/10 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Mode
            </p>
            <p className="mt-3 text-lg font-semibold">
              {isScanning ? "Camera active" : "Ready to scan"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Use device camera or fallback manual code entry when camera blocked.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <ScanLine className="h-5 w-5 text-primary" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Scan code then auto-load matching inventory item from database.
            </CardDescription>
          </div>
          {isScanning ? (
            <Button variant="outline" onClick={() => setIsScanning(false)}>
              Cancel scan
            </Button>
          ) : (
            <Button onClick={() => setIsScanning(true)}>Start scanning</Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {isScanning ? (
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
          ) : (
            <p className="text-sm text-muted-foreground">
              Scanner idle. Start scanning when item QR is ready.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-6">
          <div>
            <CardTitle>Scanned Items</CardTitle>
            <CardDescription>
              {scannedItems.length} item{scannedItems.length !== 1 ? "s" : ""} scanned
            </CardDescription>
          </div>
          {scannedItems.length > 0 && (
            <Button variant="outline" onClick={clearAll}>
              Clear all
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6">
          <ScannedItemsTable items={scannedItems} onDelete={handleDelete} />
        </CardContent>
      </Card>
    </main>
  )
}
