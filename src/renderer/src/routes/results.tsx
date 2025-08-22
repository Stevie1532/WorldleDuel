import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'

export const Route = createFileRoute('/results')({
  component: ResultsPage
})

function ResultsPage() {
  const navigate = useNavigate()
  const { currentRoom, winner, resetGame } = useGameStore()

  const handlePlayAgain = () => {
    resetGame()
    navigate({ to: '/lobby' })
  }

  const handleBackToHome = () => {
    resetGame()
    navigate({ to: '/' })
  }

  if (!currentRoom) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black font-serif px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black mb-4">Game Results</h1>
          <p className="text-xl text-gray-600">Room: {currentRoom.code}</p>
        </motion.div>

        {/* Winner Announcement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-8 mb-8 text-center"
        >
          <h2 className="text-3xl font-bold mb-4">
            {winner ? (
              <span className="text-green-600">🎉 {winner} Wins! 🎉</span>
            ) : (
              <span className="text-gray-600">Game Over</span>
            )}
          </h2>
          
          {currentRoom.solutionWord && (
            <div className="mb-4">
              <p className="text-lg text-gray-600 mb-2">The word was:</p>
              <p className="text-2xl font-bold text-[#1a1a1a]">{currentRoom.solutionWord}</p>
            </div>
          )}
        </motion.div>

        {/* Scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <h3 className="text-2xl font-bold mb-6 text-center">Final Scoreboard</h3>
          
          <div className="space-y-4">
            {currentRoom.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`
                    flex items-center justify-between p-4 rounded-lg border-2
                    ${player.id === winner ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-gray-300'}
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-lg">{player.username}</span>
                      {player.id === currentRoom.hostId && (
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#1a1a1a]">{player.score}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </motion.div>
              ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={handlePlayAgain}
            className="flex-1 bg-[#1a1a1a] text-white py-4 rounded-lg font-semibold text-lg hover:bg-[#333] transition-colors"
          >
            Play Again
          </button>
          
          <button
            onClick={handleBackToHome}
            className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </motion.div>

        {/* Game Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center text-gray-500"
        >
          <p className="text-sm">
            Thanks for playing Word Duel! Challenge your friends to another round.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
