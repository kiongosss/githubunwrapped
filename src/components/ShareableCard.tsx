'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { X, Download, Copy, Check } from 'lucide-react'
import html2canvas from 'html2canvas'
import type { GitHubStats } from '@/types/github'

interface ShareableCardProps {
  stats: GitHubStats
  onClose: () => void
}

export function ShareableCard({ stats, onClose }: ShareableCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        width: 1200,
        height: 630,
      })
      
      const link = document.createElement('a')
      link.download = `${stats.user.login}-github-unwrapped-2025.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-chronos-darker border border-chronos-gray rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Share Your Unwrapped</h2>
          <button
            onClick={onClose}
            className="text-chronos-light-gray hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Shareable Card */}
        <div 
          ref={cardRef}
          className="bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark p-8 rounded-lg mb-6"
          style={{ width: '1200px', height: '630px', margin: '0 auto', transform: 'scale(0.5)', transformOrigin: 'top center' }}
        >
          <div className="h-full flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <img 
                  src={stats.user.avatarUrl} 
                  alt={stats.user.name}
                  className="w-20 h-20 rounded-full border-2 border-chronos-green mr-6"
                />
                <div>
                  <h1 className="text-5xl font-bold glow-text">
                    {stats.user.name}'s 2025
                  </h1>
                  <p className="text-2xl text-chronos-light-gray">GitHub Unwrapped</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold glow-text">
                  {stats.totalContributions.toLocaleString()}
                </div>
                <div className="text-xl text-chronos-light-gray">Total Contributions</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 my-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-chronos-orange mb-2">
                  {stats.topLanguage.name}
                </div>
                <div className="text-lg text-chronos-light-gray">Top Language</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-chronos-green mb-2">
                  {stats.longestStreak.days} Days
                </div>
                <div className="text-lg text-chronos-light-gray">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-chronos-purple mb-2">
                  {stats.mostActiveTime.hour === 0 ? '12 AM' : 
                   stats.mostActiveTime.hour <= 12 ? `${stats.mostActiveTime.hour} AM` : 
                   `${stats.mostActiveTime.hour - 12} PM`}
                </div>
                <div className="text-lg text-chronos-light-gray">Most Active Hour</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-mono text-chronos-light-gray">
                chronos.dev/github-unwrapped
              </div>
              <div className="text-lg text-chronos-light-gray">
                Generated with Chronos
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="github-button flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating...' : 'Download Image'}
          </button>
          <button
            onClick={handleCopyLink}
            className="bg-chronos-gray hover:bg-chronos-light-gray text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
