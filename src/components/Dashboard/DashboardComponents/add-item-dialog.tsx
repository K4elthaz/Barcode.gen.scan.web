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

  const generateBarcode = async (): Promise<{
    barcodeId: string
    barcodeImg: string
  }> => {
    const uuid = uuidv4()
    const codeValue = uuid.replace(/[^0-9]/g, '').substring(0, 13)

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

    setBarcode(codeValue)
    setFormData((prev) => ({
      ...prev,
      barcodeId: codeValue,
      barcodeImg: downloadURL,
    }))

    return {
      barcodeId: codeValue,
      barcodeImg: downloadURL,
    }
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

    let barcodeId = barcode
    let barcodeImg = formData.barcodeImg

    if (!barcode || !formData.barcodeImg) {
      try {
        const generatedBarcode = await generateBarcode()
        barcodeId = generatedBarcode.barcodeId
        barcodeImg = generatedBarcode.barcodeImg
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
      barcodeId,
      barcodeImg,
      address,
    }

    try {
      const newItemRef = push(ref(database, 'Items'))
      await set(newItemRef, itemData)

      onAddItem?.(itemData)

      setFormData({
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
      <DialogContent className="max-h-[92vh] max-w-[94vw] overflow-hidden p-0 sm:max-w-3xl lg:max-w-5xl">
        <form onSubmit={handleSubmit} className="flex max-h-[92vh] flex-col">
          <DialogHeader className="border-b border-border/60 px-6 py-5">
            <DialogTitle className="text-xl">Add New Inventory Item</DialogTitle>
            <DialogDescription className="text-sm">
              Enter item details, assign location, and generate a QR code.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-5">
                <section className="rounded-lg border border-border/60 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold">Item Details</h3>
                    <p className="text-xs text-muted-foreground">
                      Basic product identity and classification.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
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
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold">Stock and Ownership</h3>
                    <p className="text-xs text-muted-foreground">
                      Pricing, quantity, supplier, user, and status.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                          PHP
                        </span>
                        <Input
                          id="purchasePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={formData.purchasePrice}
                          onChange={handleChange}
                          className="pl-12 text-right tabular-nums"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sellingPrice">Selling Price</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                          PHP
                        </span>
                        <Input
                          id="sellingPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          inputMode="decimal"
                          value={formData.sellingPrice}
                          onChange={handleChange}
                          className="pl-12 text-right tabular-nums"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <div className="relative">
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          step="1"
                          inputMode="numeric"
                          value={formData.quantity}
                          onChange={handleChange}
                          className="pr-14 text-right tabular-nums"
                          placeholder="0"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                          pcs
                        </span>
                      </div>
                    </div>
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
                          <SelectItem value="Discontinued">
                            Discontinued
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold">Location</h3>
                    <p className="text-xs text-muted-foreground">
                      Pick item storage location from map.
                    </p>
                  </div>
                  <div className="overflow-hidden rounded-md border border-border/60">
                    <MapSelector
                      location={formData.location}
                      onLocationChange={(loc) =>
                        setFormData((prev) => ({ ...prev, location: loc }))
                      }
                    />
                  </div>
                </section>
              </div>

              <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
                <section className="rounded-lg border border-border/60 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold">Item Image</h3>
                    <p className="text-xs text-muted-foreground">
                      Optional visual reference.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Input
                      id="itemImg"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <div className="flex h-40 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/30">
                      {formData.itemImg ? (
                        <img
                          src={formData.itemImg}
                          alt="Uploaded Item"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No image selected
                        </span>
                      )}
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-border/60 p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">QR Code</h3>
                      <p className="text-xs text-muted-foreground">
                        Auto-generated item code.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateBarcode}
                    >
                      Generate
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="barcodeId">QR Code ID</Label>
                      <Input
                        id="barcodeId"
                        value={formData.barcodeId}
                        onChange={handleChange}
                        disabled
                      />
                    </div>

                    <div className="flex min-h-44 items-center justify-center rounded-md border border-dashed border-border bg-muted/30 p-4">
                      {barcode ? (
                        <div id="barcode-svg" className="rounded-md bg-white p-3">
                          <BarcodeDisplay value={barcode} />
                        </div>
                      ) : (
                        <span className="text-center text-sm text-muted-foreground">
                          Generate QR code before saving.
                        </span>
                      )}
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>

          <DialogFooter className="border-t border-border/60 bg-background px-6 py-4">
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
