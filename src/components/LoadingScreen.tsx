'use client'

import { motion } from 'framer-motion'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-chronos-green border-t-transparent rounded-full mx-auto mb-6 sm:mb-8"
        />
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold glow-text mb-3 sm:mb-4"
        >
          Chronos
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl text-chronos-light-gray mb-6 sm:mb-8"
        >
          {message}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-chronos-light-gray"
        >
          <p>Fetching your GitHub data...</p>
          <p className="mt-2">This may take a few moments</p>
        </motion.div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '200px' }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-chronos-orange to-chronos-green rounded-full mx-auto mt-8"
        />
      </div>
    </div>
  )
}
