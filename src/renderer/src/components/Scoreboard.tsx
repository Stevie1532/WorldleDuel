import { motion } from 'framer-motion'
import type { Player } from '../stores/gameStore'

interface ScoreboardProps {
  players: Player[]
  mode: 'duel' | 'battleRoyale'
  winner: string | null
  currentPlayer: string | null
}

export function Scoreboard({ players, mode, winner, currentPlayer }: ScoreboardProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.won && !b.won) return -1
    if (!a.won && b.won) return 1
    if (a.eliminated && !b.eliminated) return 1
    if (!a.eliminated && b.eliminated) return -1
    return a.score - b.score
  })

  if (mode === 'duel') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-center">⚔️ Duel Scoreboard</h3>
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                player.won
                  ? 'border-green-500 bg-green-50'
                  : player.id === currentPlayer
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold">
                  {player.won ? '👑' : index + 1}
                </span>
                <span className="font-semibold">{player.username}</span>
                {player.id === currentPlayer && (
                  <span className="text-blue-600 text-sm">(You)</span>
                )}
              </div>
              <div className="text-right">
                {player.won ? (
                  <span className="text-green-600 font-bold">Winner!</span>
                ) : (
                  <span className="text-gray-600">
                    {player.guesses?.length || 0}/6 attempts
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
        {winner === null && players.every(p => p.guesses && p.guesses.length >= 6) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-center font-semibold"
          >
            🤝 It's a Draw! Both players failed to guess the word.
          </motion.div>
        )}
      </div>
    )
  }

  // Battle Royale Mode
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-center">🏆 Battle Royale</h3>
      <div className="space-y-3">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
              player.won
                ? 'border-yellow-500 bg-yellow-50'
                : player.eliminated
                ? 'border-red-300 bg-red-50 opacity-60'
                : player.id === currentPlayer
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">
                {player.won ? '🏆' : player.eliminated ? '💀' : index + 1}
              </span>
              <span className={`font-semibold ${player.eliminated ? 'line-through' : ''}`}>
                {player.username}
              </span>
              {player.id === currentPlayer && (
                <span className="text-blue-600 text-sm">(You)</span>
              )}
            </div>
            <div className="text-right">
              {player.won ? (
                <span className="text-yellow-600 font-bold">Last Standing!</span>
              ) : player.eliminated ? (
                <span className="text-red-600 font-semibold">Eliminated</span>
              ) : (
                <span className="text-gray-600">
                  {player.guesses?.length || 0}/6 attempts
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Battle Royale Status */}
      <div className="mt-4 p-3 bg-gray-100 rounded-lg">
        <div className="text-center text-sm text-gray-700">
          <span className="font-semibold">
            {players.filter(p => !p.eliminated).length} active
          </span>
          {' • '}
          <span className="font-semibold">
            {players.filter(p => p.eliminated).length} eliminated
          </span>
        </div>
      </div>
    </div>
  )
}
