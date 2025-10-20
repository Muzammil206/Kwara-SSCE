"use client"
import Link from "next/link"
import Image from "next/image"
import { Play, ArrowRight, CheckCircle, MapPin, Building, Route, Waves, Globe, Scan, Phone, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { useRef } from "react"
import AnimationWrapper from "@/components/animation-wrapper"
import StaggerItem from "@/components/stagger-item"
import ParallaxSection from "@/components/parallax-section"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"



export default function Process() {

  const servicesData = [
    {
      title: "Cadastral Surveys",
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      description:
        "Precise boundary surveys for land parcels, essential for property ownership, development, and legal documentation.",
      applications: [
        "Land subdivision and development",
        "Property boundary disputes",
        "Easement and right-of-way determination",
        "Land title and registration",
      ],
      technicalDetails:
        "Utilizing GNSS, Total Stations, and advanced CAD software for accurate boundary delineation. Deliverables include cadastral maps, legal descriptions, and survey reports.",
    },
    {
      title: "Topographic Surveys",
      icon: <MapPin className="w-6 h-6 text-emerald-600" />,
      description:
        "Detailed mapping of land features, essential for planning and design in construction, urban development, and environmental management.",
      applications: [
        "Site analysis for construction projects",
        "Land use planning and zoning",
        "Environmental impact assessments",
        "Flood risk analysis and mitigation planning",
      ],
      technicalDetails:
        "Utilizing GNSS, Total Stations, and UAVs for accurate data collection. Deliverables include contour maps, digital terrain models (DTMs), and 3D visualizations.",
    },
    {
      title: "Engineering Surveys",
      icon: <Building className="w-6 h-6 text-emerald-600" />,
      description:
        "Precise surveys for all stages of engineering projects, from planning and design to construction and monitoring.",
      applications: [
        "Infrastructure development (roads, bridges, pipelines)",
        "Building construction and site layout",
        "Volume calculations for earthworks",
        "As-built surveys",
      ],
      technicalDetails:
        "Utilizing Total Stations, GNSS, and Laser Scanners for high-accuracy data collection. Deliverables include topographic maps, site plans, and 3D models.",
    },
    {
      title: "Route Surveys",
      icon: <Route className="w-6 h-6 text-emerald-600" />,
      description:
        "Specialized surveys for linear projects, ensuring optimal alignment and design for transportation and utility corridors.",
      applications: [
        "Road and railway design and construction",
        "Pipeline and transmission line routing",
        "Utility corridor mapping",
        "Easement and right-of-way determination",
      ],
      technicalDetails:
        "Detailed topographic and cadastral surveys along proposed routes. Includes cross-sectioning, long-sectioning, and volume computations. Data processed with specialized CAD software.",
    },
    {
      title: "Deformation Survey and Analysis",
      icon: <Scan className="w-6 h-6 text-emerald-600" />,
      description:
        "Monitoring and analyzing structural movements and ground deformation to ensure safety and stability of critical assets.",
      applications: [
        "Dam and bridge monitoring",
        "High-rise building stability assessment",
        "Landslide and ground subsidence monitoring",
        "Mining and excavation impact assessment",
      ],
      technicalDetails:
        "High-precision geodetic measurements using robotic total stations, precise leveling, and GNSS. Data analyzed using statistical methods and specialized deformation monitoring software to detect subtle movements.",
    },
    {
      title: "GIS Services",
      icon: <Globe className="w-6 h-6 text-emerald-600" />,
      description:
        "Comprehensive Geographic Information System solutions for data management, analysis, and visualization.",
      applications: [
        "Urban planning and land use mapping",
        "Environmental impact assessment",
        "Asset management and utility mapping",
        "Spatial analysis for decision-making",
      ],
      technicalDetails:
        "Data acquisition, georeferencing, spatial analysis, and custom map production. Expertise in ArcGIS, QGIS, and other leading GIS platforms. Integration of various data sources (satellite imagery, drone data, survey data).",
    },
    {
      title: "Hydrographic Surveys",
      icon: <Waves className="w-6 h-6 text-emerald-600" />,
      description:
        "Mapping and charting of underwater topography, essential for navigation, construction, and environmental studies.",
      applications: [
        "Nautical charting and navigation safety",
        "Dredging operations and volume calculations",
        "Port and harbor development",
        "Submarine pipeline and cable routing",
        "Environmental seabed mapping",
      ],
      technicalDetails:
        "Utilizing single-beam and multi-beam echo sounders, side-scan sonar, and precise GNSS positioning. Data processed to produce bathymetric charts, seabed classification maps, and 3D models of underwater features.",
    },
  ]

  return (
    <section id="services" className="py-16 px-4 bg-white md:py-24">
    <div className="container mx-auto max-w-4xl">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-emerald-800 mb-4">
          Our Comprehensive Surveying Services
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          We offer a wide array of surveying services tailored to meet the diverse needs  across
          various industries. Click on a service to learn more.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {servicesData.map((service, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border-b border-emerald-200">
            <AccordionTrigger className="flex items-center gap-4 py-4 text-lg font-semibold text-emerald-800 hover:no-underline data-[state=open]:text-emerald-700">
              {service.icon} {service.title}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-gray-700 space-y-4">
              <p>{service.description}</p>
              <div>
                <h3 className="text-md font-semibold text-emerald-700 mb-2">Applications:</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {service.applications.map((app, i) => (
                    <li key={i}>{app}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-md font-semibold text-emerald-700 mb-2">Technical Details:</h3>
                <p className="text-gray-600 text-sm">{service.technicalDetails}</p>
              </div>
              <Button
                variant="outline"
                className="mt-4 text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-transparent"
              >
                Learn More <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>

  )
}
