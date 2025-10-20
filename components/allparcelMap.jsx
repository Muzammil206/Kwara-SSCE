"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl } from "react-leaflet"
import LeafletDrawTools from "@/components/leaflet-draw-tools"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Link } from "lucide-react"
import dynamic from "next/dynamic";


const { BaseLayer } = LayersControl;

const MapController = ({ selectedParcel, onMapReady }) => {
  const map = useMap()

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map)
    }
  }, [map, onMapReady])

  useEffect(() => {
    if (selectedParcel && selectedParcel.geometry && map) {
      const geoJsonLayer = L.geoJSON(selectedParcel)
      const bounds = geoJsonLayer.getBounds()
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }
  }, [selectedParcel, map])

  return null
}

// Modal component for parcel details
const ParcelModal = ({ isOpen, onClose, parcelData }) => {
  if (!isOpen || !parcelData) return null

  const getStatusBadge = (status) => {
    const isApproved = status?.toLowerCase() === "approved"
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {status || "Pending"}
      </span>
    )
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
                <span className="text-sm font-medium text-muted-foreground">SURCON:</span>
                <span className="text-sm text-foreground font-medium">{parcelData.status || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-muted-foreground">APPSN Status:</span>
                <span >
                  {parcelData.payment_status || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {/* <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
         <Link href={`/admin/map`} passHref>
         
         view all application on map</Link>
        </div> */}

        <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Sidebar component
const ParcelSidebar = ({ parcels, onParcelSelect, selectedParcel }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredParcels, setFilteredParcels] = useState(parcels)

  useEffect(() => {
    const filtered = parcels.filter((parcel) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        parcel.properties.plan_number?.toLowerCase().includes(searchLower) ||
        parcel.properties.surveyor_name?.toLowerCase().includes(searchLower) ||
        parcel.properties.status?.toLowerCase().includes(searchLower)
      )
    })
    setFilteredParcels(filtered)
  }, [searchTerm, parcels])

  const getStatusBadge = (status) => {
    const isApproved = status?.toLowerCase() === "approved"
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {status || "Pending"}
      </span>
    )
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Parcels</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search parcels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {filteredParcels.map((parcel, index) => (
            <div
              key={index}
              onClick={() => onParcelSelect(parcel)}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedParcel?.properties?.plan_number === parcel.properties?.plan_number
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 text-sm">
                  {parcel.properties.plan_number || "No Plan Number"}
                </h3>
                {getStatusBadge(parcel.properties.status)}
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  <span className="font-medium">Surveyor:</span> {parcel.properties.surveyor_name || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Area:</span> {parcel.properties.area || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const AllParcelsMap = () => {
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [parcels, setParcels] = useState([])
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/getGeojson")
        const data = await response.json()
        setGeoJsonData(data)
        setParcels(data.features || [])
        console.log("GeoJSON data:", data)
        console.log("Parcels:", data.features )
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error)
      }
    }

    fetchData()
  }, [])

  const handleParcelSelect = (parcel) => {
    setSelectedParcel(parcel)
  }

  const onEachFeature = (feature, layer) => {
    layer.on("click", () => {
      setSelectedParcel(feature)
      setIsModalOpen(true)
    })
  }

  const geoJsonStyle = (feature) => ({
    fillColor: selectedParcel?.properties?.plan_number === feature.properties?.plan_number ? "#3B82F6" : "#10B981",
    weight: 2,
    opacity: 1,
    color: selectedParcel?.properties?.plan_number === feature.properties?.plan_number ? "#1D4ED8" : "#059669",
    dashArray: "",
    fillOpacity: 0.7,
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <ParcelSidebar parcels={parcels} onParcelSelect={handleParcelSelect} selectedParcel={selectedParcel} />
      <div className="flex-1 relative">
        <MapContainer center={[9.082, 8.6753]} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <LayersControl position="topright">
        {/* Default Layer */}
        <BaseLayer checked name="Esri Satellite">
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                </BaseLayer>

        {/* Satellite Layer */}
       <BaseLayer checked name="OpenStreetMap">
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
          <MapController selectedParcel={selectedParcel} onMapReady={setMapInstance} />
          {geoJsonData && (
            <GeoJSON
              key={`${JSON.stringify(geoJsonData)}-${selectedParcel?.properties?.plan_number || "none"}`}
              data={geoJsonData}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>

      <ParcelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
        parcelData={selectedParcel?.properties}
      />
    </div>
  )
}

export default AllParcelsMap
