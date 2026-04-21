import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  fetchAuditTrails,
  AuditTrailItem,
} from '@/services/auditTrail-services'
import { reverseGeocode } from '@/utils/geocode'

const PAGE_SIZE = 10

const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz'

function parseFirebasePushKeyTime(key?: string) {
  if (!key || key.length < 8) {
    return 0
  }

  let timestamp = 0

  for (let i = 0; i < 8; i += 1) {
    const index = PUSH_CHARS.indexOf(key[i])

    if (index < 0) {
      return 0
    }

    timestamp = timestamp * 64 + index
  }

  return timestamp
}

function parseTimestampValue(rawValue?: string) {
  if (!rawValue) {
    return 0
  }

  const value = rawValue.trim()

  if (!value) {
    return 0
  }

  const numericTime = Number(value)
  if (!Number.isNaN(numericTime)) {
    return value.length <= 10 ? numericTime * 1000 : numericTime
  }

  const normalized = value
    .replace(/\s+at\s+/i, ' ')
    .replace(/\u202f/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const parsedTime = Date.parse(normalized)

  if (!Number.isNaN(parsedTime)) {
    return parsedTime
  }

  return 0
}

function getTimestampValue(item: AuditTrailItem) {
  const candidates = [
    item.timeStamp,
    (item as AuditTrailItem & { timestamp?: string }).timestamp,
    (item as AuditTrailItem & { createdAt?: string }).createdAt,
    (item as AuditTrailItem & { dateAdded?: string }).dateAdded,
  ]

  for (const candidate of candidates) {
    const parsed = parseTimestampValue(candidate)
    if (parsed > 0) {
      return parsed
    }
  }

  const uniqueIdTime = parseFirebasePushKeyTime(item.uniqueID)
  if (uniqueIdTime > 0) {
    return uniqueIdTime
  }

  return parseFirebasePushKeyTime(item.id)
}

export default function AuditTrailListTable() {
  const [auditData, setAuditData] = useState<AuditTrailItem[]>([])
  const [page, setPage] = useState(1)
  const [dateSortOrder, setDateSortOrder] = useState<'desc' | 'asc'>('desc')

  useEffect(() => {
    fetchAuditTrails(async (trails) => {
      const withLocations = await Promise.all(
        trails.map(async (trail) => {
          const locationName = await reverseGeocode(
            trail.latitude,
            trail.longitude
          )
          return { ...trail, locationName }
        })
      )
      setAuditData(withLocations)
    })
  }, [])

  const sortedData = useMemo(() => {
    return [...auditData].sort((left, right) => {
      const leftTime = getTimestampValue(left)
      const rightTime = getTimestampValue(right)

      if (leftTime === rightTime) {
        return right.uniqueID.localeCompare(left.uniqueID)
      }

      if (dateSortOrder === 'asc') {
        return leftTime - rightTime
      }

      return rightTime - leftTime
    })
  }, [auditData, dateSortOrder])

  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE)

  const paginatedData = sortedData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-muted-foreground">Date Added</span>
        <Select
          value={dateSortOrder}
          onValueChange={(value: 'desc' | 'asc') => {
            setDateSortOrder(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Latest first</SelectItem>
            <SelectItem value="asc">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table className="border text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Item</TableHead>
            <TableHead className="text-center">User</TableHead>
            <TableHead className="text-center">Default Location</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Current Address</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <TableRow key={item.uniqueID}>
                <TableCell className="text-center">
                  {item.productName ?? '-'}
                </TableCell>

                <TableCell className="text-center">
                  {item.user ?? '-'}
                </TableCell>

                <TableCell className="max-w-[220px] whitespace-normal break-words">
                  {item.defaultAddress ?? '-'}
                </TableCell>

                <TableCell className="max-w-[220px] whitespace-normal break-words">
                  {item.locationStatus ?? 'Unknown location'}
                </TableCell>

                <TableCell className="max-w-[220px] whitespace-normal break-words">
                  {item.address ?? '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                No audit trails found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>

        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
