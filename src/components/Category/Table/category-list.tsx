import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategories } from "@/services/category-services";
import { Category } from "@/types/category";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImageIcon, Layers3, Search, Sparkles } from "lucide-react";

const PAGE_SIZE = 8;

export default function CategoryListTable() {
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsubscribe = getCategories(setCategoryList);
    return () => unsubscribe();
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return categoryList;
    }

    return categoryList.filter((category) =>
      [category.name, category.description].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [query, categoryList]);

  const totalPages = Math.ceil(filteredCategories.length / PAGE_SIZE);

  const paginatedCategories = filteredCategories.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const withImageCount = categoryList.filter((category) => Boolean(category.image)).length;
  const longDescriptionCount = categoryList.filter(
    (category) => category.description.trim().length >= 40
  ).length;

  const summaryCards = [
    {
      title: "Categories",
      value: categoryList.length,
      description: "Total category records configured.",
      icon: Layers3,
    },
    {
      title: "With images",
      value: withImageCount,
      description: "Categories using visual references.",
      icon: ImageIcon,
    },
    {
      title: "Detailed entries",
      value: longDescriptionCount,
      description: "Descriptions with richer context text.",
      icon: Sparkles,
    },
    {
      title: "Search results",
      value: filteredCategories.length,
      description: "Current rows after active filter.",
      icon: Search,
    },
  ];

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

      <div className="space-y-4">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Search category name or description"
            className="pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60">
          <Table className="border-collapse text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead className="min-w-[320px]">Category Description</TableHead>
                <TableHead>Category Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No categories found</p>
                      <p className="text-sm text-muted-foreground">
                        Add category or widen search terms.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id} className="align-top">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="whitespace-normal break-words text-muted-foreground">
                      {category.description}
                    </TableCell>
                    <TableCell>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            Showing {paginatedCategories.length} of {filteredCategories.length} result(s). Page {page} of {totalPages || 1}
          </span>

          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((currentPage) => currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
