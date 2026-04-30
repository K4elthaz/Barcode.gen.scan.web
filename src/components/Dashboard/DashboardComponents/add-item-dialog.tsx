import type React from 'react'
import { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BarcodeDisplay } from './barcode-display'
import { ref, push, set } from 'firebase/database'
import { database } from '@/lib/firebase'
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage'
import QRCode from 'qrcode'
import { getCategories } from '@/services/category-services'
import { MapSelector } from '@/components/Map-selector'
import { reverseGeocode } from '@/utils/geocode'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/errors'
import {
  DEFAULT_ITEM_LOCATION,
  isAddItemFormValid,
} from './add-item-validation.ts'

interface AddItemDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  onAddItem?: (item: any) => void
}

export function AddItemDialog({
  open,
  setOpen,
  onAddItem,
}: AddItemDialogProps) {
  const { toast } = useToast()
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    unitMeasure: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    supplierInfo: '',
    itemImg: '',
    sku: '',
    barcodeId: '',
    barcodeImg: '',
    status: '',
    user: '',
    location: DEFAULT_ITEM_LOCATION,
  })

  const [barcode, setBarcode] = useState('')
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const unsubscribe = getCategories(setCategories)
    return () => unsubscribe()
  }, [])

  const generateBarcode = async (): Promise<void> => {
    const uuid = uuidv4()
    const codeValue = uuid.replace(/[^0-9]/g, '').substring(0, 13)

    setBarcode(codeValue)
    setFormData((prev) => ({ ...prev, barcodeId: codeValue }))

    const qrDataUrl = await QRCode.toDataURL(codeValue, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'M',
    })

    const response = await fetch(qrDataUrl)
    const qrBlob = await response.blob()

    const storage = getStorage()
    const barcodeRef = storageRef(storage, `barcode-images/${codeValue}.png`)

    await uploadBytes(barcodeRef, qrBlob)
    const downloadURL = await getDownloadURL(barcodeRef)
    setFormData((prev) => ({ ...prev, barcodeImg: downloadURL }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: ['quantity', 'purchasePrice', 'sellingPrice'].includes(id)
        ? Number(value) || 0
        : value,
    }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const storage = getStorage()
    const imageRef = storageRef(storage, `item-images/${file.name}`)

    try {
      await uploadBytes(imageRef, file)
      const url = await getDownloadURL(imageRef)
      setFormData((prev) => ({ ...prev, itemImg: url }))
    } catch (err) {
      toast({
        title: 'Image upload failed',
        description: getErrorMessage(
          err,
          'The item image could not be uploaded. Please try again.'
        ),
        variant: 'destructive',
      })
    }
  }

  const handleCategoryChange = (value: string) => {
    const selectedCategory = categories.find((category) => category.id === value)

    setSelectedCategoryId(value)
    setFormData((prev) => ({
      ...prev,
      category: selectedCategory?.name ?? '',
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Wait for barcode generation if not already done
    if (!barcode || !formData.barcodeImg) {
      try {
        await generateBarcode()
      } catch (err) {
        toast({
          title: 'QR code generation failed',
          description: getErrorMessage(
            err,
            'A QR code could not be generated for this item. Please try again.'
          ),
          variant: 'destructive',
        })
        return
      }
    }

    let address = ''
    try {
      address = await reverseGeocode(
        formData.location.lat,
        formData.location.lng
      )
    } catch (err) {
      console.error('Reverse geocoding failed', err)
    }

    const itemData = {
      ...formData,
      barcodeId: barcode,
      address, // store the human-readable address
    }

    try {
      const newItemRef = push(ref(database, 'Items'))
      await set(newItemRef, itemData)

      onAddItem?.(itemData)

      // Reset form
      // Reset form
      setFormData({
        productName: '',
        description: '',
        category: '',
        unitMeasure: '',
        purchasePrice: 0, // 👈 number, not ''
        sellingPrice: 0, // 👈 number, not ''
        quantity: 0, // 👈 number
        supplierInfo: '',
        itemImg: '',
        sku: '',
        barcodeId: '',
        barcodeImg: '',
        status: '',
        user: '',
        location: DEFAULT_ITEM_LOCATION,
      })
      setSelectedCategoryId('')

      setBarcode('')
      setOpen(false)
      toast({
        title: 'Item added',
        description: `${itemData.productName} was saved successfully.`,
      })
    } catch (error) {
      toast({
        title: 'Unable to save item',
        description: getErrorMessage(
          error,
          'The item could not be saved. Please try again.'
        ),
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] lg:max-w-[700px]">
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Fill in the item details and click "Generate QR Code".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Product Name</Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitMeasure">Unit Measure</Label>
                <Input
                  id="unitMeasure"
                  value={formData.unitMeasure}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min="0"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplierInfo">Supplier Info</Label>
                <Input
                  id="supplierInfo"
                  value={formData.supplierInfo}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Input
                  id="user"
                  value={formData.user}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Select Location</Label>
                <MapSelector
                  location={formData.location}
                  onLocationChange={(loc) =>
                    setFormData((prev) => ({ ...prev, location: loc }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                    <SelectItem value="Discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemImg">Upload Item Image (Optional)</Label>
                <Input
                  id="itemImg"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {formData.itemImg && (
                  <img
                    src={formData.itemImg}
                    alt="Uploaded Item"
                    className="max-h-32 rounded-md mt-2"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcodeId">
                  QR Code ID (Automatically Generated)
                </Label>
                <Input
                  id="barcodeId"
                  value={formData.barcodeId}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>QR Code Sticker</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateBarcode}
                >
                  Generate QR Code
                </Button>
              </div>

              {barcode ? (
                <div className="p-4 border rounded-md flex justify-center">
                  <div id="barcode-svg">
                    <BarcodeDisplay value={barcode} />
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-md flex justify-center items-center h-20 text-muted-foreground">
                  Click generate to create a QR code
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isAddItemFormValid(formData)}>
              Add Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
