'use client'

import { motion } from 'framer-motion'
import { Code2, Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Code2 className="w-16 h-16 text-chronos-green" />
          </motion.div>
        </div>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold glow-text mb-4"
        >
          Chronos
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-chronos-light-gray mb-8"
        >
          {message}
        </motion.p>
        
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-5 h-5 text-chronos-green animate-spin" />
          <div className="loading-dots">
            <div style={{ '--i': 0 } as React.CSSProperties}></div>
            <div style={{ '--i': 1 } as React.CSSProperties}></div>
            <div style={{ '--i': 2 } as React.CSSProperties}></div>
          </div>
        </div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-chronos-orange to-chronos-green rounded-full mx-auto mt-8"
        />
      </motion.div>
    </div>
  )
}
