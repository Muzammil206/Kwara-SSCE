"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navi() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll events - simplified
  useEffect(() => {
    const handleScroll = () => {
      // Change navbar appearance after scrolling down 20px
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Animation variants for mobile menu
  const menuVariants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
  }

  // Animation variants for mobile menu items
  const menuItemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    closed: {
      y: 20,
      opacity: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="sticky top-0 left-0 right-0 z-50">
      <div
        className={`w-full ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-md py-2" : "bg-white py-4 shadow-sm"
        } transition-all duration-300`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div whileHover={{ rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}>
                <Image src="/appsn1.png" alt="appsn Logo" width={32} height={32} className="w-8 h-8" />
              </motion.div>
              <span className={`font-semibold ${scrolled ? "text-emerald-800" : ""} transition-colors duration-300`}>
                APPSN KWARA
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                onClick={toggleMenu}
                className="focus:outline-none focus:ring-2 focus:ring-emerald-500 p-1 rounded-md"
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6 text-emerald-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                )}
              </motion.button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard"
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors"
                >
                  Portal
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="#contact" className="hover:text-emerald-700 transition-colors">
                  Contact Us
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="#about" className="hover:text-emerald-700 transition-colors">
                  About
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/members"
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors"
                >
                  Find Our Members
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu with AnimatePresence for proper exit animations */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-white/95 backdrop-blur-sm py-2 px-4 overflow-hidden border-t border-gray-100"
          >
            <div className="flex flex-col items-center space-y-4 py-2">
              <motion.div variants={menuItemVariants} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/dashboard"
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors block text-center w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Portal
                </Link>
              </motion.div>

              <motion.div variants={menuItemVariants}>
                <Link
                  href="#about"
                  className="hover:text-emerald-700 transition-colors block text-center w-full py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </motion.div>

              <motion.div variants={menuItemVariants}>
                <Link
                  href="#contact"
                  className="hover:text-emerald-700 transition-colors block text-center w-full py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact Us
                </Link>
              </motion.div>

              <motion.div variants={menuItemVariants} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/members"
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors block text-center w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Find Our Members
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
