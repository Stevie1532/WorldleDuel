import { motion } from 'framer-motion'
import type { Player } from '../stores/gameStore'

interface PlayerAvatarProps {
  player: Player
  isCurrentPlayer?: boolean
  size?: 'sm' | 'md' | 'lg'
  showStatus?: boolean
  onClick?: () => void
}

const avatarEmojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😯', '😦', '😧',
  '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢'
]

export function PlayerAvatar({ 
  player, 
  isCurrentPlayer = false, 
  size = 'md', 
  showStatus = true,
  onClick 
}: PlayerAvatarProps) {
  // Generate consistent emoji based on player ID
  const emojiIndex = player.id.charCodeAt(0) % avatarEmojis.length
  const avatarEmoji = avatarEmojis[emojiIndex]

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  }

  const getStatusColor = () => {
    if (player.won) return 'ring-green-500 bg-green-100'
    if (player.eliminated) return 'ring-red-300 bg-red-100 opacity-60'
    if (isCurrentPlayer) return 'ring-blue-500 bg-blue-100'
    return 'ring-gray-300 bg-gray-100'
  }

  const getStatusIcon = () => {
    if (player.won) return '👑'
    if (player.eliminated) return '💀'
    if (isCurrentPlayer) return '⭐'
    return ''
  }

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Avatar Circle */}
      <div className={`${sizeClasses[size]} rounded-full ${getStatusColor()} ring-4 flex items-center justify-center shadow-md`}>
        <span className="select-none">{avatarEmoji}</span>
      </div>

      {/* Status Indicators */}
      {showStatus && (
        <>
          {/* Status Icon */}
          {getStatusIcon() && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md"
            >
              <span className="text-xs">{getStatusIcon()}</span>
            </motion.div>
          )}

          {/* Player Name */}
          <div className="mt-2 text-center">
            <div className={`font-semibold text-sm ${
              player.won ? 'text-green-600' : 
              player.eliminated ? 'text-red-600' : 
              isCurrentPlayer ? 'text-blue-600' : 'text-gray-700'
            }`}>
              {player.username}
            </div>
            
            {/* Status Text */}
            {showStatus && (
              <div className="text-xs text-gray-500 mt-1">
                {player.won ? 'Winner!' : 
                 player.eliminated ? 'Eliminated' : 
                 isCurrentPlayer ? 'You' : 'Active'}
              </div>
            )}
          </div>

          {/* Score/Attempts */}
          {player.guesses && (
            <div className="text-xs text-gray-500 text-center mt-1">
              {player.guesses.length}/6
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

// Player List Component
interface PlayerListProps {
  players: Player[]
  currentPlayer: string | null
  mode: 'duel' | 'battleRoyale'
  showAvatars?: boolean
}

export function PlayerList({ players, currentPlayer, mode, showAvatars = true }: PlayerListProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.won && !b.won) return -1
    if (!a.won && b.won) return 1
    if (a.eliminated && !b.eliminated) return 1
    if (!a.eliminated && b.eliminated) return -1
    return 0
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-xl font-bold mb-4 text-center">
        {mode === 'duel' ? '⚔️ Players' : '🏆 Survivors'}
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sortedPlayers.map((player) => (
          <PlayerAvatar
            key={player.id}
            player={player}
            isCurrentPlayer={player.id === currentPlayer}
            size="md"
            showStatus={true}
          />
        ))}
      </div>

      {/* Mode-specific info */}
      {mode === 'battleRoyale' && (
        <div className="mt-4 p-3 bg-purple-100 rounded-lg text-center">
          <div className="text-sm text-purple-800">
            <span className="font-semibold">
              {players.filter(p => !p.eliminated).length} active
            </span>
            {' • '}
            <span className="font-semibold">
              {players.filter(p => p.eliminated).length} eliminated
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
