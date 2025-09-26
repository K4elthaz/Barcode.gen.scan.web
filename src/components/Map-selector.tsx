import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'

interface MapSelectorProps {
  location: { lat: number; lng: number }
  onLocationChange: (location: { lat: number; lng: number }) => void
}

// Optional custom marker icon
const markerIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
})

export function MapSelector({ location, onLocationChange }: MapSelectorProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>([
    location.lat,
    location.lng,
  ])

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng
        setMarkerPos([lat, lng]) // Update marker visually
        onLocationChange({ lat, lng }) // Send coordinates to parent
      },
    })
    return null
  }

  return (
    <MapContainer
      center={[location.lat || 14.5995, location.lng || 120.9842]} // Default Manila
      zoom={13}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <MapClickHandler />
      {markerPos && <Marker position={markerPos} icon={markerIcon} />}
    </MapContainer>
  )
}
        