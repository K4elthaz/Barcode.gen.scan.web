import { ref, set, push, get, onValue } from "firebase/database";
import { database, storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

export const addSupplier = async (
    name: string,
    shopName: string,
    category: string,
    description: string,
    phone: string,
    email: string,
    address: string,
    image: File
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
    
    const imageRef = storageRef(storage, `suppliers/${image.name}`);
    const snapshot = await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(snapshot.ref);
    
    const supplierRef = push(ref(database, "suppliers"));
    return set(supplierRef, {
        name,
        shopName,
        category,
        description,
        phone,
        email,
        address,
        image: imageUrl,
        createdAt,
    });
}

export const checkIfSupplierExists = async (name: string) => {
    const supplierRef = ref(database, "suppliers");
    const snapshot = await get(supplierRef);

    if (snapshot.exists()) {
        const suppliers = snapshot.val();

        return Object.values(suppliers).some((supplier: any) => supplier.name === name);
    }

    return false;
}

export const getSuppliers = (callback: (suppliers: any[]) => void) => {
    const supplierRef = ref(database, "suppliers");

    const unsubscribe = onValue(supplierRef, (snapshot) => {
        if (snapshot.exists()) {
            const suppliersData = snapshot.val();
            const suppliersArray = Object.entries(suppliersData).map(
                ([id, suppliers]) => ({
                    id,
                    ...(suppliers as Record<string, any>),
                })
            );
            callback(suppliersArray);
        } else {
            callback([]);
        }
    });

    return unsubscribe;
}