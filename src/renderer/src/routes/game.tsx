import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { socketService } from '../services/socketService'
import { GameBoard } from '../components/GameBoard'
import { Keyboard } from '../components/Keyboard'
import { GameTimer } from '../components/GameTimer'

export const Route = createFileRoute('/game')({
  component: GamePage
})

function GamePage() {
  const navigate = useNavigate()
  const {
    currentRoom,
    currentPlayer,
    gameBoard,
    currentGuess,
    gameStatus,
    updateGameBoard,
    setCurrentGuess,
    setGameStatus
  } = useGameStore()

  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!currentRoom || gameStatus !== 'playing') {
      navigate({ to: '/lobby' })
      return
    }

    // Connect to socket
    const connectToGame = async () => {
      try {
        await socketService.connect()
        setIsConnected(true)
        setGameStarted(true)
      } catch (error) {
        console.error('Failed to connect to game:', error)
        setError('Failed to connect to game server')
        setIsConnected(false)
      }
    }

    connectToGame()

    // Listen for game updates
    socketService.onGuessSubmitted((data) => {
      if (data.roomCode === currentRoom.code) {
        // Update game board with new guess
        const newBoard = [...gameBoard]
        if (data.attemptNumber < newBoard.length) {
          newBoard[data.attemptNumber] = data.boardState.map(tile => ({
            letter: tile.letter,
            status: tile.status
          }))
          updateGameBoard(newBoard)
        }
      }
    })

    // Listen for game over
    socketService.onGameOver((data) => {
      if (data.roomCode === currentRoom.code) {
        setGameStatus('finished')
        navigate({ to: '/results' })
      }
    })

    return () => {
      socketService.disconnect()
    }
  }, [currentRoom, gameStatus, navigate, gameBoard, updateGameBoard, setGameStatus])

  const handleKeyPress = (key: string) => {
    if (gameStatus !== 'playing' || !gameStarted) return

    if (key === 'ENTER') {
      submitGuess()
    } else if (key === 'BACKSPACE') {
      setCurrentGuess(currentGuess.slice(0, -1))
    } else if (key.length === 1 && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + key.toUpperCase())
    }
  }

  const submitGuess = async () => {
    if (currentGuess.length !== 5 || !currentRoom || !currentPlayer) return

    try {
      const attemptNumber = gameBoard.findIndex(row => row.every(tile => tile.letter === ''))
      if (attemptNumber === -1) return

      await socketService.submitGuess(
        currentRoom.code,
        currentPlayer,
        currentGuess,
        gameBoard.map(row => row.map(tile => tile.letter)),
        attemptNumber
      )

      // Clear current guess
      setCurrentGuess('')
    } catch (error) {
      console.error('Failed to submit guess:', error)
      setError('Failed to submit guess. Please try again.')
    }
  }

  if (!currentRoom || gameStatus !== 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Game Not Ready</h1>
          <p className="text-gray-600 mb-6">Please wait for the game to start or return to the lobby.</p>
          <button
            onClick={() => navigate({ to: '/lobby' })}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 Word Duel</h1>
          <p className="text-gray-600">Room: {currentRoom.code} • Mode: {currentRoom.mode}</p>
          
          {/* Connection Status */}
          <div className="mt-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {/* Game Timer */}
          <GameTimer 
            startTime={new Date()}
            isActive={gameStatus === 'playing'}
            mode={currentRoom.mode}
          />
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <GameBoard />
        </motion.div>

        {/* Current Guess Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <div className="text-2xl font-mono text-gray-800 mb-2">
            {currentGuess.padEnd(5, '_').split('').map((char, index) => (
              <span key={index} className="inline-block w-8 h-8 border-2 border-gray-300 mx-1 rounded flex items-center justify-center">
                {char === '_' ? '' : char}
              </span>
            ))}
          </div>
          <p className="text-gray-600">Type your guess and press Enter</p>
        </motion.div>

        {/* Virtual Keyboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Keyboard onKeyPress={handleKeyPress} />
        </motion.div>

        {/* Game Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate({ to: '/results' })}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors mr-4"
          >
            View Results
          </button>
          <button
            onClick={() => navigate({ to: '/lobby' })}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Back to Lobby
          </button>
        </motion.div>
      </div>
    </div>
  )
}
