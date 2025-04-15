import { ref, set, push, get, onValue } from "firebase/database";
import { database, storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";


export const createCategory = async (
    categoryName: string,
    categoryDescription: string,
    categoryImage: File,
) => {
    const createdAt = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      const imageRef = storageRef(storage, `categories/${categoryImage.name}`);
      const snapshot = await uploadBytes(imageRef, categoryImage);
      const imageUrl = await getDownloadURL(snapshot.ref);

      const categoryRef = push(ref(database, "categories"));
      return set (categoryRef, {
        name: categoryName,
        description: categoryDescription,
        image: imageUrl,
        createdAt: createdAt,
      })
}

export const checkIfCategoryExists = async (categoryName: string) => {
    const categoryRef = ref(database, "categories");
    const snapshot = await get(categoryRef);

    if (snapshot.exists()) {
        const category = snapshot.val();

        return Object.values(category).some((category: any) => category.name === categoryName);
    }

    return false;
}

export const getCategories = (callback: (categories: any[]) => void) => {
    const categoryRef = ref(database, "categories");

    const unsubscribe = onValue(categoryRef, (snapshot) => {
        if (snapshot.exists()) {
            const categoriesData = snapshot.val();
            const categoriesArray = Object.entries(categoriesData).map(
                ([id, categories]) => ({
                    id, 
                    ...(categories as Record<string, any>),
                })
            );
            callback(categoriesArray);
        } else {
            callback([]);
        }
    })

    return () => unsubscribe();

}