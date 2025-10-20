"use client"

import { motion } from "framer-motion"

/**
 * StaggerItem component for use within staggered animations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {number} [props.delay=0] - Additional delay for this item
 * @param {number} [props.duration=0.5] - Duration of animation
 */
export default function StaggerItem({ children, className = "", delay = 0, duration = 0.5 }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
