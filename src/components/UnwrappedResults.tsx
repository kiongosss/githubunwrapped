'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  Calendar, 
  Code2, 
  TrendingUp, 
  Clock, 
  GitCommit, 
  Star,
  Download,
  Share2,
  RotateCcw,
  Video
} from 'lucide-react'
import { format } from 'date-fns'
import type { GitHubStats } from '@/types/github'
import { ShareableCard } from './ShareableCard'
import { SimpleVideoGenerator } from './SimpleVideoGenerator'

interface UnwrappedResultsProps {
  stats: GitHubStats
}

export function UnwrappedResults({ stats }: UnwrappedResultsProps) {
  const [showShareCard, setShowShareCard] = useState(false)
  const [showVideoGenerator, setShowVideoGenerator] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleRestart = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <img 
              src={stats.user.avatarUrl} 
              alt={stats.user.name}
              className="w-16 h-16 rounded-full border-2 border-chronos-green mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold glow-text">
                {stats.user.name}'s 2025
              </h1>
              <p className="text-chronos-light-gray">GitHub Unwrapped</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Total Contributions */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <TrendingUp className="w-12 h-12 text-chronos-orange mx-auto mb-4" />
            <h2 className="text-5xl font-bold glow-text mb-2">
              {stats.totalContributions.toLocaleString()}
            </h2>
            <p className="text-xl text-white mb-2">Total Contributions</p>
            <p className="text-chronos-light-gray">
              Commits, Issues, Pull Requests & Reviews
            </p>
          </motion.div>

          {/* Top Language */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <Code2 className="w-12 h-12 text-chronos-green mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">
              Your 2025 language is
            </h2>
            <p className="text-5xl font-bold glow-text mb-2">
              {stats.topLanguage.name}
            </p>
            <p className="text-chronos-light-gray">
              {stats.topLanguage.percentage}% of your contributions
            </p>
          </motion.div>

          {/* Longest Streak */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <Calendar className="w-12 h-12 text-chronos-purple mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">
              You went on a
            </h2>
            <p className="text-5xl font-bold glow-text mb-2">
              {stats.longestStreak.days}-Day
            </p>
            <p className="text-xl text-white mb-2">coding streak!</p>
            <p className="text-chronos-light-gray">
              {format(new Date(stats.longestStreak.startDate), 'MMM d')} - {format(new Date(stats.longestStreak.endDate), 'MMM d, yyyy')}
            </p>
          </motion.div>

          {/* Most Active Time */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <Clock className="w-12 h-12 text-chronos-blue mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">
              You are a
            </h2>
            <p className="text-5xl font-bold glow-text mb-2">
              {stats.mostActiveTime.hour === 0 ? '12 AM' : 
               stats.mostActiveTime.hour <= 12 ? `${stats.mostActiveTime.hour} AM` : 
               `${stats.mostActiveTime.hour - 12} PM`}
            </p>
            <p className="text-xl text-white mb-2">developer</p>
            <p className="text-chronos-light-gray">
              {stats.mostActiveTime.count} contributions at this hour
            </p>
          </motion.div>

          {/* Commit Type Breakdown */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <GitCommit className="w-12 h-12 text-chronos-orange mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Your work breakdown
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold glow-text">
                  {Math.round((stats.commitTypeBreakdown.commits / stats.totalContributions) * 100)}%
                </p>
                <p className="text-chronos-light-gray">Commits</p>
              </div>
              <div>
                <p className="text-2xl font-bold glow-text">
                  {Math.round((stats.commitTypeBreakdown.pullRequests / stats.totalContributions) * 100)}%
                </p>
                <p className="text-chronos-light-gray">Pull Requests</p>
              </div>
            </div>
          </motion.div>

          {/* Busiest Day */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <Star className="w-12 h-12 text-chronos-green mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">
              Your busiest day was
            </h2>
            <p className="text-4xl font-bold glow-text mb-2">
              {format(new Date(stats.busiestDay.date), 'MMM do')}
            </p>
            <p className="text-chronos-light-gray">
              {stats.busiestDay.count} contributions in one day
            </p>
          </motion.div>

          {/* Sleep Efficiency */}
          <motion.div variants={itemVariants} className="stat-card text-center">
            <Clock className="w-12 h-12 text-chronos-purple mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">
              You code in
            </h2>
            <p className="text-5xl font-bold glow-text mb-2">
              {stats.sleepEfficiency.averageHours}
            </p>
            <p className="text-xl text-white mb-2">hour bursts</p>
            <p className="text-chronos-light-gray">
              {stats.sleepEfficiency.pattern}
            </p>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-16"
        >
          <button
            onClick={() => setShowVideoGenerator(true)}
            className="github-button flex items-center justify-center"
          >
            <Video className="w-5 h-5 mr-2" />
            Generate Video
          </button>
          <button
            onClick={() => setShowShareCard(true)}
            className="bg-chronos-purple hover:bg-chronos-purple/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Images
          </button>
          <button
            onClick={handleRestart}
            className="bg-chronos-gray hover:bg-chronos-light-gray text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Generate Another
          </button>
        </motion.div>
      </div>

      {/* Video Generator Modal */}
      {showVideoGenerator && (
        <SimpleVideoGenerator 
          stats={stats} 
          onClose={() => setShowVideoGenerator(false)} 
        />
      )}

      {/* Shareable Card Modal */}
      {showShareCard && (
        <ShareableCard 
          stats={stats} 
          onClose={() => setShowShareCard(false)} 
        />
      )}
    </div>
  )
}
