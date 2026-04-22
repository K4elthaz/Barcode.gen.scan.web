import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSuppliers } from "@/services/suppliers-services";
import { Suppliers } from "@/types/suppliers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, ImageIcon, PhoneCall, Search } from "lucide-react";

const PAGE_SIZE = 8;

export default function SupplierListTable() {
  const [supplierList, setSupplierList] = useState<Suppliers[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsubscribe = getSuppliers(setSupplierList);
    return () => unsubscribe();
  }, []);

  const filteredSuppliers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return supplierList;
    }

    return supplierList.filter((supplier) => {
      return [
        supplier.name,
        supplier.shopName,
        supplier.category,
        supplier.description,
        supplier.phone,
        supplier.email,
        supplier.address,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query, supplierList]);

  const totalPages = Math.ceil(filteredSuppliers.length / PAGE_SIZE);

  const paginatedSuppliers = filteredSuppliers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const categoriesCount = new Set(
    supplierList.map((supplier) => supplier.category).filter(Boolean)
  ).size;
  const withImageCount = supplierList.filter((supplier) => Boolean(supplier.image)).length;
  const withPhoneCount = supplierList.filter((supplier) => Boolean(supplier.phone?.trim())).length;

  const summaryCards = [
    {
      title: "Suppliers",
      value: supplierList.length,
      description: "Total vendor profiles in system.",
      icon: Building2,
    },
    {
      title: "Categories",
      value: categoriesCount,
      description: "Distinct sourcing categories covered.",
      icon: Search,
    },
    {
      title: "With contacts",
      value: withPhoneCount,
      description: "Profiles with phone details available.",
      icon: PhoneCall,
    },
    {
      title: "With images",
      value: withImageCount,
      description: "Profiles with visual supplier identity.",
      icon: ImageIcon,
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
            placeholder="Search name, shop, category, contact, address"
            className="pl-9"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/60">
          <Table className="border-collapse text-sm">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Shop Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="min-w-[220px]">Description</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="min-w-[220px]">Address</TableHead>
                <TableHead>Image</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    <div className="space-y-2">
                      <p className="font-medium">No suppliers found</p>
                      <p className="text-sm text-muted-foreground">
                        Add supplier record or widen search terms.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSuppliers.map((supplier) => (
                  <TableRow key={supplier.id} className="align-top">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.shopName}</TableCell>
                    <TableCell>{supplier.category}</TableCell>
                    <TableCell className="whitespace-normal break-words text-muted-foreground">
                      {supplier.description}
                    </TableCell>
                    <TableCell>{supplier.phone}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell className="whitespace-normal break-words text-muted-foreground">
                      {supplier.address}
                    </TableCell>
                    <TableCell>
                      {supplier.image ? (
                        <img
                          src={supplier.image}
                          alt={supplier.name}
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
            Showing {paginatedSuppliers.length} of {filteredSuppliers.length} result(s). Page {page} of {totalPages || 1}
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
