export interface AddItemFormData {
  productName: string
  description: string
  category: string
  unitMeasure: string
  purchasePrice: number
  sellingPrice: number
  quantity: number
  supplierInfo: string
  itemImg: string
  sku: string
  barcodeId: string
  barcodeImg: string
  status: string
  user: string
  location: { lat: number; lng: number }
}

export const DEFAULT_ITEM_LOCATION = {
  lat: 14.5995,
  lng: 120.9842,
}

export const isAddItemFormValid = (formData: AddItemFormData): boolean => {
  return (
    formData.productName.trim() !== '' &&
    formData.sku.trim() !== '' &&
    formData.category.trim() !== '' &&
    formData.unitMeasure.trim() !== '' &&
    formData.purchasePrice > 0 &&
    formData.sellingPrice > 0 &&
    formData.quantity > 0 &&
    formData.supplierInfo.trim() !== '' &&
    formData.status.trim() !== '' &&
    formData.user.trim() !== '' &&
    formData.location.lat !== 0 &&
    formData.location.lng !== 0 &&
    !!formData.barcodeId &&
    !!formData.barcodeImg
  )
}
