import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'

export const Route = createFileRoute('/')({
  component: OnboardingPage
})

function OnboardingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black flex flex-col items-center justify-center font-serif px-4 py-8 sm:px-6 md:px-10">
      {/* Logo/Title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <h1 className="text-6xl sm:text-7xl font-black mb-4 text-[#1a1a1a]">
          Word Duel
        </h1>
        <p className="text-xl sm:text-2xl text-gray-700 max-w-md mx-auto">
          Multiplayer Wordle battles with friends.
        </p>
      </motion.div>

      {/* Play Now Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate({ to: '/lobby' })}
        className="bg-[#1a1a1a] text-white rounded-full px-12 py-4 text-xl font-bold hover:bg-[#333] transition-colors shadow-lg"
      >
        Play Now
      </motion.button>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="mt-16 text-center text-gray-500"
      >
        <p className="text-sm">Challenge your friends to a word-guessing duel!</p>
      </motion.div>
    </div>
  )
}
