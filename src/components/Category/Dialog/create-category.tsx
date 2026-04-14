import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage, getRequiredFieldsMessage } from "@/lib/errors";
import {
  checkIfCategoryExists,
  createCategory,
} from "@/services/category-services";

export default function CreateCategoryDialog() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);

  const handleCreateCategory = async () => {
    const missingFields = [
      !categoryName.trim() ? "a category name" : null,
      !categoryDescription.trim() ? "a category description" : null,
      !categoryImage ? "a category image" : null,
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
      const isDuplicate = await checkIfCategoryExists(categoryName);

      if (isDuplicate) {
        toast({
          title: "Category already exists",
          description: "Choose a different category name and try again.",
          variant: "destructive",
        });
        return;
      }

      await createCategory(
        categoryName,
        categoryDescription,
        categoryImage as File
      );
      setCategoryName("");
      setCategoryDescription("");
      setCategoryImage(null);
      setIsDialogOpen(false);
      toast({
        title: "Category created",
        description: `Saved ${categoryName.trim()} successfully.`,
      });
    } catch (error) {
      toast({
        title: "Unable to create category",
        description: getErrorMessage(
          error,
          "The category could not be created. Please try again."
        ),
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Create a category to classify your supplies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Category Name</Label>
            <Input
              id="category-name"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Category Description</Label>
            <Input
              id="category-description"
              placeholder="Enter a short category description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Category Image</Label>
            <Input
              id="category-image"
              type="file"
              onChange={(e) => setCategoryImage(e.target.files?.[0] || null)}
            />
          </div>
        </div>

        <Button className="w-full text-white" onClick={handleCreateCategory}>
          Create Category
        </Button>
      </DialogContent>
    </Dialog>
  );
}
