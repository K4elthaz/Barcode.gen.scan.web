import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories } from "@/services/category-services";

export default function CategoryListTable() {
  const [categoryList, setCategoryList] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = getCategories(setCategoryList);
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <Table className="text-center cursor-pointer border-collapse border">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Category Name</TableHead>
            <TableHead className="text-center">Category Description</TableHead>
            <TableHead className="text-center">Category Image</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoryList.length === 0 ? (
            <div className="p-4">
              <p className="text-zinc-500">No categories found.</p>
            </div>
          ) : (
            categoryList.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-20 h-20 object-cover mx-auto rounded"
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
