import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { socketService } from '../services/socketService'
import { PlayerList } from '../components/PlayerAvatar'
import { CustomWordInput } from '../components/CustomWordInput'
import { GameTimer } from '../components/GameTimer'
import { CountdownTimer } from '../components/GameTimer'
import { Leaderboard } from '../components/Leaderboard'

export const Route = createFileRoute('/room/$code')({
  component: RoomPage
})

function RoomPage() {
  const navigate = useNavigate()
  const { code } = Route.useParams()
  const {
    currentRoom,
    currentPlayer,
    isHost,
    gameStatus,
    setCurrentRoom,
    setGameStatus
  } = useGameStore()

  const [customWord, setCustomWord] = useState('')
  const [isStarting, setIsStarting] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [error, setError] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!currentRoom || currentRoom.code !== code) {
      // Try to join the room if not already in it
      navigate({ to: '/lobby' })
      return
    }

    // Connect to socket and join room
    const connectAndJoin = async () => {
      try {
        // Connect to socket first
        await socketService.connect()
        setIsConnected(true)
        
        // Then join the room
        socketService.joinRoom(currentPlayer || 'Anonymous', code)
      } catch (error) {
        console.error('Failed to connect to socket:', error)
        setError('Failed to connect to game server. Please try again.')
        setIsConnected(false)
      }
    }

    connectAndJoin()

    // Listen for room updates
    socketService.onRoomUpdated((room) => {
      setCurrentRoom(room)
    })

    // Listen for game start
    socketService.onGameStarted((_data) => {
      setGameStatus('playing')
      setShowCountdown(false)
      navigate({ to: '/results' })
    })

    // Listen for game errors
    socketService.onGameError((error) => {
      setError(error.message)
      setTimeout(() => setError(''), 5000)
    })

    return () => {
      socketService.disconnect()
    }
  }, [code, currentRoom, currentPlayer, navigate, setCurrentRoom, setGameStatus])

  const handleStartGame = async () => {
    if (!currentRoom) return

    setIsStarting(true)
    setError('')

    try {
      if (customWord.trim()) {
        // Start with custom word
        socketService.startGame(code, customWord.trim().toUpperCase())
      } else {
        // Start with random word
        socketService.startGame(code)
      }
      
      // Show countdown before starting
      setShowCountdown(true)
    } catch (err) {
      setError('Failed to start game. Please try again.')
    } finally {
      setIsStarting(false)
    }
  }

  const handleCountdownComplete = () => {
    setShowCountdown(false)
    // Game will start automatically via socket event
  }

  const handleCustomWordSubmit = (word: string) => {
    setCustomWord(word)
  }

  const handleRandomWord = () => {
    setCustomWord('')
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-[#f4f4f1] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Loading room...</div>
          <div className="text-gray-600">Please wait while we connect you to the room.</div>
        </div>
      </div>
    )
  }

  if (showCountdown) {
    return (
      <div className="min-h-screen bg-[#f4f4f1] flex items-center justify-center">
        <CountdownTimer
          seconds={3}
          onComplete={handleCountdownComplete}
          label="Game starting in"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black font-serif">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-black mb-2">
            {currentRoom.mode === 'duel' ? '⚔️ Duel Room' : '🏆 Battle Royale Room'}
          </h1>
          <div className="text-xl text-gray-600 mb-4">
            Room Code: <span className="font-mono font-bold text-[#1a1a1a]">{code}</span>
          </div>
          <div className="text-lg text-gray-700">
            {currentRoom.mode === 'duel' ? 'Face off against one opponent' : 'Last player standing wins'}
          </div>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
        >
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected to Game Server' : 'Disconnected from Game Server'}
          </div>
          
          {!isConnected && (
            <button
              onClick={async () => {
                try {
                  await socketService.connect()
                  setIsConnected(true)
                  socketService.joinRoom(currentPlayer || 'Anonymous', code)
                } catch (error) {
                  console.error('Reconnection failed:', error)
                  setError('Failed to reconnect. Please refresh the page.')
                }
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              🔄 Reconnect
            </button>
          )}
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Game Controls & Info */}
          <div className="space-y-6">
            {/* Game Timer */}
            <GameTimer
              startTime={currentRoom.gameStartTime || null}
              isActive={gameStatus === 'playing'}
              mode={currentRoom.mode}
            />

            {/* Host Controls */}
            {isHost && gameStatus === 'waiting' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CustomWordInput
                  onWordSubmit={handleCustomWordSubmit}
                  onRandomWord={handleRandomWord}
                  disabled={isStarting}
                  isLoading={isStarting}
                />

                <div className="text-center">
                  <button
                    onClick={handleStartGame}
                    disabled={isStarting || currentRoom.players.length < 2}
                    className="px-8 py-4 bg-[#1a1a1a] text-white rounded-lg font-bold text-lg hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isStarting ? 'Starting...' : '🚀 Start Game'}
                  </button>
                  
                  {currentRoom.players.length < 2 && (
                    <div className="mt-2 text-sm text-gray-600">
                      Waiting for more players... ({currentRoom.players.length}/{currentRoom.maxPlayers})
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Guest Waiting Message */}
            {!isHost && gameStatus === 'waiting' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
              >
                <div className="text-2xl mb-2">⏳</div>
                <div className="text-lg font-semibold text-blue-800 mb-2">
                  Waiting for host to start the game...
                </div>
                <div className="text-blue-600">
                  The host will choose a word and start the game when ready.
                </div>
              </motion.div>
            )}

            {/* Game Status */}
            {gameStatus === 'playing' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
              >
                <div className="text-2xl mb-2">🎮</div>
                <div className="text-lg font-semibold text-green-800 mb-2">
                  Game in Progress!
                </div>
                <div className="text-green-600">
                  Navigate to the game page to start playing.
                </div>
                <button
                  onClick={() => navigate({ to: '/results' })}
                  className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Go to Game
                </button>
              </motion.div>
            )}
          </div>

          {/* Right Column - Players & Stats */}
          <div className="space-y-6">
            {/* Player List */}
            <PlayerList
              players={currentRoom.players}
              currentPlayer={currentPlayer}
              mode={currentRoom.mode}
            />

            {/* Leaderboard */}
            <Leaderboard
              players={currentRoom.players}
              mode={currentRoom.mode}
              showStats={false}
            />

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-xl font-bold mb-4 text-center">📊 Room Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {currentRoom.players.length}
                  </div>
                  <div className="text-sm text-gray-600">Players</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {currentRoom.maxPlayers}
                  </div>
                  <div className="text-sm text-gray-600">Max Players</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {currentRoom.mode === 'duel' ? '⚔️' : '🏆'}
                  </div>
                  <div className="text-sm text-gray-600">Game Mode</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800">
                    {gameStatus === 'waiting' ? '⏳' : gameStatus === 'playing' ? '🎮' : '🏁'}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => navigate({ to: '/lobby' })}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Back to Lobby
          </button>
        </motion.div>
      </div>
    </div>
  )
}
