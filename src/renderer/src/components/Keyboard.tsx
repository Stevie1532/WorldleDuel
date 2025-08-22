import { motion } from 'framer-motion'

interface KeyboardProps {
  onKeyPress: (key: string) => void
}

export function Keyboard({ onKeyPress }: KeyboardProps) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  const getKeyClass = (key: string) => {
    const baseClass = 'px-3 py-4 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95'
    
    if (key === 'ENTER') {
      return `${baseClass} bg-green-500 text-white hover:bg-green-600`
    }
    
    if (key === 'BACKSPACE') {
      return `${baseClass} bg-red-500 text-white hover:bg-red-600`
    }
    
    return `${baseClass} bg-gray-200 text-gray-800 hover:bg-gray-300`
  }

  return (
    <div className="max-w-2xl mx-auto">
      {rows.map((row, rowIndex) => (
        <motion.div
          key={rowIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + rowIndex * 0.1 }}
          className="flex justify-center gap-2 mb-2"
        >
          {row.map((key) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onKeyPress(key)}
              className={getKeyClass(key)}
            >
              {key === 'BACKSPACE' ? '⌫' : key}
            </motion.button>
          ))}
        </motion.div>
      ))}
    </div>
  )
}
