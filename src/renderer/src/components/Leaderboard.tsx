import { motion } from 'framer-motion'
import type { Player } from '../stores/gameStore'

interface LeaderboardProps {
  players: Player[]
  mode: 'duel' | 'battleRoyale'
  showStats?: boolean
}

interface PlayerStats {
  player: Player
  gamesPlayed: number
  gamesWon: number
  averageAttempts: number
  winRate: number
}

export function Leaderboard({ players, mode, showStats = true }: LeaderboardProps) {
  // Calculate player statistics
  const playerStats: PlayerStats[] = players.map(player => {
    const gamesPlayed = player.guesses?.length || 0
    const gamesWon = player.won ? 1 : 0
    const totalAttempts = player.guesses?.reduce((sum, guess) => sum + guess.attempt, 0) || 0
    const averageAttempts = gamesPlayed > 0 ? totalAttempts / gamesPlayed : 0
    const winRate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0

    return {
      player,
      gamesPlayed,
      gamesWon,
      averageAttempts,
      winRate
    }
  })

  // Sort by win rate, then by average attempts
  const sortedStats = playerStats.sort((a, b) => {
    if (a.winRate !== b.winRate) return b.winRate - a.winRate
    return a.averageAttempts - b.averageAttempts
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-center">
        {mode === 'duel' ? '⚔️ Duel Leaderboard' : '🏆 Battle Royale Leaderboard'}
      </h3>
      
      <div className="space-y-3">
        {sortedStats.map((stats, index) => (
          <motion.div
            key={stats.player.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg border-2 ${
              index === 0
                ? 'border-yellow-500 bg-yellow-50'
                : index === 1
                ? 'border-gray-400 bg-gray-50'
                : index === 2
                ? 'border-amber-600 bg-amber-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span className="font-semibold">{stats.player.username}</span>
              {stats.player.won && (
                <span className="text-green-600 text-sm font-bold">👑</span>
              )}
            </div>
            
            {showStats ? (
              <div className="text-right text-sm">
                <div className="font-semibold">
                  Win Rate: {stats.winRate.toFixed(1)}%
                </div>
                <div className="text-gray-600">
                  {stats.gamesWon}/{stats.gamesPlayed} games
                </div>
                {stats.averageAttempts > 0 && (
                  <div className="text-gray-500">
                    Avg: {stats.averageAttempts.toFixed(1)} attempts
                  </div>
                )}
              </div>
            ) : (
              <div className="text-right">
                {stats.player.won ? (
                  <span className="text-green-600 font-bold">Winner!</span>
                ) : (
                  <span className="text-gray-600">
                    {stats.gamesPlayed}/6 attempts
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Mode-specific stats */}
      {mode === 'battleRoyale' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded-lg"
        >
          <div className="text-center text-sm text-purple-800">
            <span className="font-semibold">
              {players.filter(p => !p.eliminated).length} survivors
            </span>
            {' • '}
            <span className="font-semibold">
              {players.filter(p => p.eliminated).length} eliminated
            </span>
            {' • '}
            <span className="font-semibold">
              {players.filter(p => p.won).length} winner{players.filter(p => p.won).length !== 1 ? 's' : ''}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}
