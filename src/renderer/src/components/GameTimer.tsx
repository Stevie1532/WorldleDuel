import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface GameTimerProps {
  startTime: Date | null
  isActive: boolean
  mode: 'duel' | 'battleRoyale'
  onTimeUp?: () => void
}

export function GameTimer({ startTime, isActive, mode, onTimeUp: _onTimeUp }: GameTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && startTime && !isPaused) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, startTime, isPaused])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getModeIcon = () => {
    return mode === 'duel' ? '⚔️' : '🏆'
  }

  const getModeColor = () => {
    return mode === 'duel' ? 'bg-blue-500' : 'bg-purple-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getModeIcon()}</span>
          <div>
            <div className="text-sm font-medium text-gray-600">
              {mode === 'duel' ? 'Duel Timer' : 'Battle Royale Timer'}
            </div>
            <div className="text-lg font-bold text-gray-800">
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause/Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            disabled={!isActive}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isActive
                ? isPaused
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>

          {/* Status Indicator */}
          <div className={`w-3 h-3 rounded-full ${getModeColor()} ${isActive ? 'animate-pulse' : ''}`} />
        </div>
      </div>

      {/* Progress Bar */}
      {isActive && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${getModeColor()}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((elapsedTime / 300) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            Game in progress...
          </div>
        </div>
      )}

      {/* Game Status */}
      <div className="mt-2 text-center">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
          isActive
            ? isPaused
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? (isPaused ? '⏸️ Paused' : '🎮 Active') : '⏹️ Ended'}
        </span>
      </div>
    </motion.div>
  )
}

// Countdown Timer Component
interface CountdownTimerProps {
  seconds: number
  onComplete: () => void
  label?: string
}

export function CountdownTimer({ seconds, onComplete, label = 'Starting in' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  const getProgressColor = () => {
    if (timeLeft > seconds * 0.6) return 'bg-green-500'
    if (timeLeft > seconds * 0.3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white rounded-lg shadow-md p-6 text-center"
    >
      <h3 className="text-xl font-bold mb-4">{label}</h3>
      
      <div className="text-6xl font-bold text-gray-800 mb-4">
        {timeLeft}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
        <motion.div
          className={`h-3 rounded-full ${getProgressColor()}`}
          initial={{ width: '100%' }}
          animate={{ width: `${(timeLeft / seconds) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Animated dots */}
      <div className="flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full"
            animate={{
              scale: timeLeft % 3 === i ? [1, 1.5, 1] : 1,
              opacity: timeLeft % 3 === i ? 1 : 0.5
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        ))}
      </div>
    </motion.div>
  )
}
