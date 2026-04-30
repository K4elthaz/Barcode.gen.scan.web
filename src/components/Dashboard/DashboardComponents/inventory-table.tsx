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
import { Label } from '@/components/ui/label'
import {
  Boxes,
  MapPin,
  Package,
  Printer,
  Search,
  Tag,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { ref, remove } from 'firebase/database'
import { database } from '@/lib/firebase'
import { formatCoordinates } from '@/utils/geocode'
import { useMemo, useState } from 'react'

interface InventoryTableProps {
  items: InventoryItem[]
}

const PAGE_SIZE = 10

const formatCurrency = (value: string | number) => {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return 'PHP 0.00'
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const getStatusTone = (status?: string) => {
  const normalized = (status ?? '').toLowerCase()

  if (normalized.includes('available')) {
    return 'border-primary/20 bg-primary/10 text-primary'
  }

  if (normalized.includes('out')) {
    return 'border-destructive/20 bg-destructive/10 text-destructive'
  }

  if (normalized.includes('discontinued')) {
    return 'border-muted-foreground/20 bg-muted text-muted-foreground'
  }

  return 'border-border/60 bg-secondary/15 text-foreground'
}

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

    return items.filter((item) => {
      const searchableValues = [
        item.sku,
        item.productName,
        item.category,
        item.supplierInfo,
        item.user,
        item.status,
        item.barcodeId,
      ]

      return searchableValues.some((value) =>
        String(value ?? '').toLowerCase().includes(normalizedQuery)
      )
    })
  }, [items, query])

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE)

  const paginatedItems = filteredItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Search inventory
          </Label>
          <div className="relative w-full lg:w-[420px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search SKU, item, category, user, status"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setPage(1)
              }}
              className="h-10 pl-9 pr-10"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
                onClick={() => {
                  setQuery('')
                  setPage(1)
                }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {filteredItems.length}
          </span>{' '}
          matching item{filteredItems.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[120px] px-4 py-3">SKU</TableHead>
              <TableHead className="min-w-[220px] px-4 py-3">Item</TableHead>
              <TableHead className="min-w-[150px] px-4 py-3">
                Category
              </TableHead>
              <TableHead className="min-w-[120px] px-4 py-3 text-right">
                Quantity
              </TableHead>
              <TableHead className="min-w-[150px] px-4 py-3 text-right">
                Selling Price
              </TableHead>
              <TableHead className="min-w-[170px] px-4 py-3">
                Supplier
              </TableHead>
              <TableHead className="min-w-[140px] px-4 py-3">User</TableHead>
              <TableHead className="min-w-[150px] px-4 py-3">Status</TableHead>
              <TableHead className="min-w-[240px] px-4 py-3">
                Location
              </TableHead>
              <TableHead className="min-w-[130px] px-4 py-3 text-center">
                QR Code
              </TableHead>
              <TableHead className="min-w-[120px] px-4 py-3 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium">No inventory items found</p>
                      <p className="text-sm text-muted-foreground">
                        Try another search term or add a new item.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id} className="align-top">
                  <TableCell className="px-4 py-4">
                    <span className="inline-flex rounded-md border border-border/60 bg-background px-2.5 py-1 font-mono text-xs">
                      {item.sku || '-'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium leading-5">
                          {item.productName || '-'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.description || item.barcodeId}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span className="inline-flex max-w-[140px] items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1 text-sm">
                      <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{item.category || '-'}</span>
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-sm font-medium tabular-nums">
                      <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                      {Number(item.quantity || 0)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right font-medium tabular-nums">
                    {formatCurrency(item.sellingPrice)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    {item.supplierInfo || '-'}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span className="inline-flex max-w-[130px] items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1 text-sm">
                      <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{item.user || '-'}</span>
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <span
                      className={`inline-flex max-w-[140px] rounded-full border px-2.5 py-1 text-xs font-medium leading-5 ${getStatusTone(item.status)}`}
                    >
                      <span className="truncate">
                        {item.status || 'Unknown'}
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-muted-foreground">
                    <div className="flex gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="whitespace-normal break-words">
                        {item.address ??
                          (item.location?.lat !== undefined &&
                          item.location?.lng !== undefined
                            ? formatCoordinates(
                                item.location.lat,
                                item.location.lng
                              )
                            : 'No location')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div className="flex justify-center rounded-md bg-white p-2">
                      <BarcodeDisplay value={item.barcodeId} />
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Delete ${item.productName}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handlePrint(item.barcodeId, item.sku)}
                        aria-label={`Print QR code for ${item.productName}`}
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
          Showing {paginatedItems.length} of {filteredItems.length} result(s).
          Page {page} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
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
