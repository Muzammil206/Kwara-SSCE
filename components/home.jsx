"use client"
import Link from "next/link"
import Image from "next/image"
import { Play, ArrowRight, CheckCircle, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import { useRef } from "react"
import AnimationWrapper from "@/components/animation-wrapper"
import StaggerItem from "@/components/stagger-item"
import ParallaxSection from "@/components/parallax-section"
import  About  from "@/components/about"

export default function Main() {

  return (
    <div> 
      <section
        className="relative mt-[-90px] px-4 overflow-hidden bg-
              md:py-24 lg:py-32   "
      >
        
        <div className="absolute inset-0 overflow-hidden  md:block">
          <ParallaxSection speed={0.2} direction="up">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-emerald-200/40 to-transparent rounded-full"></div>
          </ParallaxSection>
          <ParallaxSection speed={0.15} direction="down">
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-teal-200/30 to-transparent rounded-full"></div>
          </ParallaxSection>
          <ParallaxSection speed={0.25} direction="up">
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-green-200/20 to-transparent rounded-full"></div>
          </ParallaxSection>
          {/* Geometric patterns with parallax effect */}
          <ParallaxSection speed={0.1} direction="down">
            <svg
              className="absolute top-20 right-20 text-emerald-300/30 w-64 h-64"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M42.7,-73.4C55.9,-67.1,67.7,-57.2,75.9,-44.6C84.1,-32,88.7,-16,88.2,-0.3C87.7,15.5,82.1,30.9,73.5,44.1C64.9,57.2,53.3,68,39.8,75.3C26.3,82.6,10.9,86.3,-3.9,86.1C-18.7,85.9,-37.3,81.8,-51.6,72.4C-65.9,63,-75.8,48.3,-81.2,32.6C-86.6,16.9,-87.5,0.2,-83.2,-14.4C-78.9,-29,-69.5,-41.6,-57.8,-49.8C-46.1,-58,-32.1,-61.8,-19.2,-68.1C-6.3,-74.4,5.5,-83.2,18.5,-83.5C31.5,-83.8,45.8,-75.6,42.7,-73.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </ParallaxSection>
          <ParallaxSection speed={0.2} direction="up">
            <svg
              className="absolute bottom-10 left-1/3 text-teal-300/20 w-48 h-48"
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M47.7,-79.1C62.3,-71.9,75.1,-60.5,83.2,-46.1C91.3,-31.7,94.7,-14.3,92.9,2.1C91.1,18.5,84.1,34.1,74.3,47.4C64.5,60.7,51.9,71.8,37.5,77.7C23.1,83.6,6.9,84.3,-8.6,81.9C-24.1,79.5,-38.9,74,-51.5,65.1C-64.1,56.2,-74.5,43.9,-80.3,29.5C-86.1,15.1,-87.3,-1.4,-83.9,-16.5C-80.5,-31.6,-72.5,-45.3,-61.3,-55.9C-50.1,-66.5,-35.7,-74,-21.2,-77.7C-6.7,-81.4,8,-81.3,21.9,-79.1C35.8,-76.9,48.9,-72.5,47.7,-79.1Z"
                transform="translate(100 100)"
              />
            </svg>
          </ParallaxSection>
        </div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left column - Text content */}
            <div className="text-center pt-8 backdrop-blur-sm md:backdrop-blur-none">
              <AnimationWrapper variant="fadeInUp" duration={0.6}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-200/80 text-emerald-800 text-sm font-medium mb-6 backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  Association of Private Practising Surveyors of Nigeria
                </div>
              </AnimationWrapper>
              <AnimationWrapper variant="fadeInLeft" delay={0.2} duration={0.7}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 bg-clip-text text-transparent">
                    Welcome to APPSN
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-900 via-blue-800 to-teal-800 bg-clip-text text-transparent">
                    Kwara State Branch
                  </span>
                </h1>
              </AnimationWrapper>
              <AnimationWrapper variant="fadeInUp" delay={0.3} duration={0.7}>
                <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto md:mx-0">
                  The Association of Private Practicing Surveyors of Nigeria (APPSN) Kwara State is committed to
                  upholding professional surveying standards, streamlining land administration, and ensuring ethical
                  practices.
                  </p>
              </AnimationWrapper>
              <AnimationWrapper variant="fadeInUp" delay={0.4} duration={0.7}>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-8">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-teal-700 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-800 hover:to-teal-800 transition-all shadow-lg shadow-emerald-300/50"
                    >
                      Portal
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="#about"
                      className="flex items-center justify-center gap-2 text-emerald-800 px-6 py-3 rounded-lg border border-emerald-300 hover:bg-emerald-50 transition-colors backdrop-blur-sm bg-white/50"
                    >
                      <Play className="w-4 h-4 fill-emerald-700" />
                      About APPSN Kwara
                    </Link>
                  </motion.div>
                </div>
              </AnimationWrapper>
              <AnimationWrapper variant="fadeInUp" delay={0.5} duration={0.7}>
                <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600 items-center justify-center md:justify-start">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Professional Excellence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Ethical Practice</span>
                  </div>
                </div>
              </AnimationWrapper>
            </div>
            {/* Right column - Image/illustration (hidden on mobile for background image) */}
            <AnimationWrapper variant="fadeInRight" delay={0.3} duration={0.8}>
              <div className="relative hidden md:block">
                <div className="relative z-10 bg-gradient-to-br from-white/80 to-emerald-100/80 rounded-2xl shadow-xl overflow-hidden border border-emerald-200/50 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/50 to-transparent"></div>
                  <Image
                    src="/pexels.jpg"
                    width={600}
                    height={600}
                    alt="Nigerian Institution of Surveyors Kwara State"
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
                {/* Enhanced decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-tr from-emerald-400/40 to-teal-300/40 rounded-full blur-xl"></div>
                <div className="absolute -top-6 -left-6 w-40 h-40 bg-gradient-to-br from-teal-300/40 to-green-300/40 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-emerald-100/20 via-teal-100/20 to-blue-100/20 rounded-full blur-3xl"></div>
              </div>
            </AnimationWrapper>
          </div>
        </div>
        {/* Floating badges */}
        <AnimationWrapper variant="fadeInUp" delay={0.6} duration={0.7}>
          <div className="absolute bottom-12 left-12 hidden lg:block">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-emerald-100/50">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <a href="https://maps.app.goo.gl/Jr7cs4DZ1snUG2CQ7" target="_blank" rel="noopener noreferrer">
                <span className="text-sm font-medium">Ikoyi Avenue, New Yidi Rd, Ilorin</span>
              </a>
            </div>
          </div>
        </AnimationWrapper>
      </section>

      {/* Original Services section (now removed/replaced by the new one) */}
      {/* The original services section content was here. It has been replaced by the new, more detailed section above. */}

      {/* Additional animated section - Statistics */}
      <section className="py-16 bg-emerald-900 text-white relative overflow-hidden">
        <ParallaxSection speed={0.15} direction="up">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-800/50 rounded-full blur-3xl"></div>
        </ParallaxSection>
        <ParallaxSection speed={0.2} direction="down">
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-teal-800/50 rounded-full blur-3xl"></div>
        </ParallaxSection>
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <AnimationWrapper variant="fadeInUp" duration={0.7}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our History & Establishment</h2>
              <p className="text-emerald-100 max-w-2xl mx-auto">
                The Association of Private Practising Surveyors of Nigeria (APPSN) Kwara State Branch was established to
                promote professionalism and ethical standards in surveying practice.
              </p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper variant="staggered" staggerChildren={0.15}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "1934", label: "Year Established" },
                { value: "NIS", label: "Parent Organization" },
                { value: "Kwara", label: "State Chapter" },
                { value: "Monthly", label: "Third Tuesday Of Each Month " },
              ].map((stat, index) => (
                <StaggerItem key={index}>
                  <div className="text-center p-4 rounded-lg bg-emerald-800/50 backdrop-blur-sm border border-emerald-700/50">
                    <div className="text-3xl md:text-4xl font-bold mb-2 text-white">{stat.value}</div>
                    <div className="text-emerald-100 text-sm">{stat.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </AnimationWrapper>
        </div>
      </section>
      <About />
      {/* Testimonials section with scroll animations */}
      <section className="py-16 relative overflow-hidden bg-gradient-to-b from-white to-emerald-50">
        <div className="container mx-auto max-w-6xl px-4 relative z-10">
          <AnimationWrapper variant="fadeInUp" duration={0.7}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-800 mb-4">What Our Members Say</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Hear from our members about their experience with APPSN Kwara State Branch.
              </p>
            </div>
          </AnimationWrapper>
          <AnimationWrapper variant="staggered" staggerChildren={0.2}>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote:
                    "The digital platform has revolutionized how we process survey pillar applications. What used to take weeks now takes days.",
                  author: "Surv. Funsho-Salawu Ayodeji",
                  role: "Chairman, APPSN Kwara State Branch",
                },
                {
                  quote:
                    "APPSN Kwara has been instrumental in my professional development. The training programs are top-notch and relevant.",
                  author: "Surv (Alh.) S.K. Adebayo",
                  role: "vice Chairman, APPSN Kwara State Branch",
                },
              ].map((testimonial, index) => (
                <StaggerItem key={index}>
                  <div className="bg-white p-6 rounded-xl shadow-md border border-emerald-100">
                    <div className="text-emerald-600 text-4xl mb-4">"</div>
                    <p className="text-gray-700 mb-4 italic">{testimonial.quote}</p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                        {testimonial.author.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-emerald-800">{testimonial.author}</div>
                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </AnimationWrapper>
        </div>
      </section>
    </div>
  )
}
