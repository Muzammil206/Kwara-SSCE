"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

/**
 * ParallaxSection component for creating parallax scrolling effects
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {number} [props.speed=0.2] - Parallax speed factor
 * @param {string} [props.direction="up"] - Direction of parallax effect ("up" or "down")
 */
export default function ParallaxSection({ children, className = "", speed = 0.2, direction = "up" }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const factor = direction === "up" ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed * factor])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
