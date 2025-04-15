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
    if (!categoryName || !categoryDescription || !categoryImage) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const isDuplicate = await checkIfCategoryExists(categoryName);

      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Category name already exists.",
          variant: "destructive",
        });
        return;
      }

      await createCategory(categoryName, categoryDescription, categoryImage);
      setCategoryName("");
      setCategoryDescription("");
      setCategoryImage(null);
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Category created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category.",
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
