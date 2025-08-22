import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import type { GameTile } from '../stores/gameStore'

export function GameBoard() {
  const { gameBoard } = useGameStore()

  const getTileColor = (status: GameTile['status']) => {
    switch (status) {
      case 'correct':
        return 'bg-green-500 text-white'
      case 'present':
        return 'bg-yellow-500 text-white'
      case 'absent':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-white text-gray-800 border-2 border-gray-300'
    }
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-rows-6 gap-2">
        {gameBoard.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.1 }}
            className="flex gap-2"
          >
            {row.map((tile, colIndex) => (
              <motion.div
                key={colIndex}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: rowIndex * 0.1 + colIndex * 0.05 }}
                className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded-lg shadow-md transition-all duration-300 ${getTileColor(tile.status)}`}
              >
                {tile.letter}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
