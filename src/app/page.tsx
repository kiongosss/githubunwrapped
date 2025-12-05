'use client'

import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Calendar, Code2, TrendingUp, Clock, Zap } from 'lucide-react'
import { LoadingScreen } from '@/components/LoadingScreen'
import { UnwrappedResults } from '@/components/UnwrappedResults'
import { SimpleVideoGenerator } from '@/components/SimpleVideoGenerator'
import { generateUnwrapped } from '@/lib/github-api'
import type { GitHubStats } from '@/types/github'

export default function HomePage() {
  const { data: session, status } = useSession()
  const [isGenerating, setIsGenerating] = useState(false)
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showVideoPresentation, setShowVideoPresentation] = useState(false)

  const handleGenerateUnwrapped = async () => {
    if (!session?.accessToken) return

    setIsGenerating(true)
    setError(null)

    try {
      const unwrappedStats = await generateUnwrapped(session.accessToken as string)
      setStats(unwrappedStats)
      // Automatically show video presentation after generating stats
      setShowVideoPresentation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate your GitHub Unwrapped')
    } finally {
      setIsGenerating(false)
    }
  }

  if (status === 'loading') {
    return <LoadingScreen message="Initializing Chronos..." />
  }

  if (isGenerating) {
    return <LoadingScreen message="Analyzing your GitHub activity..." />
  }

  // Show video presentation first, then allow access to detailed results
  if (showVideoPresentation && stats) {
    return (
      <SimpleVideoGenerator 
        stats={stats} 
        onClose={() => setShowVideoPresentation(false)}
        autoPlay={true}
      />
    )
  }

  if (stats && !showVideoPresentation) {
    return <UnwrappedResults stats={stats} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-6">
            <Code2 className="w-12 h-12 text-chronos-green mr-4" />
            <h1 className="text-6xl font-bold glow-text">Chronos</h1>
          </div>
          <p className="text-xl text-chronos-light-gray mb-2">
            Your GitHub Year in Review
          </p>
          <p className="text-chronos-light-gray">
            Discover your coding journey through 2025 with beautiful visualizations
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="stat-card text-center">
            <TrendingUp className="w-8 h-8 text-chronos-orange mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Total Contributions</h3>
            <p className="text-chronos-light-gray text-sm">
              Track your commits, issues, and pull requests
            </p>
          </div>
          <div className="stat-card text-center">
            <Calendar className="w-8 h-8 text-chronos-green mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Coding Streaks</h3>
            <p className="text-chronos-light-gray text-sm">
              Discover your longest consecutive coding days
            </p>
          </div>
          <div className="stat-card text-center">
            <Clock className="w-8 h-8 text-chronos-purple mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Activity Patterns</h3>
            <p className="text-chronos-light-gray text-sm">
              Find your most productive coding hours
            </p>
          </div>
        </motion.div>

        {/* Main Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          {!session ? (
            <div className="terminal-window max-w-md mx-auto">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-chronos-light-gray text-sm ml-4">chronos:~$</span>
              </div>
              <div className="text-left mb-6">
                <p className="text-chronos-green mb-2">$ ./generate-unwrapped.sh</p>
                <p className="text-chronos-light-gray text-sm mb-4">
                  Authentication required to access GitHub API
                </p>
              </div>
              <button
                onClick={() => signIn('github')}
                className="github-button w-full flex items-center justify-center"
              >
                <Github className="w-5 h-5 mr-2" />
                Connect with GitHub
              </button>
            </div>
          ) : (
            <div className="terminal-window max-w-md mx-auto">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-chronos-light-gray text-sm ml-4">chronos:~$</span>
              </div>
              <div className="text-left mb-6">
                <p className="text-chronos-green mb-2">$ ./generate-unwrapped.sh</p>
                <p className="text-chronos-light-gray text-sm mb-2">
                  Connected as: <span className="text-white">{session.user?.name}</span>
                </p>
                <p className="text-chronos-light-gray text-sm mb-4">
                  Ready to analyze your 2025 GitHub activity
                </p>
              </div>
              <button
                onClick={handleGenerateUnwrapped}
                className="github-button w-full flex items-center justify-center"
                disabled={isGenerating}
              >
                <Zap className="w-5 h-5 mr-2" />
                Generate My Unwrapped
              </button>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300"
            >
              {error}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
