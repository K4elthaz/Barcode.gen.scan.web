import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  CircleUser,
  PackageSearch,
  SquareStack,
  Tags,
  TriangleAlert,
  Banknote,
  Activity,
  Layers,
  PackageX,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getItems } from "@/services/items-services";
import { getCategories } from "@/services/category-services";
import { getSuppliers } from "@/services/suppliers-services";
import { fetchAuditTrails, type AuditTrailItem } from "@/services/auditTrail-services";
import { formatCurrency } from "@/utils/currency";
import type { InventoryItem } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 10;

function getStatusBucket(status?: string) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("available")) return "available" as const;
  if (normalized.includes("out")) return "out" as const;
  if (normalized.includes("discontinued")) return "discontinued" as const;
  return "other" as const;
}

function formatTimestamp(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OverviewDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryCount, setCategoryCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);
  const [audits, setAudits] = useState<AuditTrailItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAll = () => {
      setLoading(true);
      Promise.all([getItems(), getCategories(), getSuppliers(), fetchAuditTrails()])
        .then(([itemData, categoryData, supplierData, auditData]) => {
          if (!active) return;
          setItems(itemData);
          setCategoryCount(categoryData.length);
          setSupplierCount(supplierData.length);
          setAudits(auditData);
        })
        .catch(() => {
          if (!active) return;
          setItems([]);
          setCategoryCount(0);
          setSupplierCount(0);
          setAudits([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    const onItemsUpdated = () => loadAll();
    const onCategoriesUpdated = () => loadAll();
    const onSuppliersUpdated = () => loadAll();

    window.addEventListener("items-updated", onItemsUpdated);
    window.addEventListener("categories-updated", onCategoriesUpdated);
    window.addEventListener("suppliers-updated", onSuppliersUpdated);
    loadAll();

    return () => {
      active = false;
      window.removeEventListener("items-updated", onItemsUpdated);
      window.removeEventListener("categories-updated", onCategoriesUpdated);
      window.removeEventListener("suppliers-updated", onSuppliersUpdated);
    };
  }, []);

  const totals = useMemo(() => {
    const totalUnits = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
    const totalValue = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.sellingPrice || 0),
      0
    );
    const totalCost = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.purchasePrice || 0),
      0
    );
    return { totalUnits, totalValue, totalCost };
  }, [items]);

  const statusBreakdown = useMemo(() => {
    const buckets = { available: 0, out: 0, discontinued: 0, other: 0 };
    items.forEach((item) => {
      buckets[getStatusBucket(item.status)] += 1;
    });
    return buckets;
  }, [items]);

  const lowStockCount = useMemo(
    () =>
      items.filter(
        (item) =>
          Number(item.quantity || 0) > 0 &&
          Number(item.quantity || 0) < LOW_STOCK_THRESHOLD
      ).length,
    [items]
  );

  const categoryBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((item) => {
      const key = item.category || "Uncategorized";
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6);
  }, [items]);

  const recentAudits = audits.slice(0, 6);

  const statCards = [
    {
      title: "Items tracked",
      value: items.length,
      description: "Active product records in inventory.",
      icon: Boxes,
    },
    {
      title: "Units on hand",
      value: totals.totalUnits,
      description: "Combined quantity across all items.",
      icon: PackageSearch,
    },
    {
      title: "Inventory value",
      value: formatCurrency(totals.totalValue),
      description: "Estimated selling value on hand.",
      icon: Banknote,
    },
    {
      title: "Low stock",
      value: lowStockCount,
      description: `Items below ${LOW_STOCK_THRESHOLD} units.`,
      icon: TriangleAlert,
    },
    {
      title: "Categories",
      value: categoryCount,
      description: "Stock groups represented.",
      icon: Tags,
    },
    {
      title: "Suppliers",
      value: supplierCount,
      description: "Registered suppliers.",
      icon: CircleUser,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.5fr,0.9fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Overall summary
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Inventory at a glance
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                A quick overview of stock levels, value, categories, suppliers, and recent activity across the workspace.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Stock health
              </p>
              <p className="mt-3 text-lg font-semibold">
                {statusBreakdown.available + statusBreakdown.other} healthy
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lowStockCount} low · {statusBreakdown.out} out of stock
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/15 via-transparent to-primary/10 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Recent audit entries
              </p>
              <p className="mt-3 text-lg font-semibold">{audits.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tracked stock movements.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map(({ title, value, description, icon: Icon }) => (
          <Card key={title} className="border-border/60 bg-card/90 shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
              <div className="space-y-1">
                <CardDescription>{title}</CardDescription>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  {loading ? <Skeleton className="h-7 w-24" /> : value}
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

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" /> Category breakdown
            </CardTitle>
            <CardDescription>Items grouped by category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-5 w-full" />
                ))
              : categoryBreakdown.length === 0
                ? (
                  <p className="py-4 text-sm text-muted-foreground">
                    No categories with items yet.
                  </p>
                )
                : categoryBreakdown.map(([category, count]) => (
                    <div key={category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate">{category}</span>
                        <span className="font-medium tabular-nums">{count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: `${items.length ? (count / items.length) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageX className="h-4 w-4 text-primary" /> Stock status
            </CardTitle>
            <CardDescription>Distribution across item statuses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Available", value: statusBreakdown.available, tone: "text-primary" },
              { label: "Out of stock", value: statusBreakdown.out, tone: "text-destructive" },
              { label: "Discontinued", value: statusBreakdown.discontinued, tone: "text-muted-foreground" },
              { label: "Other", value: statusBreakdown.other, tone: "text-foreground" },
            ].map(({ label, value, tone }) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-border/60 pb-3 last:border-0 last:pb-0"
              >
                <span className="text-sm text-muted-foreground">{label}</span>
                {loading ? (
                  <Skeleton className="h-5 w-10" />
                ) : (
                  <span className={`text-lg font-semibold tabular-nums ${tone}`}>{value}</span>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
              <span className="text-sm text-muted-foreground">Gross margin</span>
              {loading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(totals.totalValue - totals.totalCost)}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <SquareStack className="h-4 w-4 text-primary" /> Recent activity
            </CardTitle>
            <CardDescription>Latest stock movements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : recentAudits.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No activity recorded yet.</p>
            ) : (
              recentAudits.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
                >
                  <div className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-medium">{entry.productName || "-"}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.user || "Unknown"} · {formatTimestamp(entry.timeStamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="text-xl">Recent stock movements</CardTitle>
          <CardDescription>Product, user, quantity change, and timestamp.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-hidden rounded-b-2xl">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-4 py-3">Product</TableHead>
                  <TableHead className="px-4 py-3">User</TableHead>
                  <TableHead className="px-4 py-3 text-right">Quantity</TableHead>
                  <TableHead className="px-4 py-3">Status</TableHead>
                  <TableHead className="px-4 py-3">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="space-y-2 py-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <Skeleton key={index} className="h-6 w-full" />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : audits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No stock movements recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  audits.slice(0, 8).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="px-4 py-3 font-medium">
                        {entry.productName || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {entry.user || "-"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right tabular-nums">
                        {entry.newQuantity}
                      </TableCell>
                      <TableCell className="px-4 py-3">{entry.status || "-"}</TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground">
                        {formatTimestamp(entry.timeStamp)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}