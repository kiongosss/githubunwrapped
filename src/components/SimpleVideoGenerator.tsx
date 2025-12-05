'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { X, Video, Download, Play, Pause, RotateCcw, Share2, FileVideo } from 'lucide-react'
import type { GitHubStats } from '@/types/github'
import { format } from 'date-fns'

interface SimpleVideoGeneratorProps {
  stats: GitHubStats
  onClose: () => void
  autoPlay?: boolean
}

type VideoScene = 'intro' | 'total' | 'language' | 'streak' | 'time' | 'breakdown' | 'busiest' | 'outro'

export function SimpleVideoGenerator({ stats, onClose, autoPlay = false }: SimpleVideoGeneratorProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentScene, setCurrentScene] = useState<VideoScene>('intro')
  const [sceneProgress, setSceneProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const videoRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  const scenes: VideoScene[] = ['intro', 'total', 'language', 'streak', 'time', 'breakdown', 'busiest', 'outro']
  const sceneDuration = 4000 // 4 seconds per scene
  const totalDuration = scenes.length * sceneDuration

  useEffect(() => {
    if (isPlaying) {
      const startTime = Date.now()
      const sceneIndex = scenes.indexOf(currentScene)
      const sceneStartTime = sceneIndex * sceneDuration

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime + sceneStartTime
        const progress = (elapsed % sceneDuration) / sceneDuration
        const newSceneIndex = Math.floor(elapsed / sceneDuration)

        setSceneProgress(progress)

        if (newSceneIndex >= scenes.length) {
          // Animation complete
          setIsPlaying(false)
          setCurrentScene('intro')
          setSceneProgress(0)
        } else if (newSceneIndex !== sceneIndex) {
          setCurrentScene(scenes[newSceneIndex])
        }
      }, 50) // Update every 50ms for smooth progress
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, currentScene])

  const handlePlay = () => {
    setIsPlaying(true)
    if (currentScene === 'outro') {
      setCurrentScene('intro')
      setSceneProgress(0)
    }
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleRestart = () => {
    setIsPlaying(false)
    setCurrentScene('intro')
    setSceneProgress(0)
  }

  const captureFrame = async () => {
    if (!videoRef.current) return null

    // Use html2canvas to capture the current frame
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(videoRef.current, {
      backgroundColor: '#0a0a0f',
      scale: 2,
      width: 1920,
      height: 1080,
      useCORS: true,
    })

    return canvas.toDataURL('image/png')
  }

  const startVideoRecording = async () => {
    if (!videoRef.current) return

    try {
      setIsGeneratingVideo(true)
      
      // Create a canvas to capture the animation
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not get canvas context')
      }

      // Create MediaRecorder from canvas stream
      const stream = canvas.captureStream(30) // 30 FPS
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      recordedChunks.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' })
        downloadVideo(blob)
        setIsRecording(false)
        setIsGeneratingVideo(false)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)

      // Restart animation and record it
      setCurrentScene('intro')
      setSceneProgress(0)
      setIsPlaying(true)

      // Function to capture frames
      const captureFrame = async () => {
        if (!videoRef.current) return

        const html2canvas = (await import('html2canvas')).default
        const frameCanvas = await html2canvas(videoRef.current, {
          backgroundColor: '#0a0a0f',
          scale: 1,
          width: 1920,
          height: 1080,
          useCORS: true,
        })

        // Draw the frame to our recording canvas
        ctx.drawImage(frameCanvas, 0, 0, 1920, 1080)
      }

      // Capture frames at 30 FPS during the entire animation
      const frameInterval = setInterval(captureFrame, 1000 / 30)

      // Stop recording after all scenes complete
      setTimeout(() => {
        clearInterval(frameInterval)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
      }, totalDuration + 1000)

    } catch (error) {
      console.error('Error recording video:', error)
      setIsRecording(false)
      setIsGeneratingVideo(false)
      alert('Video recording failed. Please try using screen recording software instead.')
    }
  }

  const downloadVideo = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${stats.user.login}-github-unwrapped-2025.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const startScreenRecording = async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        } as MediaTrackConstraints,
        audio: false
      })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      recordedChunks.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' })
        downloadVideo(blob)
        setIsRecording(false)
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)

      // Restart animation for recording
      setCurrentScene('intro')
      setSceneProgress(0)
      setIsPlaying(true)

      // Stop recording after animation completes
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
        }
        stream.getTracks().forEach(track => track.stop())
      }, totalDuration + 2000)

    } catch (error) {
      console.error('Error starting screen recording:', error)
      
      // Show helpful instructions for manual recording
      const instructions = `
Screen recording not available. Here's how to record manually:

🖥️ Mac: Press Cmd+Shift+5 → Select area → Click Record
🪟 Windows: Press Win+G → Click Record button  
🐧 Linux: Use OBS Studio or SimpleScreenRecorder

The animation will restart automatically for you to record!
      `
      
      if (confirm(instructions + '\n\nClick OK to restart the animation for manual recording.')) {
        // Restart animation for manual recording
        setCurrentScene('intro')
        setSceneProgress(0)
        setIsPlaying(true)
      }
    }
  }

  const downloadCurrentFrame = async () => {
    const dataUrl = await captureFrame()
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `${stats.user.login}-${currentScene}-frame.png`
      link.href = dataUrl
      link.click()
    }
  }

  const renderScene = () => {
    const baseClasses = "w-full h-full bg-gradient-to-br from-chronos-dark via-chronos-darker to-chronos-dark flex flex-col justify-center items-center relative overflow-hidden"
    
    // Enhanced background decorations with animations
    const BackgroundDecorations = () => (
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-chronos-green/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-chronos-orange/20 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-chronos-gray/10 rounded-full"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-chronos-gray/5 rounded-full"
          animate={{
            rotate: [360, 0],
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    )

    const sceneAnimationProps = {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.2 },
      transition: { duration: 0.8, ease: "easeOut" }
    }

    switch (currentScene) {
      case 'intro':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.img
                src={stats.user.avatarUrl}
                alt={stats.user.name}
                className="w-32 h-32 rounded-full border-4 border-chronos-green mx-auto mb-8"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.h1
                className="text-8xl font-bold glow-text mb-4"
                animate={{
                  textShadow: [
                    "0 0 20px #10b981",
                    "0 0 40px #10b981, 0 0 60px #10b981",
                    "0 0 20px #10b981"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {stats.user.name}
              </motion.h1>
              <motion.p
                className="text-4xl text-chronos-light-gray mb-8"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                2025 GitHub Unwrapped
              </motion.p>
              <motion.div
                className="text-2xl text-chronos-green"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Your coding year in review
              </motion.div>
            </div>
          </motion.div>
        )

      case 'total':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.div
                className="text-[200px] font-bold glow-text leading-none mb-8"
                animate={{
                  scale: [0.9, 1.1, 1],
                  textShadow: [
                    "0 0 30px #f97316",
                    "0 0 60px #f97316, 0 0 90px #f97316",
                    "0 0 30px #f97316"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {stats.totalContributions.toLocaleString()}
              </motion.div>
              <motion.h2
                className="text-6xl text-white font-semibold mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Total Contributions
              </motion.h2>
              <motion.p
                className="text-3xl text-chronos-light-gray"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Commits • Issues • Pull Requests • Reviews
              </motion.p>
            </div>
          </motion.div>
        )

      case 'language':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.p
                className="text-5xl text-white font-semibold mb-8"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Your 2025 language is
              </motion.p>
              <motion.div
                className="text-[180px] font-bold glow-text leading-none mb-8"
                animate={{
                  rotate: [-2, 2, -2],
                  scale: [0.95, 1.05, 0.95],
                  textShadow: [
                    "0 0 30px #6b46c1",
                    "0 0 60px #6b46c1, 0 0 90px #6b46c1",
                    "0 0 30px #6b46c1"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {stats.topLanguage.name}
              </motion.div>
              <motion.p
                className="text-4xl text-chronos-light-gray"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stats.topLanguage.percentage}% of your contributions
              </motion.p>
            </div>
          </motion.div>
        )

      case 'streak':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.p
                className="text-5xl text-white font-semibold mb-8"
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                You went on a
              </motion.p>
              <div className="flex items-center justify-center mb-8">
                <motion.span
                  className="text-[180px] font-bold glow-text leading-none mr-8"
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    textShadow: [
                      "0 0 30px #10b981",
                      "0 0 60px #10b981, 0 0 90px #10b981",
                      "0 0 30px #10b981"
                    ]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {stats.longestStreak.days}
                </motion.span>
                <motion.span
                  className="text-6xl text-white font-semibold"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Day
                </motion.span>
              </div>
              <motion.p
                className="text-5xl text-white font-semibold mb-4"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                coding streak!
              </motion.p>
            </div>
          </motion.div>
        )

      case 'time':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.p
                className="text-5xl text-white font-semibold mb-8"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                You are a
              </motion.p>
              <motion.div
                className="text-[160px] font-bold glow-text leading-none mb-8"
                animate={{
                  rotate: [-1, 1, -1],
                  scale: [0.95, 1.05, 0.95],
                  textShadow: [
                    "0 0 30px #1e3a8a",
                    "0 0 60px #1e3a8a, 0 0 90px #1e3a8a",
                    "0 0 30px #1e3a8a"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {stats.mostActiveTime.hour === 0 ? '12 AM' : 
                 stats.mostActiveTime.hour <= 12 ? `${stats.mostActiveTime.hour} AM` : 
                 `${stats.mostActiveTime.hour - 12} PM`}
              </motion.div>
              <motion.p
                className="text-5xl text-white font-semibold"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                developer
              </motion.p>
            </div>
          </motion.div>
        )

      case 'breakdown':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.h2
                className="text-5xl text-white font-semibold mb-12"
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Your work breakdown
              </motion.h2>
              <div className="grid grid-cols-2 gap-16 max-w-4xl">
                <motion.div
                  className="text-center"
                  animate={{ x: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    className="text-[120px] font-bold glow-text leading-none mb-4"
                    animate={{
                      scale: [0.9, 1.1, 0.9],
                      textShadow: [
                        "0 0 30px #f97316",
                        "0 0 60px #f97316",
                        "0 0 30px #f97316"
                      ]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    {Math.round((stats.commitTypeBreakdown.commits / stats.totalContributions) * 100)}%
                  </motion.div>
                  <div className="text-4xl text-chronos-light-gray">Commits</div>
                </motion.div>
                <motion.div
                  className="text-center"
                  animate={{ x: [5, -5, 5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    className="text-[120px] font-bold glow-text leading-none mb-4"
                    animate={{
                      scale: [1.1, 0.9, 1.1],
                      textShadow: [
                        "0 0 30px #10b981",
                        "0 0 60px #10b981",
                        "0 0 30px #10b981"
                      ]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  >
                    {Math.round((stats.commitTypeBreakdown.pullRequests / stats.totalContributions) * 100)}%
                  </motion.div>
                  <div className="text-4xl text-chronos-light-gray">Pull Requests</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )

      case 'busiest':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.p
                className="text-5xl text-white font-semibold mb-8"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Your busiest day was
              </motion.p>
              <motion.div
                className="text-[160px] font-bold glow-text leading-none mb-8"
                animate={{
                  scale: [0.95, 1.05, 0.95],
                  textShadow: [
                    "0 0 30px #10b981",
                    "0 0 60px #10b981, 0 0 90px #10b981",
                    "0 0 30px #10b981"
                  ]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {format(new Date(stats.busiestDay.date), 'MMM do')}
              </motion.div>
              <motion.p
                className="text-4xl text-chronos-light-gray"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {stats.busiestDay.count} contributions in one day
              </motion.p>
            </div>
          </motion.div>
        )

      case 'outro':
        return (
          <motion.div className={baseClasses} {...sceneAnimationProps}>
            <BackgroundDecorations />
            <div className="text-center z-10">
              <motion.div
                className="text-8xl font-bold glow-text mb-8"
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  textShadow: [
                    "0 0 40px #10b981",
                    "0 0 80px #10b981, 0 0 120px #10b981",
                    "0 0 40px #10b981"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                2025
              </motion.div>
              <motion.p
                className="text-4xl text-white font-semibold mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                What a year of coding!
              </motion.p>
              <motion.p
                className="text-2xl text-chronos-light-gray mb-8"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                Generated with Chronos
              </motion.p>
              <motion.p
                className="text-xl text-chronos-green font-mono"
                animate={{
                  textShadow: [
                    "0 0 10px #10b981",
                    "0 0 20px #10b981",
                    "0 0 10px #10b981"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                chronos.dev
              </motion.p>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  const currentSceneIndex = scenes.indexOf(currentScene)
  const totalProgress = (currentSceneIndex + sceneProgress) / scenes.length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-chronos-darker border border-chronos-gray rounded-lg p-6 max-w-6xl w-full max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center">
              <Video className="w-8 h-8 mr-3 text-chronos-green" />
              {stats.user.name}'s 2025 GitHub Unwrapped
            </h2>
            <p className="text-chronos-light-gray">Your coding year in review - brought to life with stunning animations</p>
          </div>
          <button
            onClick={onClose}
            className="text-chronos-light-gray hover:text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Video Preview */}
        <div className="mb-6">
          <div 
            ref={videoRef}
            className="w-full bg-chronos-dark rounded-lg overflow-hidden"
            style={{ height: '400px', aspectRatio: '16/9' }}
          >
            <AnimatePresence mode="wait">
              {renderScene()}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="github-button flex items-center justify-center px-6 py-3"
            >
              {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleRestart}
              className="bg-chronos-gray hover:bg-chronos-light-gray text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restart
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={startScreenRecording}
              disabled={isRecording || isGeneratingVideo}
              className="bg-chronos-orange hover:bg-chronos-orange/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <FileVideo className="w-5 h-5 mr-2" />
              {isRecording ? 'Recording...' : 'Download Video'}
            </button>
            <button
              onClick={onClose}
              className="bg-chronos-green hover:bg-chronos-green/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <Share2 className="w-5 h-5 mr-2" />
              View Details & Share
            </button>
            <button
              onClick={downloadCurrentFrame}
              className="bg-chronos-purple hover:bg-chronos-purple/80 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Save Frame
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-chronos-light-gray capitalize">Scene: {currentScene}</span>
            <span className="text-sm text-chronos-light-gray">
              {currentSceneIndex + 1} / {scenes.length}
            </span>
          </div>
          <div className="w-full bg-chronos-gray/30 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-chronos-orange to-chronos-green h-2 rounded-full"
              style={{ width: `${totalProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs text-chronos-light-gray text-center">
            🎬 Click "Download Video" to automatically record and save your animated presentation • High-quality WebM format perfect for sharing
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
