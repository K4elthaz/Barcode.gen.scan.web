"use client"

import { useEffect, useRef } from "react"
import JsBarcode from "jsbarcode"

interface BarcodeDisplayProps {
  value: string
}

export function BarcodeDisplay({ value }: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: "CODE128",
          width: 1.5,
          height: 40,
          displayValue: true,
          fontSize: 12,
          margin: 5,
        })
      } catch (error) {
        console.error("Error generating barcode:", error)
      }
    }
  }, [value])

  return (
    <div className="flex justify-center">
      <svg ref={barcodeRef} className="w-full max-w-[150px]"></svg>
    </div>
  )
}
