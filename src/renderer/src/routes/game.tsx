import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { socketService } from '../services/socketService'

export const Route = createFileRoute('/game')({
  component: GamePage
})

function GamePage() {
  const navigate = useNavigate()
  const [currentGuess, setCurrentGuess] = useState('')
  const [guesses, setGuesses] = useState<string[]>([])
  const [evaluations, setEvaluations] = useState<('correct' | 'present' | 'absent')[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  
  const { 
    currentRoom, 
    currentPlayer, 
    gameBoard, 
    updateGameBoard,
    setWinner,
    setGameStatus 
  } = useGameStore()

  useEffect(() => {
    if (!currentRoom) {
      navigate({ to: '/lobby' })
      return
    }

    // Listen for game events
    socketService.onGuessSubmitted((data) => {
      if (data.username !== currentPlayer) {
        // Update board for other player's guess
        const newGuesses = [...guesses, data.guess]
        setGuesses(newGuesses)
        
        // Evaluate the guess
        const evaluation = evaluateGuess(data.guess, currentRoom.solutionWord)
        setEvaluations([...evaluations, evaluation])
      }
    })

    socketService.onGameOver((data) => {
      setGameOver(true)
      setWinner(data.winner)
      setGameStatus('finished')
      setMessage(data.winner === currentPlayer ? 'Congratulations! You won!' : `Game Over! ${data.winner} won!`)
    })

    return () => {
      socketService.off('guess-submitted')
      socketService.off('game-over')
    }
  }, [currentRoom, currentPlayer, guesses, evaluations, navigate, setWinner, setGameStatus])

  const evaluateGuess = (guess: string, solution: string): ('correct' | 'present' | 'absent')[] => {
    const evaluation: ('correct' | 'present' | 'absent')[] = []
    const solutionArray = solution.split('')
    const guessArray = guess.split('')
    
    // First pass: mark correct letters
    for (let i = 0; i < 5; i++) {
      if (guessArray[i] === solutionArray[i]) {
        evaluation[i] = 'correct'
        solutionArray[i] = '' // Mark as used
      }
    }
    
    // Second pass: mark present and absent letters
    for (let i = 0; i < 5; i++) {
      if (evaluation[i] === 'correct') continue
      
      const letterIndex = solutionArray.indexOf(guessArray[i])
      if (letterIndex !== -1) {
        evaluation[i] = 'present'
        solutionArray[letterIndex] = '' // Mark as used
      } else {
        evaluation[i] = 'absent'
      }
    }
    
    return evaluation
  }

  const handleKeyPress = useCallback((key: string) => {
    if (gameOver) return
    
    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key)
    }
  }, [currentGuess, gameOver])

  const submitGuess = () => {
    if (currentGuess.length !== 5 || !currentRoom) return
    
    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    
    // Evaluate the guess
    const evaluation = evaluateGuess(currentGuess, currentRoom.solutionWord)
    setEvaluations([...evaluations, evaluation])
    
    // Submit to server
    socketService.submitGuess(currentRoom.code, currentPlayer, currentGuess, gameBoard)
    
    // Check if won
    if (currentGuess === currentRoom.solutionWord) {
      setGameOver(true)
      setWinner(currentPlayer)
      setGameStatus('finished')
      setMessage('Congratulations! You won!')
    } else if (newGuesses.length >= 6) {
      setGameOver(true)
      setGameStatus('finished')
      setMessage(`Game Over! The word was ${currentRoom.solutionWord}`)
    }
    
    setCurrentGuess('')
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      handleKeyPress(key)
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  if (!currentRoom) {
    return <div>Loading...</div>
  }

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  const getKeyStatus = (key: string) => {
    for (let i = 0; i < evaluations.length; i++) {
      for (let j = 0; j < evaluations[i].length; j++) {
        if (guesses[i][j] === key) {
          return evaluations[i][j]
        }
      }
    }
    return 'unused'
  }

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black font-serif px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Word Duel</h1>
          <p className="text-gray-600">Room: {currentRoom.code}</p>
        </div>

        {/* Game Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-5 gap-2 mb-4">
            {Array.from({ length: 6 }, (_, row) => (
              Array.from({ length: 5 }, (_, col) => {
                const letter = row < guesses.length ? guesses[row][col] : 
                             row === guesses.length ? currentGuess[col] : ''
                const evaluation = row < evaluations.length ? evaluations[row][col] : undefined
                
                return (
                  <motion.div
                    key={`${row}-${col}`}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (row * 5 + col) * 0.1 }}
                    className={`
                      w-16 h-16 border-2 border-gray-300 flex items-center justify-center text-2xl font-bold
                      ${evaluation === 'correct' ? 'bg-green-500 text-white border-green-500' :
                        evaluation === 'present' ? 'bg-yellow-500 text-white border-yellow-500' :
                        evaluation === 'absent' ? 'bg-gray-500 text-white border-gray-500' :
                        letter ? 'border-gray-400' : 'border-gray-300'
                      }
                    `}
                  >
                    {letter}
                  </motion.div>
                )
              })
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6 p-3 bg-blue-100 text-blue-800 rounded-lg"
          >
            {message}
          </motion.div>
        )}

        {/* On-screen Keyboard */}
        <div className="space-y-2">
          {keyboardRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1">
              {row.map((key) => {
                const status = getKeyStatus(key)
                const isSpecial = key === 'ENTER' || key === 'BACKSPACE'
                
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    disabled={gameOver}
                    className={`
                      px-3 py-4 rounded font-semibold text-sm min-w-[40px]
                      ${isSpecial ? 'px-4' : ''}
                      ${status === 'correct' ? 'bg-green-500 text-white' :
                        status === 'present' ? 'bg-yellow-500 text-white' :
                        status === 'absent' ? 'bg-gray-500 text-white' :
                        'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }
                      disabled:opacity-50 transition-colors
                    `}
                  >
                    {key === 'BACKSPACE' ? '⌫' : key}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Game Controls */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => navigate({ to: '/results' })}
              className="bg-[#1a1a1a] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#333] transition-colors"
            >
              View Results
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
