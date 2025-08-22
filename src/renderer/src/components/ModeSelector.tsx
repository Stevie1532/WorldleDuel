import { motion } from 'framer-motion'

interface ModeSelectorProps {
  selectedMode: 'duel' | 'battleRoyale'
  onModeChange: (mode: 'duel' | 'battleRoyale') => void
  disabled?: boolean
}

export function ModeSelector({ selectedMode, onModeChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-3 text-center">Select Game Mode</label>
      <div className="flex gap-3">
        {/* Duel Mode */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onModeChange('duel')}
          disabled={disabled}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedMode === 'duel'
              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-center">
            <div className="text-lg font-bold mb-1">⚔️ 1v1 Duel</div>
            <div className="text-sm opacity-80">Face off against one opponent</div>
            <div className="text-xs mt-2 opacity-60">Max 2 players</div>
          </div>
        </motion.button>

        {/* Battle Royale Mode */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          onClick={() => !disabled && onModeChange('battleRoyale')}
          disabled={disabled}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            selectedMode === 'battleRoyale'
              ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="text-center">
            <div className="text-lg font-bold mb-1">🏆 Battle Royale</div>
            <div className="text-sm opacity-80">Last player standing wins</div>
            <div className="text-xs mt-2 opacity-60">Up to 8 players</div>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
