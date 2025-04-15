export interface Category {
    id: string
    name: string
    description: string
    image: string
    createdAt: string
}

export interface InventoryItem {
    id: string;
    productName: string;
    description: string;
    category: string;
    unitMeasure: string;
    purchasePrice: string;
    sellingPrice: string;
    quantity: number;
    supplierInfo: string;
    itemImg: string;
    sku: string;
    barcodeId: string;
    barcodeImg: string;
    status: string;
  }
  