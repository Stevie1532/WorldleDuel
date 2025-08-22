import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { apiService } from '../services/apiService'
import { useGameStore } from '../stores/gameStore'
import { ModeSelector } from '../components/ModeSelector'
import type { Room } from '../stores/gameStore'

export const Route = createFileRoute('/lobby')({
  component: LobbyPage
})

function LobbyPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [selectedMode, setSelectedMode] = useState<'duel' | 'battleRoyale'>('duel')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { setCurrentPlayer, setIsHost, setCurrentRoom, setMode } = useGameStore()

  const handleCreateRoom = async () => {
    if (!username.trim()) {
      setError('Please enter a username')
      return
    }

    setIsLoading(true)
    setError('')
    console.log('Creating room for username:', username.trim(), 'Mode:', selectedMode)

    try {
      const response = await apiService.createRoom({
        username: username.trim(),
        mode: selectedMode
      })
      console.log('Room created successfully:', response)
      
      setCurrentPlayer(username.trim())
      setIsHost(true)
      setMode(selectedMode)
      
      const newRoom: Room = {
        code: response.code,
        hostId: username.trim(),
        players: [{ 
          id: username.trim(), 
          username: username.trim(), 
          score: 0,
          eliminated: false,
          guesses: [],
          won: false
        }],
        solutionWord: null,
        status: 'waiting',
        mode: selectedMode,
        maxPlayers: selectedMode === 'duel' ? 2 : 8,
        gameStartTime: null,
        roundNumber: 1
      }
      
      setCurrentRoom(newRoom)
      
      console.log('Navigating to room:', response.code)
      navigate({ to: `/room/${response.code}` })
    } catch (err) {
      console.error('Error creating room:', err)
      setError('Failed to create room. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleJoinRoom = async () => {
    if (!username.trim() || !roomCode.trim()) {
      setError('Please enter both username and room code')
      return
    }

    setIsLoading(true)
    setError('')
    console.log('Joining room:', { username: username.trim(), code: roomCode.trim() })

    try {
      const response = await apiService.joinRoom(roomCode.trim().toUpperCase(), username.trim())
      console.log('Joined room successfully:', response)
      
      setCurrentPlayer(username.trim())
      setIsHost(false)
      setMode(response.room.mode)
      setCurrentRoom(response.room)
      navigate({ to: `/room/${roomCode.trim().toUpperCase()}` })
    } catch (err: any) {
      console.error('Error joining room:', err)
      setError(err.message || 'Failed to join room. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestAPI = async () => {
    console.log('Testing API...')
    try {
      const response = await fetch('http://localhost:3001/rooms')
      const data = await response.json()
      console.log('API test successful:', data)
      alert(`API working! Found ${data.total} rooms`)
    } catch (err: any) {
      console.error('API test failed:', err)
      alert('API test failed: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f4f1] text-black flex flex-col items-center justify-center font-serif px-4 py-8 sm:px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <h1 className="text-4xl font-black text-center mb-8">Join the Duel</h1>
        
        {/* Test API Button */}
        <button
          onClick={handleTestAPI}
          className="w-full mb-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          Test API Connection
        </button>
        
        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
            disabled={isLoading}
          />
        </div>

        {/* Game Mode Selection */}
        <ModeSelector
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
          disabled={isLoading}
        />

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Create Room Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 p-6 bg-white rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Create a New Room</h2>
          <div className="mb-4 text-center text-sm text-gray-600">
            {selectedMode === 'duel' ? '⚔️ 1v1 Duel Mode' : '🏆 Battle Royale Mode'}
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={isLoading}
            className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </button>
        </motion.div>

        {/* Join Room Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 bg-white rounded-lg shadow-md"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Join Existing Room</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a1a1a] focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isLoading}
            className="w-full bg-[#1a1a1a] text-white py-3 rounded-lg font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Joining...' : 'Join Room'}
          </button>
        </motion.div>

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={() => navigate({ to: '/' })}
          className="w-full mt-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  )
}
