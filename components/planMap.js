"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/lib/supabaseClient";
import Loading from '@/components/Loading';
import { toast } from "sonner";

const PlanMap = () => {
  const [userId, setUserId] = useState(null);
  const [geojsonData, setGeojsonData] = useState(null);
  const [zoningData, setZoningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [user, setUser] = useState(null);
  
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const legendRef = useRef();

  // Fetch user ID from localStorage
  useEffect(() => {
    // const user = localStorage.getItem("user_id");
    // if (user) setUserId(user);
    const fetchUser = async () => { 
           
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        router.push("/newlogin")
        return
      }

      setUser(session.user)
      console.log("User:", session.user)
      
      // Get user data from users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq(' auth_user_id', session.user.id)
        .single()

      if (userError) {
        console.error("User error:", userError)
        toast.error("Failed to load user information")
        return
      }
      setUserId(userData.user_id)

      }

   fetchUser();

  }, []);

  // Fetch GeoJSON and zoning data
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [geojsonResponse, zoningResponse] = await Promise.all([
          supabase
            .from("temp_geojson")
            .select("geojson")
            .eq("user_id", userId)
            .single(),
          supabase.rpc('get_zoning_kwara_geojson')
        ]);

        if (geojsonResponse.error) {
          throw new Error(`GeoJSON fetch failed: ${geojsonResponse.error.message}`);
        }

        if (zoningResponse.error) {
          throw new Error(`Zoning data fetch failed: ${zoningResponse.error.message}`);
        }

        if (geojsonResponse.data?.geojson) {
          setGeojsonData(geojsonResponse.data.geojson);
        } else {
          toast.error("No plan found", {
            description: "Upload your plan on the application page.",
          });
        }

        setZoningData(zoningResponse.data);
      } catch (err) {
        console.error("Data fetch error:", err);
        toast.error("Failed to load data", {
          description: err.message,
        });
        setMapError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Initialize map and layers
  useEffect(() => {
    if (!geojsonData || !zoningData || mapError) return;

    const initializeMap = () => {
      if (!process.env.NEXT_PUBLIC_MAPBOX_API_KEY) {
        throw new Error("Mapbox API key is missing.");
      }

      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [4.5684763509, 8.484134650949752],
        zoom: 6,
      });

      mapRef.current = map;

      map.on("load", () => {
        addUserLayers(map, geojsonData);
       
        fitMapToBounds(map, geojsonData);
        addMapControls(map);
        
      });

      return () => map.remove();
    };

    try {
      initializeMap();
    } catch (err) {
      console.error("Map initialization error:", err);
      setMapError(err.message);
    }
  }, [geojsonData, zoningData, mapError]);

  // Helper: Add user GeoJSON layers
  const addUserLayers = (map, data) => {
    map.addSource("user-geojson-source", {
      type: "geojson",
      data,
    });

    map.addLayer({
      id: "user-geojson-layer",
      type: "fill",
      source: "user-geojson-source",
      paint: {
        "fill-color": "#088",
        "fill-opacity": 0.4,
      },
    });

    map.addLayer({
      id: 'user-outline',
      type: 'line',
      source: 'user-geojson-source',
      paint: {
        'line-color': '#FF0000',
        'line-width': 3,
      },
    });
  };

  // Helper: Add zoning layers and labels
  const addZoningLayers = (map, data) => {
    map.addSource("zoning-source", {
      type: "geojson",
      data,
    });

    map.addLayer({
      id: "zoning-layer",
      type: "fill",
      source: "zoning-source",
      paint: {
        "fill-color": [
          'match',
          ['get', 'schedule'],
          'SCHEDULE A', '#4CAF50',
          'SCHEDULE B', '#FFC107',
          'SCHEDULE C', '#F44336',
          'SCHEDULE D', '#8BC34A',
          '#9E9E9E'
        ],
        "fill-opacity": 0.2,
      },
    });

    map.addLayer({
      id: 'zoning-outline',
      type: 'line',
      source: 'zoning-source',
      paint: {
        'line-color': '#000',
        'line-width': 1,
      },
    });

    map.addLayer({
      id: 'zoning-labels',
      type: 'symbol',
      source: 'zoning-source',
      layout: {
        'text-field': ['get', 'schedule'],
        'text-size': 12,
        'text-transform': 'uppercase',
      },
      paint: {
        'text-color': '#000',
        'text-halo-color': '#fff',
        'text-halo-width': 1,
      },
    });
  };

  // Helper: Fit map to user polygon bounds
  const fitMapToBounds = (map, data) => {
    const bounds = new mapboxgl.LngLatBounds();
    data.geometry.coordinates[0].forEach((coord) => bounds.extend(coord));
    map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
  };

  // Helper: Add map controls
  const addMapControls = (map) => {
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  };

  // Helper: Create dynamic legend
  // const createLegend = (map) => {
  //   if (legendRef.current) return;

  //   const legend = document.createElement('div');
  //   legend.className = 'map-legend';
  //   legend.innerHTML = `
  //     <h4>Zoning Legend</h4>
  //     <div><span style="background-color:#4CAF50"></span>SCHEDULE A</div>
  //     <div><span style="background-color:#FFC107"></span>SCHEDULE B</div>
  //     <div><span style="background-color:#F44336"></span>SCHEDULE C</div>
  //     <div><span style="background-color:#8BC34A"></span>SCHEDULE D</div>
  //   `;
    
  //   Object.assign(legend.style, {
  //     position: 'absolute',
  //     bottom: '30px',
  //     right: '10px',
  //     backgroundColor: 'rgba(255, 255, 255, 0.9)',
  //     padding: '10px',
  //     borderRadius: '3px',
  //     boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  //     zIndex: '1',
  //     fontSize: '12px',
  //   });

  //   map.getContainer().appendChild(legend);
  //   legendRef.current = legend;
  // };

  if (loading) return <Loading />;
  if (mapError) return <div className="error-message">{mapError}</div>;

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: "100%", height: "100vh" }} 
      aria-label="Interactive map"
    />
  );
};

export default PlanMap;