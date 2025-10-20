"use client"

import { motion } from "framer-motion"

/**
 * SectionHeading component with animation
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {string} [props.subtitle] - Optional subtitle
 * @param {boolean} [props.centered=true] - Whether to center the text
 * @param {string} [props.className=""] - Additional CSS classes
 */
export default function SectionHeading({ title, subtitle, centered = true, className = "" }) {
  return (
    <div className={`${centered ? "text-center" : ""} ${className}`}>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-4 text-emerald-800"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-600 max-w-3xl mx-auto mb-16"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  )
}
