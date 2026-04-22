import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import AddSupplierDialog from "./Dialog/add-supplier";
import SupplierListTable from "./Table/supplier-list";

export default function SupplierPage() {
  return (
    <div className="space-y-6 py-2">
      <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.45fr,0.85fr] md:px-8">
          <div className="space-y-4">
            <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Vendor network
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Company Supplier
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Keep partner records, contact channels, and sourcing categories in one place for faster restock coordination.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Workflow
              </p>
              <p className="mt-3 text-lg font-semibold">Central supplier lookup</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Match item category with supplier profile and contact details quickly.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/15 via-transparent to-primary/10 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Priority
              </p>
              <p className="mt-3 text-lg font-semibold">Faster procurement calls</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search by shop, category, or contact and launch reorder discussions earlier.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card className="border-border/60 bg-card/90 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Supplier List</CardTitle>
            <CardDescription>
              View supplier profiles, category coverage, and contact information.
            </CardDescription>
          </div>

          <AddSupplierDialog />
        </CardHeader>

        <CardContent className="p-6">
          <SupplierListTable />
        </CardContent>
      </Card>
    </div>
  );
}
