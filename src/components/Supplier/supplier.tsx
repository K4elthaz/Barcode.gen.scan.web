import { Card, CardContent } from "../ui/card";
import AddSupplierDialog from "./Dialog/add-supplier";
import SupplierListTable from "./Table/supplier-list";

export default function SupplierPage() {
  return (
    <div className="py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Company Supplier</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Suppliers List</h2>

            <AddSupplierDialog />
          </div>

          <div className="mt-6">
            <SupplierListTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
