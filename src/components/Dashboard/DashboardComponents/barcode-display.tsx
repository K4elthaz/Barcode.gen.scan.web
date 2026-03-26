"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"

interface BarcodeDisplayProps {
  value: string
}

export function BarcodeDisplay({ value }: BarcodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  useEffect(() => {
    let isMounted = true

    const generateQr = async () => {
      if (!value) {
        setQrDataUrl("")
        return
      }

      try {
        const dataUrl = await QRCode.toDataURL(value, {
          width: 160,
          margin: 1,
          errorCorrectionLevel: "M",
        })

        if (isMounted) {
          setQrDataUrl(dataUrl)
        }
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    generateQr()

    return () => {
      isMounted = false
    }
  }, [value])

  if (!qrDataUrl) {
    return null
  }

  return (
    <div className="flex justify-center">
      <img
        src={qrDataUrl}
        alt={`QR code for ${value}`}
        className="w-full max-w-[150px]"
      />
    </div>
  )
}
