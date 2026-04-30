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
import { formatCoordinates } from '@/utils/geocode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  MapPin,
  MapPinned,
  Minus,
  Package,
  Search,
  ShieldCheck,
  TimerReset,
  UserRound,
  X,
} from 'lucide-react'

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
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchAuditTrails(async (trails) => {
      setAuditData(trails)
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

  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return sortedData
    }

    return sortedData.filter((item) => {
      return [
        item.productName,
        item.user,
        item.status,
        item.locationStatus,
        item.defaultAddress,
        item.address,
        item.locationName,
      ]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(normalizedQuery))
    })
  }, [query, sortedData])

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE)

  const paginatedData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  )

  const totalEvents = auditData.length
  const flaggedEvents = auditData.filter(
    (item) => (item.locationStatus ?? '').toLowerCase() !== 'at correct location'
  ).length
  const locationResolved = auditData.filter(
    (item) => Boolean(item.address || item.locationName)
  ).length
  const quantityChanged = auditData.filter(
    (item) => Number(item.newQuantity) !== Number(item.previousQuantity)
  ).length

  const summaryCards = [
    {
      title: 'Events logged',
      value: totalEvents,
      description: 'Captured audit records across item activity.',
      icon: Activity,
    },
    {
      title: 'Quantity updates',
      value: quantityChanged,
      description: 'Rows where stock count changed between snapshots.',
      icon: TimerReset,
    },
    {
      title: 'Location alerts',
      value: flaggedEvents,
      description: 'Rows not marked at correct location.',
      icon: ShieldCheck,
    },
    {
      title: 'Resolved places',
      value: locationResolved,
      description: 'Rows with readable current address data.',
      icon: MapPinned,
    },
  ]

  const getStatusTone = (value?: string) => {
    const normalized = (value ?? '').toLowerCase()

    if (!normalized) {
      return 'bg-muted text-muted-foreground border-border/60'
    }

    if (normalized.includes('correct') || normalized.includes('match')) {
      return 'border-primary/20 bg-primary/10 text-primary'
    }

    if (normalized.includes('wrong') || normalized.includes('mismatch')) {
      return 'border-destructive/20 bg-destructive/10 text-destructive'
    }

    return 'bg-secondary/15 text-foreground border-border/60'
  }

  const formatDate = (item: AuditTrailItem) => {
    const timestamp = getTimestampValue(item)

    if (!timestamp) {
      return item.timeStamp ?? '-'
    }

    return new Intl.DateTimeFormat('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp))
  }

  const getQuantityDeltaTone = (delta: number) => {
    if (delta > 0) {
      return 'border-primary/20 bg-primary/10 text-primary'
    }

    if (delta < 0) {
      return 'border-destructive/20 bg-destructive/10 text-destructive'
    }

    return 'border-border/60 bg-muted text-muted-foreground'
  }

  const getQuantityDeltaIcon = (delta: number) => {
    if (delta > 0) {
      return <ArrowUp className="h-3.5 w-3.5" />
    }

    if (delta < 0) {
      return <ArrowDown className="h-3.5 w-3.5" />
    }

    return <Minus className="h-3.5 w-3.5" />
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
        <CardHeader className="space-y-4 border-b border-border/60 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Activity Records</CardTitle>
            <CardDescription>
              Search user activity, sort by timestamp, and inspect location verification per event.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Search records
              </Label>
              <div className="relative w-full lg:w-[420px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPage(1)
                }}
                placeholder="Search item, user, status, or address"
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

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Date added
              </Label>
              <Select
                value={dateSortOrder}
                onValueChange={(value: 'desc' | 'asc') => {
                  setDateSortOrder(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="h-10 w-full lg:w-[210px]">
                  <SelectValue placeholder="Sort by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Latest first</SelectItem>
                  <SelectItem value="asc">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <Table className="text-sm">
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[220px] px-4 py-3">Item</TableHead>
                  <TableHead className="min-w-[150px] px-4 py-3">User</TableHead>
                  <TableHead className="min-w-[180px] px-4 py-3">Logged</TableHead>
                  <TableHead className="min-w-[170px] px-4 py-3">Quantity</TableHead>
                  <TableHead className="min-w-[240px] px-4 py-3">Default Location</TableHead>
                  <TableHead className="min-w-[180px] px-4 py-3">Location Status</TableHead>
                  <TableHead className="min-w-[260px] px-4 py-3">Current Address</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => {
                    const quantityDelta = Number(item.newQuantity) - Number(item.previousQuantity)

                    return (
                      <TableRow key={item.uniqueID} className="align-top">
                        <TableCell className="px-4 py-4">
                          <div className="flex gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="font-medium leading-5">
                                {item.productName ?? '-'}
                              </p>
                              <p className="truncate font-mono text-xs text-muted-foreground">
                                {item.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <span className="inline-flex max-w-[140px] items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1 text-sm">
                            <UserRound className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="truncate">{item.user ?? '-'}</span>
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <div className="flex gap-2">
                            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="space-y-1">
                              <p className="font-medium leading-5">{formatDate(item)}</p>
                              <p className="text-xs text-muted-foreground">
                              {item.timeStamp ?? 'No raw timestamp'}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <div className="space-y-1">
                            <p className="font-medium">
                              {item.previousQuantity} to {item.newQuantity}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${getQuantityDeltaTone(quantityDelta)}`}
                            >
                              {getQuantityDeltaIcon(quantityDelta)}
                              {quantityDelta === 0
                                ? 'No change'
                                : quantityDelta > 0
                                  ? `+${quantityDelta} units`
                                  : `${quantityDelta} units`}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="whitespace-normal break-words px-4 py-4 text-muted-foreground">
                          {item.defaultAddress ?? '-'}
                        </TableCell>

                        <TableCell className="px-4 py-4">
                          <span
                            className={`inline-flex max-w-[170px] rounded-full border px-2.5 py-1 text-xs font-medium leading-5 ${getStatusTone(item.locationStatus ?? item.status)}`}
                          >
                            <span className="truncate">
                              {item.locationStatus ?? item.status ?? 'Unknown location'}
                            </span>
                          </span>
                        </TableCell>

                        <TableCell className="px-4 py-4 text-muted-foreground">
                          <div className="flex gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="whitespace-normal break-words">
                              {item.address ??
                                item.locationName ??
                                formatCoordinates(item.latitude, item.longitude)}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Search className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">No audit trails found</p>
                          <p className="text-sm text-muted-foreground">
                          Try broader search or wait for new inventory activity.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} result(s). Page {page} of {totalPages || 1}
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
        </CardContent>
      </Card>
    </div>
  )
}
