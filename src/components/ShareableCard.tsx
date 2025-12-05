'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { X, Download, Copy, Check, Image, Grid3X3, Zap, Calendar, Code2, TrendingUp, Clock, GitCommit, Star } from 'lucide-react'
import html2canvas from 'html2canvas'
import type { GitHubStats } from '@/types/github'
import { format } from 'date-fns'

interface ShareableCardProps {
  stats: GitHubStats
  onClose: () => void
}

type ShareOption = 'full' | 'total' | 'language' | 'streak' | 'time' | 'breakdown' | 'busiest'

export function ShareableCard({ stats, onClose }: ShareableCardProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedOption, setSelectedOption] = useState<ShareOption>('full')
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 3,
        width: 1080,
        height: 1080,
        useCORS: true,
        allowTaint: true,
      })
      
      const link = document.createElement('a')
      const fileName = `${stats.user.login}-${selectedOption}-unwrapped-2025.png`
      link.download = fileName
      link.href = canvas.toDataURL('image/png', 1.0)
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const shareOptions = [
    { id: 'full' as ShareOption, label: 'Full Unwrapped', icon: Grid3X3, description: 'Complete year summary' },
    { id: 'total' as ShareOption, label: 'Total Contributions', icon: TrendingUp, description: 'Your total impact' },
    { id: 'language' as ShareOption, label: 'Top Language', icon: Code2, description: 'Your coding language' },
    { id: 'streak' as ShareOption, label: 'Longest Streak', icon: Calendar, description: 'Coding consistency' },
    { id: 'time' as ShareOption, label: 'Active Hours', icon: Clock, description: 'When you code' },
    { id: 'breakdown' as ShareOption, label: 'Work Breakdown', icon: GitCommit, description: 'Contribution types' },
    { id: 'busiest' as ShareOption, label: 'Busiest Day', icon: Star, description: 'Peak productivity' },
  ]

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const renderShareCard = () => {
    const baseStyle = "w-[1080px] h-[1080px] bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark p-16 flex flex-col justify-between relative overflow-hidden"
    
    // Decorative background elements
    const BackgroundDecorations = () => (
      <>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-chronos-green/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-chronos-orange/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-chronos-gray/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-chronos-gray/5 rounded-full" />
      </>
    )

    switch (selectedOption) {
      case 'total':
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-24 h-24 rounded-full border-4 border-chronos-green mr-8" />
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{stats.user.name}</h1>
                    <p className="text-3xl text-chronos-light-gray">2025 GitHub Impact</p>
                  </div>
                </div>
                <TrendingUp className="w-32 h-32 text-chronos-orange" />
              </div>
              
              {/* Main Stat */}
              <div className="text-center mb-16">
                <div className="text-[200px] font-bold glow-text leading-none mb-8">
                  {stats.totalContributions.toLocaleString()}
                </div>
                <div className="text-6xl text-white font-semibold mb-4">Total Contributions</div>
                <div className="text-3xl text-chronos-light-gray">Commits • Issues • Pull Requests • Reviews</div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-2xl text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )

      case 'language':
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-24 h-24 rounded-full border-4 border-chronos-green mr-8" />
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{stats.user.name}</h1>
                    <p className="text-3xl text-chronos-light-gray">2025 Coding Language</p>
                  </div>
                </div>
                <Code2 className="w-32 h-32 text-chronos-purple" />
              </div>
              
              {/* Main Stat */}
              <div className="text-center mb-16">
                <div className="text-5xl text-white font-semibold mb-8">Your 2025 language is</div>
                <div className="text-[180px] font-bold glow-text leading-none mb-8">
                  {stats.topLanguage.name}
                </div>
                <div className="text-4xl text-chronos-light-gray">{stats.topLanguage.percentage}% of your contributions</div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-2xl text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )

      case 'streak':
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-24 h-24 rounded-full border-4 border-chronos-green mr-8" />
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{stats.user.name}</h1>
                    <p className="text-3xl text-chronos-light-gray">2025 Coding Streak</p>
                  </div>
                </div>
                <Calendar className="w-32 h-32 text-chronos-green" />
              </div>
              
              {/* Main Stat */}
              <div className="text-center mb-16">
                <div className="text-5xl text-white font-semibold mb-8">You went on a</div>
                <div className="flex items-center justify-center mb-8">
                  <div className="text-[180px] font-bold glow-text leading-none mr-8">
                    {stats.longestStreak.days}
                  </div>
                  <div className="text-6xl text-white font-semibold">Day</div>
                </div>
                <div className="text-5xl text-white font-semibold mb-4">coding streak!</div>
                <div className="text-3xl text-chronos-light-gray">
                  {format(new Date(stats.longestStreak.startDate), 'MMM d')} - {format(new Date(stats.longestStreak.endDate), 'MMM d, yyyy')}
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-2xl text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )

      case 'time':
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-24 h-24 rounded-full border-4 border-chronos-green mr-8" />
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{stats.user.name}</h1>
                    <p className="text-3xl text-chronos-light-gray">2025 Coding Hours</p>
                  </div>
                </div>
                <Clock className="w-32 h-32 text-chronos-blue" />
              </div>
              
              {/* Main Stat */}
              <div className="text-center mb-16">
                <div className="text-5xl text-white font-semibold mb-8">You are a</div>
                <div className="text-[160px] font-bold glow-text leading-none mb-8">
                  {stats.mostActiveTime.hour === 0 ? '12 AM' : 
                   stats.mostActiveTime.hour <= 12 ? `${stats.mostActiveTime.hour} AM` : 
                   `${stats.mostActiveTime.hour - 12} PM`}
                </div>
                <div className="text-5xl text-white font-semibold mb-4">developer</div>
                <div className="text-3xl text-chronos-light-gray">{stats.mostActiveTime.count} contributions at this hour</div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-2xl text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )

      case 'breakdown':
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-24 h-24 rounded-full border-4 border-chronos-green mr-8" />
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{stats.user.name}</h1>
                    <p className="text-3xl text-chronos-light-gray">2025 Work Breakdown</p>
                  </div>
                </div>
                <GitCommit className="w-32 h-32 text-chronos-orange" />
              </div>
              
              {/* Main Stat */}
              <div className="text-center mb-16">
                <div className="text-5xl text-white font-semibold mb-12">Your work breakdown</div>
                <div className="grid grid-cols-2 gap-12 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="text-[120px] font-bold glow-text leading-none mb-4">
                      {Math.round((stats.commitTypeBreakdown.commits / stats.totalContributions) * 100)}%
                    </div>
                    <div className="text-4xl text-chronos-light-gray">Commits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[120px] font-bold glow-text leading-none mb-4">
                      {Math.round((stats.commitTypeBreakdown.pullRequests / stats.totalContributions) * 100)}%
                    </div>
                    <div className="text-4xl text-chronos-light-gray">Pull Requests</div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-2xl text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )

      case 'busiest':
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-24 h-24 rounded-full border-4 border-chronos-green mr-8" />
                  <div>
                    <h1 className="text-6xl font-bold text-white mb-2">{stats.user.name}</h1>
                    <p className="text-3xl text-chronos-light-gray">2025 Peak Day</p>
                  </div>
                </div>
                <Star className="w-32 h-32 text-chronos-green" />
              </div>
              
              {/* Main Stat */}
              <div className="text-center mb-16">
                <div className="text-5xl text-white font-semibold mb-8">Your busiest day was</div>
                <div className="text-[160px] font-bold glow-text leading-none mb-8">
                  {format(new Date(stats.busiestDay.date), 'MMM do')}
                </div>
                <div className="text-4xl text-chronos-light-gray">{stats.busiestDay.count} contributions in one day</div>
              </div>
              
              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="text-3xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-2xl text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )

      default: // 'full'
        return (
          <div className={baseStyle}>
            <BackgroundDecorations />
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center">
                  <img src={stats.user.avatarUrl} alt={stats.user.name} className="w-20 h-20 rounded-full border-2 border-chronos-green mr-6" />
                  <div>
                    <h1 className="text-5xl font-bold glow-text">{stats.user.name}'s 2025</h1>
                    <p className="text-2xl text-chronos-light-gray">GitHub Unwrapped</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold glow-text">{stats.totalContributions.toLocaleString()}</div>
                  <div className="text-xl text-chronos-light-gray">Total Contributions</div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-chronos-orange mb-2">{stats.topLanguage.name}</div>
                  <div className="text-lg text-chronos-light-gray">Top Language</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-chronos-green mb-2">{stats.longestStreak.days} Days</div>
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
                <div className="text-2xl font-mono text-chronos-light-gray">chronos.dev</div>
                <div className="text-lg text-chronos-light-gray">Generated with Chronos</div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-chronos-darker border border-chronos-gray rounded-lg p-6 max-w-7xl w-full max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Share Your Unwrapped</h2>
            <p className="text-chronos-light-gray">Choose a template and download your beautiful share card</p>
          </div>
          <button
            onClick={onClose}
            className="text-chronos-light-gray hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Share Options */}
          <div className="lg:col-span-1">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Share Templates
            </h3>
            <div className="space-y-3">
              {shareOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                      selectedOption === option.id
                        ? 'border-chronos-green bg-chronos-green/10 text-white'
                        : 'border-chronos-gray/30 bg-chronos-gray/10 text-chronos-light-gray hover:border-chronos-green/50 hover:bg-chronos-green/5'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Icon className={`w-5 h-5 mr-3 ${selectedOption === option.id ? 'text-chronos-green' : 'text-chronos-light-gray'}`} />
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    <p className="text-sm opacity-80">{option.description}</p>
                  </button>
                )
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleDownload}
                disabled={isGenerating}
                className="w-full github-button flex items-center justify-center py-4"
              >
                <Download className="w-5 h-5 mr-2" />
                {isGenerating ? 'Generating Image...' : 'Download Image (1080x1080)'}
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full bg-chronos-gray hover:bg-chronos-light-gray text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                {copied ? 'Link Copied!' : 'Copy Share Link'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-white mb-4">Preview</h3>
            <div className="bg-chronos-darker rounded-lg p-4 overflow-hidden">
              <div 
                ref={cardRef}
                className="mx-auto"
                style={{ 
                  transform: 'scale(0.35)', 
                  transformOrigin: 'top center',
                  width: '1080px',
                  height: '1080px'
                }}
              >
                {renderShareCard()}
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-chronos-light-gray text-sm">
                High-resolution 1080x1080px • Perfect for Instagram, Twitter, LinkedIn
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
