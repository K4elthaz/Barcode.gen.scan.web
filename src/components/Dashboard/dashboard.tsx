import InventoryDashboard from "./DashboardComponents/inventory-dashbaord"

export default function Home() {
  return (
    <main className="space-y-6 py-2">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.5fr,0.9fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Inventory command center
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Inventory Management System
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Monitor stock, print barcodes, and review item movement from one workspace built for daily warehouse flow.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Workspace focus
              </p>
              <p className="mt-3 text-lg font-semibold">Fast stock visibility</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Keep receiving, lookup, and barcode tasks inside one flow.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/15 via-transparent to-primary/10 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Today goal
              </p>
              <p className="mt-3 text-lg font-semibold">Reduce search time</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cleaner hierarchy, clearer actions, stronger dashboard scan path.
              </p>
            </div>
          </div>
        </div>
      </section>
      <InventoryDashboard />
    </main>
  )
}
