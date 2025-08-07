// AuditTrail.tsx
import AuditTrailListTable from "./Table/auditTrailList";

export default function AuditTrailyPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Trail</h1>
      <AuditTrailListTable />
    </main>
  );
}
