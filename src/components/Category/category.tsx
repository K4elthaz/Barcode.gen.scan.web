import { Card, CardContent } from "../ui/card";
import CreateCategoryDialog from "./Dialog/create-category";
import CategoryListTable from "./Table/category-list";

export default function CategoryPage() {
  return (
    <div className="py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Category List</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Inventory Items</h2>
            <CreateCategoryDialog />
          </div>

          <div className="mt-6">
            <CategoryListTable />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
