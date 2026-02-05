'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InventoryItem } from '@/lib/types'
import { BarcodeDisplay } from './barcode-display'
import { Button } from '@/components/ui/button'
import { Trash2, Printer } from 'lucide-react'
import { ref, remove } from 'firebase/database'
import { database } from '@/lib/firebase'
import { reverseGeocode } from '@/utils/geocode'
import { useEffect, useState } from 'react'

interface InventoryTableProps {
  items: InventoryItem[]
}

export function InventoryTable({ items }: InventoryTableProps) {
  const [addresses, setAddresses] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchAddresses = async () => {
      const results: Record<string, string> = {}

      for (const item of items) {
        console.log('[InventoryTable] Item location:', {
          id: item.id,
          location: item.location,
        })

        if (item.location?.lat && item.location?.lng) {
          try {
            console.log(
              `[InventoryTable] Reverse geocoding ${item.id}:`,
              item.location.lat,
              item.location.lng
            )

            const address = await reverseGeocode(
              item.location.lat,
              item.location.lng
            )

            console.log(
              `[InventoryTable] Resolved address for ${item.id}:`,
              address
            )

            results[item.id] = address
          } catch (error) {
            console.error(
              `[InventoryTable] Failed to reverse geocode ${item.id}:`,
              error
            )
            results[item.id] = 'Unknown location'
          }
        } else {
          console.warn(`[InventoryTable] No valid location for item ${item.id}`)
        }
      }

      setAddresses(results)
    }

    if (items.length > 0) {
      fetchAddresses()
    }
  }, [items])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await remove(ref(database, `Items/${id}`))
    }
  }

  const handlePrint = (barcodeId: string) => {
    const printWindow = window.open('', '_blank', 'width=900,height=600')
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode</title>
        </head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;">
          <svg id="barcode"></svg>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              JsBarcode("#barcode", "${barcodeId}", {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: true
              });
              window.print();
            }
          </script>
        </body>
      </html>
    `)
      printWindow.document.close()
    }
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">SKU</TableHead>
            <TableHead className="text-center">Name</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Selling Price</TableHead>
            <TableHead className="text-center">Supplier</TableHead>
            <TableHead className="text-center">User</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Location</TableHead>
            <TableHead className="text-center">Barcode</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="text-center">
              <TableCell>{item.sku}</TableCell>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>₱{parseFloat(item.sellingPrice).toFixed(2)}</TableCell>
              <TableCell>{item.supplierInfo}</TableCell>
              <TableCell>{item.user}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>
                {(() => {
                  const value =
                    addresses[item.id] ??
                    (item.location?.lat !== undefined &&
                    item.location?.lng !== undefined
                      ? `${item.location.lat.toFixed(
                          5
                        )}, ${item.location.lng.toFixed(5)}`
                      : 'No location')

                  console.log('[InventoryTable] Rendered location:', {
                    id: item.id,
                    value,
                  })

                  return value
                })()}
              </TableCell>

              <TableCell>
                <BarcodeDisplay value={item.barcodeId} />
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePrint(item.barcodeId)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
