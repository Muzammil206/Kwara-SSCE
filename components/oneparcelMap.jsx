"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl } from "react-leaflet"
import LeafletDrawTools from "./leaflet-draw-tools"
import Link from "next/link"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"

const { BaseLayer } = LayersControl;

const ParcelModal = ({ isOpen, onClose, parcelData }) => {
  if (!isOpen || !parcelData) return null

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status?.toLowerCase()) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getPaymentStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium"
    switch (status?.toLowerCase()) {
      case "paid":
        return `${baseClasses} bg-green-100 text-green-800`
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case "overdue":
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center" style={{ zIndex: 99999 }}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-popover rounded-lg shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Parcel Details</h2>
            <button
              onClick={onClose}
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors p-1 rounded-full hover:bg-primary-foreground/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Client Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Client Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Client Name:</span>
                <span className="text-sm text-foreground font-medium">{parcelData.client_name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Client Address:</span>
                <span className="text-sm text-foreground font-medium text-right max-w-[200px]">
                  {parcelData.client_address || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Parcel Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Parcel Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Plan Number:</span>
                <span className="text-sm text-foreground font-mono bg-muted px-2 py-1 rounded">
                  {parcelData.plan_number || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Area:</span>
                <span className="text-sm text-foreground font-medium">
                  {parcelData.area ? `${parcelData.area} m²` : "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">LGA:</span>
                <span className="text-sm text-foreground font-medium">{parcelData.lga || "N/A"}</span>
              </div>
               <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Surveyor Name:</span>
                <span className="text-sm text-foreground font-medium">{parcelData.surveyor_name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Pillar Type:</span> 
                <span className="text-sm text-foreground font-medium capitalize">
                  {parcelData.pillar_type || "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Status Information</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <span className={getStatusBadge(parcelData.status)}>{parcelData.status || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">Payment Status:</span>
                <span className={getPaymentStatusBadge(parcelData.payment_status)}>
                  {parcelData.payment_status || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Close
          </button>
          <Link href={`/admin/map`} className="px-6 bg-blue-600 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
          view all applications on map
          </Link>
        </div>
      </div>
    </div>
  )
}

const MapController = ({ onMapReady, onGeoJsonReady, geoJsonData, parcelId, zoomToParcel }) => {
  const map = useMap()

  useEffect(() => {
    if (map) {
      console.log("[v0] Map instance captured via useMap hook")
      onMapReady(map)
    }
  }, [map, onMapReady])

  return null
}

const MapPage = ({ id }) => {
  const params = useParams()
  const [parcelId, setParcelId] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [geoJsonLayer, setGeoJsonLayer] = useState(null)
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isMapReady, setIsMapReady] = useState(false)

  const defaultStyle = {
    color: "#bb110bff",
    weight: 2,
    opacity: 0.8,
    fillOpacity: 0.3,
  }

  const highlightStyle = {
    color: "#e66b14ff",
    weight: 3,
    opacity: 1,
    fillOpacity: 0.5,
  }

  useEffect(() => {
    const extractParcelId = () => {
      // Try multiple sources for the ID
      let extractedId = null

      // 1. From props
      if (id) {
        extractedId = id
        console.log("[v0] Got ID from props:", extractedId)
      }
      // 2. From useParams
      else if (params?.id) {
        extractedId = params.id
        console.log("[v0] Got ID from params:", extractedId)
      }
      // 3. From URL search params
      else if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search)
        const urlId = urlParams.get("id")
        if (urlId) {
          extractedId = urlId
          
        }
      }
      // 4. From URL pathname
      else if (typeof window !== "undefined") {
        const pathParts = window.location.pathname.split("/")
        const idIndex = pathParts.findIndex((part) => part === "map") + 1
        if (idIndex > 0 && idIndex < pathParts.length) {
          extractedId = pathParts[idIndex]
        
        }
      }


      setParcelId(extractedId)
    }

    // Run immediately and also after a short delay to handle dynamic imports
    extractParcelId()
    const timer = setTimeout(extractParcelId, 100)

    return () => clearTimeout(timer)
  }, [id, params])

  useEffect(() => {
    const fetchData = async () => {
      if (!parcelId) {
    
        return
      }

     
      setLoading(true)
      setError(null)

      try {
        const url = `/api/getGeojson?id=${parcelId}`
       
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
   
        setGeoJsonData(data)
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [parcelId])

  const onEachFeature = (feature, layer) => {
    // Set default style
    layer.setStyle(defaultStyle)

    // Highlight if this is the selected parcel
    if (String(feature.properties.id) === String(parcelId)) {
      layer.setStyle(highlightStyle)
    }

    layer.on("click", () => {
      setSelectedParcel(feature.properties)
      setIsModalOpen(true)
    })

    layer.on("mouseover", () => {
      if (String(feature.properties.id) !== String(parcelId)) {
        layer.setStyle({
          ...defaultStyle,
          weight: 3,
          fillOpacity: 0.4,
        })
      }
    })

    layer.on("mouseout", () => {
      if (String(feature.properties.id) !== String(parcelId)) {
        layer.setStyle(defaultStyle)
      }
    })
  }

  const zoomToParcel = (retryCount = 0, maxRetries = 5) => {
    console.log("[v0] Attempting to zoom to parcel, retry:", retryCount)

    if (!isMounted || !isMapReady || !geoJsonData || !mapInstance || !geoJsonLayer || !parcelId) {
      console.log("[v0] Missing dependencies for zoom:", {
        isMounted,
        isMapReady,
        hasGeoJsonData: !!geoJsonData,
        hasMapInstance: !!mapInstance,
        hasGeoJsonLayer: !!geoJsonLayer,
        hasParcelId: !!parcelId,
      })

      if (isMounted && retryCount < maxRetries) {
        setTimeout(() => zoomToParcel(retryCount + 1, maxRetries), 500)
      }
      return
    }

    try {
      const map = mapInstance
      if (!map || typeof map.fitBounds !== "function") {
        console.log("[v0] Map instance not ready")
        if (retryCount < maxRetries) {
          setTimeout(() => zoomToParcel(retryCount + 1, maxRetries), 500)
        }
        return
      }

      const layers = geoJsonLayer.getLayers()
      console.log("[v0] Available layers:", layers.length)

      const targetLayer = layers.find((layer) => {
        const layerId = String(layer.feature?.properties?.id)
        const targetId = String(parcelId)
        console.log("[v0] Comparing layer ID:", layerId, "with target:", targetId)
        return layerId === targetId
      })

      if (targetLayer && targetLayer.getBounds) {
        console.log("[v0] Found target layer, attempting to fit bounds")
        const bounds = targetLayer.getBounds()

        if (bounds && bounds.isValid && bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 18,
          })
          console.log("[v0] Successfully zoomed to parcel")
          return
        } else {
          console.log("[v0] Invalid bounds, trying fallback")
          const center = targetLayer.getLatLng ? targetLayer.getLatLng() : null
          if (center) {
            map.setView(center, 16)
            console.log("[v0] Used fallback center zoom")
            return
          }
        }
      }

      if (retryCount < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 5000)
        console.log("[v0] Layer not found, retrying in", delay, "ms")
        setTimeout(() => zoomToParcel(retryCount + 1, maxRetries), delay)
      } else {
        console.log("[v0] Max retries reached, zoom failed")
        if (geoJsonData && geoJsonData.features && geoJsonData.features.length > 0) {
          const allBounds = new L.LatLngBounds()
          geoJsonData.features.forEach((feature) => {
            if (feature.geometry && feature.geometry.coordinates) {
              const coords = feature.geometry.coordinates
              if (Array.isArray(coords) && coords.length > 0) {
                const flatCoords = coords.flat(3).filter((coord) => Array.isArray(coord) && coord.length >= 2)
                flatCoords.forEach((coord) => {
                  if (typeof coord[1] === "number" && typeof coord[0] === "number") {
                    allBounds.extend([coord[1], coord[0]])
                  }
                })
              }
            }
          })
          if (allBounds.isValid()) {
            map.fitBounds(allBounds, { padding: [50, 50] })
            console.log("[v0] Used fallback bounds for all features")
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error in zoomToParcel:", error)
      if (retryCount < maxRetries) {
        setTimeout(() => zoomToParcel(retryCount + 1, maxRetries), 1000)
      }
    }
  }

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    if (isMounted && isMapReady && geoJsonData && mapInstance && geoJsonLayer && parcelId) {
      console.log("[v0] All conditions met, starting zoom with parcel ID:", parcelId)
      setTimeout(() => zoomToParcel(), 1000)
    } else {
      console.log("[v0] Zoom conditions not met:", {
        isMounted,
        isMapReady,
        hasGeoJsonData: !!geoJsonData,
        hasMapInstance: !!mapInstance,
        hasGeoJsonLayer: !!geoJsonLayer,
        parcelId,
      })
    }
  }, [geoJsonData, parcelId, isMounted, isMapReady, mapInstance, geoJsonLayer])

  const handleMapReady = (mapInstance) => {
    console.log("[v0] Map instance received from MapController")
    setMapInstance(mapInstance)
    setIsMapReady(true)
  }

  if (!parcelId && !loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-muted-foreground text-5xl">🗺️</div>
          <h2 className="text-xl font-semibold text-foreground">No Parcel Selected</h2>
          <p className="text-muted-foreground">Please provide a valid parcel ID to view the map.</p>
          <Link href="/admin/map">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              View All Applications
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading parcel data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground">Error Loading Data</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen relative">
      <div className="absolute top-4 left-4 z-[1000]">
        <Link href="/admin/map">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg backdrop-blur-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            View All Applications
          </button>
        </Link>
      </div>

      <MapContainer center={[8.476, 4.556]} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapController
          onMapReady={handleMapReady}
          geoJsonData={geoJsonData}
          parcelId={parcelId}
          zoomToParcel={zoomToParcel}
        />
         <LayersControl position="topright">
                {/* Default Layer */}
                <BaseLayer checked name="Esri Satellite">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </BaseLayer>
        
                {/* Satellite Layer */}
                <BaseLayer name="Openstreetmap">
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                </BaseLayer>
        
                {/* Carto Light */}
                <BaseLayer name="Carto Light">
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                </BaseLayer>
        
                {/* Carto Dark */}
                <BaseLayer name="Carto Dark">
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                </BaseLayer>
              </LayersControl>
        <LeafletDrawTools />
        {geoJsonData && isMounted && (
          <GeoJSON
            key={`${JSON.stringify(geoJsonData)}-${parcelId}`}
            data={geoJsonData}
            style={defaultStyle}
            onEachFeature={onEachFeature}
            ref={(layer) => {
              if (layer) {
                console.log("[v0] GeoJSON layer created")
                setGeoJsonLayer(layer)
              }
            }}
          />
        )}
      </MapContainer>

      <ParcelModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} parcelData={selectedParcel} />
    </div>
  )
}

export default MapPage
