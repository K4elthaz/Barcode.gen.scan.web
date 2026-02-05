import { useEffect, useState } from 'react'
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
  fetchAuditTrails,
  AuditTrailItem,
} from '@/services/auditTrail-services'
import { reverseGeocode } from '@/utils/geocode'

const PAGE_SIZE = 10

export default function AuditTrailListTable() {
  const [auditData, setAuditData] = useState<AuditTrailItem[]>([])
  const [page, setPage] = useState(1)

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

  const totalPages = Math.ceil(auditData.length / PAGE_SIZE)

  const paginatedData = auditData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  return (
    <div className="p-4 space-y-4">
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
