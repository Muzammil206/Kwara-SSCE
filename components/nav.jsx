"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function Nav( { userId } ) {

  
  return (
    <motion.header
      className="relative border-b bg-white/70 backdrop-blur-sm"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-8">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/" className="flex flex-wrap items-center space-x-2 sm:space-x-3">
              <Image src="/nis.png" alt="Logo" width={32} height={32} className="w-6 h-6 sm:w-8 sm:h-8" />
              <motion.span
                className="font-semibold text-gray-500 text-sm sm:text-lg leading-tight sm:leading-normal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Kwara Surveyor portal
              </motion.span>
            </Link>
            </motion.div>
            <nav className="hidden md:flex items-center space-x-8">
              {["features", "process", "about"].map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link href={`#${item}`} className="text-sm text-gray-500 hover:text-gray-900">
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
              { userId ? ( <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                Home
              </Link> ) : ( <Link href="/auth" className="text-sm text-gray-500 hover:text-gray-900"> sigin in
              </Link> )}
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/dashboard" className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800">
                Dashboard
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

