"use client"

import Image from "next/image"
import { useEffect, useRef, useMemo, memo, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"
import AnimationWrapper from "@/components/animation-wrapper"
import StaggerItem from "@/components/stagger-item"
import ParallaxSection from "@/components/parallax-section"

// Memoized leader card component for better performance
const LeaderCard = memo(({ leader, index, isVisible }) => (
  <div
    className={`min-w-[220px] text-center transform transition-all duration-1000 ease-out ${
      isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-16"
    }`}
    style={{
      transitionDelay: `${index * 120}ms`,
      willChange: "transform, opacity",
    }}
  >
    <div className="group relative mx-auto w-36 h-36 mb-5 rounded-full overflow-hidden border-4 border-emerald-100 shadow-lg hover:border-emerald-300 transition-all duration-500">
      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
      <Image
        src="/placeholder.svg?height=300&width=300"
        alt={leader.name}
        width={300}
        height={300}
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        loading={index < 2 ? "eager" : "lazy"}
      />
    </div>
    <h4 className="text-lg font-semibold text-emerald-700 mb-1">{leader.name}</h4>
    <p className="text-gray-600 text-sm bg-emerald-50 inline-block px-3 py-1 rounded-full">{leader.position}</p>
  </div>
))

LeaderCard.displayName = "LeaderCard"

export default function About() {
  const leadershipRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const autoScrollTimerRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [autoScrollDirection, setAutoScrollDirection] = useState("right")

  // Memoize the leadership data since it doesn't change
  const leadership = useMemo(
    () => [
      {
        name: "Surv. Funsho-Salawu Ayodeji",
        position: "Chairman",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv (Alh.) S.K. Adebayo",
        position: "Vice Chairman",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv. Samuel O. Muyiwa",
        position: "Secretary",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv. (Mrs.) A.M. Gobir",
        position: "Treasurer",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv. Abdulraheem G. Abdulfatai",
        position: "Assistant Secretary",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv. (Dcn.) Francis Bodunde",
        position: "Internal Auditor",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv. (Mrs.) B.E Ayoola",
        position: "Publicity Secretary",
        image: "/placeholder.svg?height=300&width=300",
      },
      {
        name: "Surv. J.O. Opaleye",
        position: "Ex-Officio (Immediate Past Chairman)",
        image: "/placeholder.svg?height=300&width=300",
      },
    ],
    [],
  )

  // Throttle function to limit how often a function can be called
  const throttle = (callback, delay) => {
    let lastCall = 0
    return (...args) => {
      const now = new Date().getTime()
      if (now - lastCall < delay) {
        return
      }
      lastCall = now
      return callback(...args)
    }
  }

  // Custom smooth scroll function
  const smoothScrollTo = useCallback((element, to, duration) => {
    const start = element.scrollLeft
    const change = to - start
    const startTime = performance.now()

    const animateScroll = (currentTime) => {
      const elapsedTime = currentTime - startTime
      if (elapsedTime > duration) {
        element.scrollLeft = to
        return
      }

      // Easing function: easeInOutCubic for smoother motion
      const progress = elapsedTime / duration
      const easeProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

      element.scrollLeft = start + change * easeProgress
      requestAnimationFrame(animateScroll)
    }

    requestAnimationFrame(animateScroll)
  }, [])

  // Handle scroll buttons with smoother animation
  const scroll = useCallback(
    (direction) => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const scrollAmount = 400 // Larger scroll amount for smoother movement
        const duration = 800 // Longer duration for smoother animation

        if (direction === "left") {
          smoothScrollTo(container, container.scrollLeft - scrollAmount, duration)
        } else {
          smoothScrollTo(container, container.scrollLeft + scrollAmount, duration)
        }
      }
    },
    [smoothScrollTo],
  )

  // Auto-scroll function
  const startAutoScroll = useCallback(() => {
    if (!isAutoScrolling || isHovering) return

    clearTimeout(autoScrollTimerRef.current)

    autoScrollTimerRef.current = setTimeout(() => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current

        // Check if we need to change direction
        if (autoScrollDirection === "right" && scrollPosition >= maxScroll - 20) {
          setAutoScrollDirection("left")
        } else if (autoScrollDirection === "left" && scrollPosition <= 20) {
          setAutoScrollDirection("right")
        }

        // Scroll in the current direction
        scroll(autoScrollDirection)

        // Continue auto-scrolling
        startAutoScroll()
      }
    }, 3000) // Scroll every 3 seconds
  }, [isAutoScrolling, isHovering, scroll, autoScrollDirection, scrollPosition, maxScroll])

  // Toggle auto-scrolling
  const toggleAutoScroll = useCallback(() => {
    setIsAutoScrolling((prev) => !prev)
  }, [])

  // Update scroll position for button visibility - throttled for performance
  const handleScroll = throttle(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      setScrollPosition(container.scrollLeft)
      setMaxScroll(container.scrollWidth - container.clientWidth)
    }
  }, 100)

  // Handle mouse enter/leave for the carousel
  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => setIsHovering(false)

  useEffect(() => {
    // Use IntersectionObserver to detect when leadership section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Slight delay before starting animations for better effect
            setTimeout(() => {
              setIsVisible(true)
            }, 300)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15, // Increased threshold for better timing
        rootMargin: "0px 0px -40px 0px",
      },
    )

    if (leadershipRef.current) {
      observer.observe(leadershipRef.current)
    }

    // Calculate max scroll width on mount and resize
    const handleResize = throttle(() => {
      if (scrollContainerRef.current) {
        setMaxScroll(scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth)
      }
    }, 200)

    // Set up scroll event listener
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
      handleScroll() // Initial calculation
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Initial calculation

    return () => {
      if (leadershipRef.current) {
        observer.unobserve(leadershipRef.current)
      }
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
      window.removeEventListener("resize", handleResize)
      clearTimeout(autoScrollTimerRef.current)
    }
  }, [])

  // Effect to handle auto-scrolling
  useEffect(() => {
    if (isVisible) {
      startAutoScroll()
    }

    return () => {
      clearTimeout(autoScrollTimerRef.current)
    }
  }, [isVisible, isAutoScrolling, isHovering, startAutoScroll, autoScrollDirection])

  // Memoize the core values to prevent unnecessary re-renders
  const coreValues = useMemo(() => ["Integrity", "Excellence", "Innovation", "Collaboration"], [])

  return (
    <section id="about" className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-emerald-50/50" />

      {/* Background decorative elements with parallax */}
      <ParallaxSection speed={0.1} direction="up">
        <div className="absolute top-40 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl" />
      </ParallaxSection>
      <ParallaxSection speed={0.15} direction="down">
        <div className="absolute bottom-40 left-0 w-80 h-80 bg-teal-100/30 rounded-full blur-3xl" />
      </ParallaxSection>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-6xl mx-auto">
          <AnimationWrapper variant="fadeInUp" duration={0.7}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-emerald-800">About APPSN Kwara</h2>
              <div className="h-1 w-20 bg-emerald-500 mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto">
                The Association of Private Practising Surveyors of Nigeria (APPSN) Kwara State Branch is dedicated to
                upholding the highest standards in surveying practices across the state.
              </p>
            </div>
          </AnimationWrapper>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimationWrapper variant="fadeInLeft" delay={0.2} duration={0.8}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl blur-xl opacity-50" />
                <div className="relative rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src="/kwara.png?height=600&width=800"
                    width={800}
                    height={600}
                    alt="APPSN Kwara Team"
                    className="w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </AnimationWrapper>

            <AnimationWrapper variant="fadeInRight" delay={0.3} duration={0.8}>
              <div className="space-y-6">
                <AnimationWrapper variant="staggered" staggerChildren={0.15}>
                  <div>
                    <StaggerItem>
                      <h3 className="text-xl font-semibold mb-2 text-emerald-700">Our Mission</h3>
                      <p className="text-gray-600">
                        To promote excellence in surveying practice through professional development, technological
                        innovation, and ethical standards that serve the public interest and advance the surveying
                        profession in Kwara State.
                      </p>
                    </StaggerItem>
                  </div>

                  <div>
                    <StaggerItem delay={0.1}>
                      <h3 className="text-xl font-semibold mb-2 text-emerald-700">Our Vision</h3>
                      <p className="text-gray-600">
                        To be the leading authority in surveying practices, setting benchmarks for quality, innovation,
                        and professional integrity in land management and geospatial services across Nigeria.
                      </p>
                    </StaggerItem>
                  </div>

                  <div>
                    <StaggerItem delay={0.2}>
                      <h3 className="text-xl font-semibold mb-2 text-emerald-700">Our History</h3>
                      <p className="text-gray-600">
                        Established as a subgroup of the Nigerian Institution of Surveyors (NIS), APPSN Kwara has been
                        serving the state for over two decades, bringing together private practitioners to enhance the
                        quality of surveying services and advocate for the profession.
                      </p>
                    </StaggerItem>
                  </div>

                  <div className="pt-4">
                    <StaggerItem delay={0.3}>
                      <h3 className="text-xl font-semibold mb-4 text-emerald-700">Core Values</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {coreValues.map((value, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex-shrink-0"></div>
                            <span className="text-gray-700">{value}</span>
                          </div>
                        ))}
                      </div>
                    </StaggerItem>
                  </div>
                </AnimationWrapper>
              </div>
            </AnimationWrapper>
          </div>

          <div className="mt-24 relative" ref={leadershipRef}>
            <AnimationWrapper variant="fadeInUp" duration={0.7}>
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold mb-3 text-emerald-800">Our Leadership</h3>
                <div className="h-1 w-16 bg-emerald-500 mx-auto mb-4"></div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Meet the dedicated professionals who lead our association and uphold the highest standards in
                  surveying practices.
                </p>
              </div>
            </AnimationWrapper>

            {/* Scroll buttons and auto-scroll toggle */}
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button
                onClick={() => scroll("left")}
                className={`absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all duration-300 hover:scale-110 ${
                  scrollPosition <= 10 ? "opacity-40 cursor-not-allowed" : "opacity-90"
                }`}
                disabled={scrollPosition <= 10}
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-emerald-700" />
              </button>

              <button
                onClick={() => scroll("right")}
                className={`absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2.5 shadow-lg transition-all duration-300 hover:scale-110 ${
                  scrollPosition >= maxScroll - 10 ? "opacity-40 cursor-not-allowed" : "opacity-90"
                }`}
                disabled={scrollPosition >= maxScroll - 10}
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-emerald-700" />
              </button>

              {/* Auto-scroll toggle button */}
              <button
                onClick={toggleAutoScroll}
                className="absolute -top-12 right-0 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-300 hover:scale-110"
                aria-label={isAutoScrolling ? "Pause auto-scroll" : "Start auto-scroll"}
              >
                {isAutoScrolling ? (
                  <Pause className="h-4 w-4 text-emerald-700" />
                ) : (
                  <Play className="h-4 w-4 text-emerald-700" />
                )}
              </button>

              {/* Scrollable container */}
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                style={{
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
                onScroll={handleScroll}
              >
                <div className="flex gap-8 px-12">
                  {leadership.map((leader, index) => (
                    <div key={index} className="snap-start">
                      <LeaderCard leader={leader} index={index} isVisible={isVisible} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll indicator dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: Math.ceil(leadership.length / 3) }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    scrollPosition >= (index * maxScroll) / (Math.ceil(leadership.length / 3) - 1) - 50 &&
                    scrollPosition <= (index * maxScroll) / (Math.ceil(leadership.length / 3) - 1) + 50
                      ? "bg-emerald-500 w-8"
                      : "bg-emerald-200 w-2"
                  }`}
                  onClick={() => {
                    if (scrollContainerRef.current) {
                      const scrollTo = (index * maxScroll) / (Math.ceil(leadership.length / 3) - 1)
                      smoothScrollTo(scrollContainerRef.current, scrollTo, 800)
                    }
                  }}
                  aria-label={`Scroll to section ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
