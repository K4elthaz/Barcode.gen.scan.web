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
import { Input } from '@/components/ui/input'
import { Trash2, Printer } from 'lucide-react'
import { ref, remove } from 'firebase/database'
import { database } from '@/lib/firebase'
import { formatCoordinates } from '@/utils/geocode'
import { useMemo, useState } from 'react'

interface InventoryTableProps {
  items: InventoryItem[]
}

const PAGE_SIZE = 10

export function InventoryTable({ items }: InventoryTableProps) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await remove(ref(database, `Items/${id}`))
    }
  }

  const handlePrint = (barcodeId: string, sku: string) => {
    const printWindow = window.open('', '_blank', 'width=900,height=600')
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            #container {
              text-align: center;
            }
            #qrcode {
              margin-bottom: 20px;
            }
            #sku {
              font-size: 18px;
              font-weight: bold;
              letter-spacing: 2px;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div id="container">
            <div id="qrcode"></div>
            <div id="sku">SKU: ${sku}</div>
          </div>
          <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>
          <script>
            window.onload = function() {
              new QRCode(document.getElementById("qrcode"), {
                text: "${barcodeId}",
                width: 220,
                height: 220,
                correctLevel: QRCode.CorrectLevel.M
              });
              setTimeout(function () {
                window.print();
              }, 250);
            }
          <\/script>
        </body>
      </html>
    `)
      printWindow.document.close()
    }
  }

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return items
    }

    return items.filter((item) =>
      [
        item.sku,
        item.productName,
        item.category,
        item.supplierInfo,
        item.user,
        item.status,
        item.barcodeId,
      ].some((value) => value.toLowerCase().includes(normalizedQuery))
    )
  }, [items, query])

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE)

  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  return (
    <div className="space-y-4">
      <div className="w-full md:max-w-sm">
        <Input
          placeholder="Search inventory item"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="overflow-hidden rounded-md border">
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
              <TableHead className="text-center">QR Code</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-10 text-center text-muted-foreground">
                  No inventory items match search.
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
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
                    {item.address ??
                      (item.location?.lat !== undefined &&
                      item.location?.lng !== undefined
                        ? formatCoordinates(item.location.lat, item.location.lng)
                        : 'No location')}
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
                        onClick={() => handlePrint(item.barcodeId, item.sku)}
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
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
