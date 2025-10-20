"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Calculator, AlertCircle } from "lucide-react"
import Papa from "papaparse"
import { polygon, area } from "@turf/turf"
import proj4 from "proj4"
import {  MapPin, Home, MapIcon as City, Flag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/router"

import { supabase } from "@/lib/supabaseClient"
import calculateArea from "./calculateArea"


const Step2 = ({ csvFile, onCalculatedArea, nextStep, prevStep, onLocation, watch, onGeojson, onSchedule  }) => {


  const formData = {
   
    schedule: watch("schedule"),
  }
 
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationError, setCalculationError] = useState("")
  const [calculatedArea, setCalculatedArea] = useState(null)
  const [areaHa, setAreaHa] = useState(null)
  const [location, setLocation] = useState(null)
  const [userId, setUserid] = useState(null)
  const [polygonLayer, setPolygonLayer] = useState(null)
  const [geojsonData, setGeojsonData] = useState(null)
  const [lat, setLat] = useState(null)
  const [lon, setLon] = useState(null)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

 
  const utmZone = "+proj=utm +zone=31 +ellps=clrk80 +towgs84=-92,-93,122,0,0,0,0 +units=m +no_defs"
  const wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"

  useEffect(() => {
        
    const fetchUser = async () => { 
           


      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

     

      setUser(session.user)
      
      
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
      setUserid(userData.user_id)

      }

fetchUser();
}, []); 

  
  const saveGeoJSON = async (polygonLayer) => {
    
  
    if (!userId || !geojsonData) {
     
      return
    }
   
    // Check if user already has a temp_geojson entry
    const { data: existingData, error: fetchError } = await supabase
      .from("temp_geojson")
      .select("id")
      .eq("user_id", userId)
      .single();
  
    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking existing data:", fetchError);
      return;
    }
  
    if (existingData) {
      // Update existing GeoJSON
      const { error: updateError } = await supabase
        .from("temp_geojson")
        .update({ geojson: geojsonData })
        .eq("user_id", userId);
  
      if (updateError) console.error("Error updating GeoJSON:", updateError);
    } else {
      // Insert new GeoJSON
      const { error: insertError } = await supabase.from("temp_geojson").insert([
        {
          user_id: userId,
          geojson: polygonLayer,
        },
      ]);
  
      if (insertError) console.error("Error inserting GeoJSON:", insertError);
      console.log(userId)
    }
  };




  const handleSave = async () => {
    saveGeoJSON(polygonLayer)
    console.log("saveGeoJSON")
  }


  
  const checkZone = async (zoneData) => {
    const { data, error } = await supabase.rpc('get_zone_by_polygon', {
      geom_input: zoneData,
    });
    
    if (error) {
      console.error("Zoning match failed:");
    } else {
      const zone = data[0];
      console.log("Zoning match:", data[0]);
      
      onSchedule(zone)
   
    }
  
    return data;
  
    
  
  }
  
 

  


  useEffect(() => {
    const fetchLocation = async (lat, lon) => {
      if(!lat) return
      try {
        const response = await fetch(`/api/reverseGeocode?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (response.ok) {
          setLocation(data);
          onLocation(data)
          
        } else {
          setError(data.error || "Unknown error occurred");
        }
      } catch (err) {
        setError("Failed to fetch location");
      }
    };

    fetchLocation(lon,  lat);
  }, [lat, lon]);
 
  
useEffect(() => {
   
const calculateArea = () => {
    if (!csvFile) {
      setCalculationError("No file selected. Please upload a CSV file in Step 1.");
      return;
    }

    setIsCalculating(true);
    setCalculationError("");

    Papa.parse(csvFile, {
      header: true,
      complete: (result) => {
        if (!result.data || result.data.length === 0) {
          setCalculationError("CSV file is empty or incorrectly formatted.");
          setIsCalculating(false);
          return;
        }

        console.log(result.data[0]);
        
        // Convert UTM to WGS84 for GeoJSON (Keep this part as it is working fine)
        const wgs84Coordinates = result.data
          .map((row, index) => {
            const easting = Number(row["Easting"]);
            const northing = Number(row["Northing"]);
            if (isNaN(easting) || isNaN(northing)) {
              console.error(`Invalid numbers at row ${index}:`, row);
              return null;
            }
            return proj4(utmZone, wgs84, [easting, northing]);
          })
          .filter((coord) => coord !== null);

        if (wgs84Coordinates.length === 0) {
          setCalculationError("No valid coordinates found in the CSV file.");
          setIsCalculating(false);
          return;
        }

        wgs84Coordinates.push(wgs84Coordinates[0]);
        
        const geojsonPolygon = polygon([wgs84Coordinates]);
        setPolygonLayer(geojsonPolygon);
        setGeojsonData(geojsonPolygon);
        saveGeoJSON(geojsonPolygon);
        checkZone(geojsonPolygon.geometry)
        onGeojson(geojsonPolygon.geometry)
       
        // Extract a point to display on UI
        const cord = geojsonPolygon.geometry.coordinates[0][0];
        const [latitude, longitude] = cord;
        setLat(latitude);
        setLon(longitude);

        // Now calculate the area using UTM coordinates
        calculateUTMArea(result.data);

        setIsCalculating(false);
      },
      skipEmptyLines: true,
    });
};

    calculateArea();
    
  }, [csvFile, utmZone, wgs84]);



// New function to calculate area in UTM
const calculateUTMArea = (data) => {
    const utmCoordinates = data
      .map((row, index) => {
        const easting = Number(row["Easting"]);
        const northing = Number(row["Northing"]);
        if (isNaN(easting) || isNaN(northing)) {
          console.error(`Invalid UTM values at row ${index}:`, row);
          return null;
        }
        return [easting, northing];
      })
      .filter((coord) => coord !== null);
    
    if (utmCoordinates.length === 0) {
      setCalculationError("No valid UTM coordinates for area calculation.");
      return;
    }

    utmCoordinates.push(utmCoordinates[0]); // Close the polygon

    let area = 0;
    const n = utmCoordinates.length;
    for (let i = 0; i < n - 1; i++) {
      const x1 = utmCoordinates[i][0];
      const y1 = utmCoordinates[i][1];
      const x2 = utmCoordinates[i + 1][0];
      const y2 = utmCoordinates[i + 1][1];
      area += (x1 * y2 - x2 * y1);
    }
    
    const areaInSqMeters = Math.abs(area) / 2;
    setCalculatedArea(areaInSqMeters.toFixed(2));
    onCalculatedArea(areaInSqMeters.toFixed(2));
    setAreaHa((areaInSqMeters / 10000).toFixed(2))
};


//  calculateArea()


  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Step 2: Calculate Area</h2>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            File uploaded: <span className="font-medium">{csvFile ? csvFile.name : "No file"}</span>
          </p>
          {csvFile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={calculateArea}
              disabled={isCalculating}
              className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium
                ${isCalculating ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}
                transition-colors duration-200`}
            >
              <Calculator className="mr-2 h-5 w-5" />
              {isCalculating ? "Calculating..." : "Calculate Area"}
            </motion.button>
          )}
        </div>

        {calculationError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center text-red-500 bg-red-100 p-3 rounded-md"
          >
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{calculationError}</span>
          </motion.div>
        )}

        {calculatedArea && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="bg-green-100 p-4 rounded-md"
          >
            <p className="text-lg font-semibold text-gray-700">Calculated Area:</p>
            <p className="text-3xl font-bold text-green-600">{calculatedArea} m²</p>
            <span className="text-gray-500 text-sm font-medium">({areaHa} ha)</span>
          </motion.div>
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Address Details</h2>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="flex items-center space-x-3">
          <Home className="h-5 w-5 text-gray-400" />
          <span className="text-gray-700">
            {!location ? "Loading..." : `${location.address} `}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <City className="h-5 w-5 text-gray-400" />
          <span className="text-gray-700">
          {!location ? "Loading..." : ` ${location.local_government} `}
         {!location ? "Loading..." : ` ${location.state} `}
          {/* {!location.City ?  ' ': `, ${location.City} `} */}
          </span>
        </div>
       
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-blue-500">
            <MapPin className="h-5 w-5" />
            
            <button 
             disabled={!geojsonData}
             onClick={handleSave} >
            <Link legacyBehavior href='application/planMap' passHref className="text-sm hover:underline">
              <a target=" _blank" rel="noopener noreferrer">
              View on map
              </a>  
            </Link>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={prevStep}
          className="flex items-center px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={nextStep}
          disabled={!calculatedArea}
          className={`flex items-center px-4 py-2 rounded-md text-white font-medium
            ${calculatedArea ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"}
            transition-colors duration-200`}
        >
          Next
          <ArrowRight className="ml-2 h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

export default Step2

