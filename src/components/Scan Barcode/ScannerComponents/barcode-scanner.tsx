"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onError: (error: Error) => void
}

export function BarcodeScanner({ onScan, onError }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualEntry, setManualEntry] = useState<string>("")
  const [showManualEntry, setShowManualEntry] = useState(false)

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationFrameId: number | null = null

    // Replace the startScanning function with this improved version that provides better error diagnostics
    const startScanning = async () => {
      try {
        // Check if running in a secure context (HTTPS or localhost)
        if (!window.isSecureContext) {
          throw new Error("Camera access requires a secure connection (HTTPS). Try using manual entry instead.")
        }

        // Check if mediaDevices is supported
        if (!navigator.mediaDevices) {
          throw new Error(
            "Camera access is not available. This could be due to browser restrictions or privacy settings.",
          )
        }

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera access method is not supported by this browser. Try using a different browser.")
        }

        // Get camera stream
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
          })
        } catch (mediaError: any) {
          // Handle specific getUserMedia errors
          if (mediaError.name === "NotAllowedError" || mediaError.name === "PermissionDeniedError") {
            throw new Error("Camera access was denied. Please allow camera access in your browser settings.")
          } else if (mediaError.name === "NotFoundError") {
            throw new Error("No camera found on this device. Try using manual entry instead.")
          } else if (mediaError.name === "NotReadableError" || mediaError.name === "AbortError") {
            throw new Error("Could not access your camera. It may be in use by another application.")
          } else {
            throw new Error(`Camera error: ${mediaError.message || mediaError.name || "Unknown error"}`)
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        // Check if BarcodeDetector is supported
        if (!("BarcodeDetector" in window)) {
          setError("Barcode detection is not supported by this browser. Try using manual entry instead.")
          setShowManualEntry(true)
          return
        }

        // Create barcode detector
        const detector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "upc_a", "upc_e"],
        })

        // Start detection loop
        const detectCodes = async () => {
          if (videoRef.current && detector) {
            try {
              const barcodes = await detector.detect(videoRef.current)
              if (barcodes.length > 0) {
                onScan(barcodes[0].rawValue)
                return // Stop scanning after successful detection
              }
              animationFrameId = requestAnimationFrame(detectCodes)
            } catch (err) {
              if (err instanceof Error) {
                onError(err)
                setError(err.message)
                setShowManualEntry(true)
              }
            }
          }
        }

        detectCodes()
      } catch (err) {
        if (err instanceof Error) {
          onError(err)
          setError(err.message)
          setShowManualEntry(true)
        }
      }
    }

    startScanning()

    return () => {
      // Clean up
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [onScan, onError])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualEntry.trim()) {
      onScan(manualEntry.trim())
    }
  }

  // Also update the return section to include troubleshooting tips
  return (
    <div className="space-y-4">
      {error ? (
        <div className="space-y-4">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Troubleshooting tips:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Make sure you're using a modern browser (Chrome, Firefox, Safari)</li>
              <li>Check that camera permissions are allowed in your browser settings</li>
              <li>Ensure the website is accessed via HTTPS</li>
              <li>Try refreshing the page</li>
            </ul>
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <video ref={videoRef} className="w-full max-h-[300px] object-cover" playsInline muted autoPlay />
        </Card>
      )}

      {showManualEntry || error ? (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter barcode manually"
            value={manualEntry}
            onChange={(e) => setManualEntry(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Position the barcode within the camera view to scan</p>
      )}
    </div>
  )
}
