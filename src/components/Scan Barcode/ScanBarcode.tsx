'use client'

import { useState, useRef } from 'react'
import JsBarcode from 'jsbarcode'
import { v4 as uuidv4 } from 'uuid'

export default function ScanBarcode() {
  const [sku, setSku] = useState('')
  const [barcodeValue, setBarcodeValue] = useState('')
  const barcodeRef = useRef<HTMLCanvasElement>(null)

  const handleGenerate = () => {
    if (sku.trim() === '') return;
    const value = `${sku}-${uuidv4().slice(0, 8)}`
    setBarcodeValue(value)

    if (barcodeRef.current) {
      // Ensure canvas is clear before drawing
      const canvas = barcodeRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      try {
        JsBarcode(barcodeRef.current, value, {
          format: 'CODE128',
          lineColor: '#000',
          width: 2,
          height: 80,
          displayValue: true,
        })
      } catch (err) {
        console.error('Barcode generation error:', err)
      }
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Create Inventory Item</h2>
      <input
        className="w-full border p-2 rounded"
        placeholder="SKU"
        value={sku}
        onChange={(e) => setSku(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Barcode
      </button>

      {barcodeValue && (
        <div className="mt-6">
          <canvas ref={barcodeRef} width="300" height="100"></canvas> {/* Set width and height */}
          <p className="text-gray-500 text-sm mt-2">Value: {barcodeValue}</p>
        </div>
      )}
    </div>
  )
}
