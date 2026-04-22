// AuditTrail.tsx
import AuditTrailListTable from "./Table/auditTrailList";

export default function AuditTrailyPage() {
  return (
    <main className="space-y-6 py-2">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.45fr,0.85fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Trace activity
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Audit Trail
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Review inventory movement history, quantity changes, and location checks from one timeline built for reconciliation.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Best use
              </p>
              <p className="mt-3 text-lg font-semibold">Fast discrepancy review</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Compare prior quantity, new quantity, user action, and current location in one pass.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/15 via-transparent to-primary/10 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Focus
              </p>
              <p className="mt-3 text-lg font-semibold">Sort recent first</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan latest changes first, then drill into outliers and location mismatches.
              </p>
            </div>
          </div>
        </div>
      </section>
      <AuditTrailListTable />
    </main>
  );
}
