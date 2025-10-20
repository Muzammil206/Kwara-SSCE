"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

const variants = {
  hidden: {
    opacity: 0,
    y: 0,
    x: 0,
    scale: 1,
  },
  fadeIn: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  fadeInUp: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  fadeInDown: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  fadeInLeft: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  fadeInRight: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  zoomIn: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  slideUp: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  slideInLeft: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
  slideInRight: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
  },
}

const getHiddenVariant = (variant) => {
  switch (variant) {
    case "fadeIn":
      return { opacity: 0 }
    case "fadeInUp":
      return { opacity: 0, y: 50 }
    case "fadeInDown":
      return { opacity: 0, y: -50 }
    case "fadeInLeft":
      return { opacity: 0, x: -50 }
    case "fadeInRight":
      return { opacity: 0, x: 50 }
    case "zoomIn":
      return { opacity: 0, scale: 0.9 }
    case "slideUp":
      return { opacity: 0, y: 100 }
    case "slideInLeft":
      return { opacity: 0, x: -100 }
    case "slideInRight":
      return { opacity: 0, x: 100 }
    case "staggered":
      return { opacity: 0, y: 20 }
    default:
      return { opacity: 0 }
  }
}

/**
 * AnimationWrapper component for scroll-triggered animations
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements to animate
 * @param {string} [props.variant="fadeIn"] - Animation variant to use
 * @param {number} [props.delay=0] - Delay before animation starts (in seconds)
 * @param {number} [props.duration=0.5] - Duration of animation (in seconds)
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {number} [props.threshold=0.2] - Visibility threshold to trigger animation
 * @param {boolean} [props.once=true] - Whether to only trigger animation once
 * @param {number} [props.staggerChildren=0.1] - Delay between staggered children
 * @param {number} [props.staggerDelay=0] - Initial delay before staggered animations
 */
export default function AnimationWrapper({
  children,
  variant = "fadeIn",
  delay = 0,
  duration = 0.5,
  className = "",
  threshold = 0.2,
  once = true,
  staggerChildren = 0.1,
  staggerDelay = 0,
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { amount: threshold, once })

  const hiddenVariant = getHiddenVariant(variant)

  if (variant === "staggered") {
    return (
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren,
              delayChildren: staggerDelay,
            },
          },
        }}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? variant : "hidden"}
      variants={{
        hidden: hiddenVariant,
        [variant]: variants[variant],
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
