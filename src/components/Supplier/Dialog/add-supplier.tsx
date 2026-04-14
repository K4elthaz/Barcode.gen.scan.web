import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getCategories } from "@/services/category-services";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  checkIfSupplierExists,
  addSupplier,
} from "@/services/suppliers-services";
import { getErrorMessage, getRequiredFieldsMessage } from "@/lib/errors";

export default function AddSupplierDialog() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    shopName: "",
    category: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    image: null as File | null,
  });

  useEffect(() => {
    const unsubscribe = getCategories(setCategories);
    return () => unsubscribe();
  }, []);

  const handleAddSupplier = async () => {
    const missingFields = [
      !formData.name.trim() ? "a supplier name" : null,
      !formData.shopName.trim() ? "a shop name" : null,
      !formData.category ? "a category" : null,
      !formData.description.trim() ? "a description" : null,
      !formData.phone.trim() ? "a phone number" : null,
      !formData.email.trim() ? "an email address" : null,
      !formData.address.trim() ? "an address" : null,
      !formData.image ? "a supplier image" : null,
    ].filter(Boolean) as string[];

    if (missingFields.length > 0) {
      toast({
        title: "Missing information",
        description: getRequiredFieldsMessage(missingFields),
        variant: "destructive",
      });
      return;
    }

    try {
      const isDuplicate = await checkIfSupplierExists(formData.name);
      if (isDuplicate) {
        toast({
          title: "Supplier already exists",
          description: "Use a different supplier name and try again.",
          variant: "destructive",
        });
        return;
      }

      await addSupplier(
        formData.name,
        formData.shopName,
        formData.category,
        formData.description,
        formData.phone,
        formData.email,
        formData.address,
        formData.image as File
      );
      setFormData({
        name: "",
        shopName: "",
        category: "",
        description: "",
        phone: "",
        email: "",
        address: "",
        image: null,
      });
      setIsDialogOpen(false);
      toast({
        title: "Supplier added",
        description: `${formData.name.trim()} was saved successfully.`,
      });
    } catch (error) {
      toast({
        title: "Unable to add supplier",
        description: getErrorMessage(
          error,
          "The supplier could not be created. Please try again."
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="text-white">
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add new Supplier</DialogTitle>
          <DialogDescription>
            Add a supplier to classify your supplies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name</Label>
              <Input
                id="supplier-name"
                placeholder="Enter supplier name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-shop-name">Supplier Shop Name</Label>
              <Input
                id="supplier-shop-name"
                placeholder="Enter shop name"
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-category">Supplier Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-description">Supplier Description</Label>
            <Input
              id="supplier-description"
              placeholder="Enter a short supplier description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Supplier Phone</Label>
              <Input
                id="supplier-phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-email">Supplier Email</Label>
              <Input
                id="supplier-email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-address">Supplier Address</Label>
            <Input
              id="supplier-address"
              placeholder="Enter supplier address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier-image">Supplier Image</Label>
            <Input
              id="supplier-image"
              type="file"
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.files?.[0] ?? null })
              }
            />
          </div>
        </div>

        <Button className="w-full text-white" onClick={handleAddSupplier}>
          Add Supplier
        </Button>
      </DialogContent>
    </Dialog>
  );
}
