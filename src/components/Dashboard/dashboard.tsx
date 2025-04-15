import InventoryDashboard from "./DashboardComponents/inventory-dashbaord"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Inventory Management System</h1>
      <InventoryDashboard />
    </main>
  )
}
