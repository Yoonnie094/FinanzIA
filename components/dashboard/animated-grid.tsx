'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function AnimatedGrid({ children, className }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {Array.isArray(children) ? children.map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      )) : children}
    </motion.div>
  )
}
