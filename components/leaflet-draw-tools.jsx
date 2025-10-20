"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-draw/dist/leaflet.draw.css"
import "leaflet-draw"

const LeafletDrawTools = () => {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    // Create feature group for drawn items
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    // Initialize draw control
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
      },
      draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: true,
        marker: true,
      },
    })

    map.addControl(drawControl)

    // Handle draw events
    const handleDrawCreated = (e) => {
      const layer = e.layer
      drawnItems.addLayer(layer)
    }

    map.on(L.Draw.Event.CREATED, handleDrawCreated)

    // Cleanup
    return () => {
      map.off(L.Draw.Event.CREATED, handleDrawCreated)
      map.removeControl(drawControl)
      map.removeLayer(drawnItems)
    }
  }, [map])

  return null
}

export default LeafletDrawTools
