import { create } from 'zustand'

export interface Player {
  id: string
  username: string
  score: number
  eliminated?: boolean
  guesses?: Array<{ word: string; attempt: number }>
  won?: boolean
}

export interface Room {
  code: string
  hostId: string
  players: Player[]
  solutionWord: string | null
  status: 'waiting' | 'playing' | 'finished'
  mode: 'duel' | 'battleRoyale'
  maxPlayers: number
  gameStartTime?: Date | null
  roundNumber?: number
}

// Game board tile interface
export interface GameTile {
  letter: string
  status: 'correct' | 'present' | 'absent' | 'unused'
}

export interface GameState {
  currentRoom: Room | null
  currentPlayer: string | null
  isHost: boolean
  gameBoard: GameTile[][]
  currentGuess: string
  gameStatus: 'waiting' | 'playing' | 'finished'
  winner: string | null
  mode: 'duel' | 'battleRoyale'
  eliminatedPlayers: string[]
  activePlayers: Player[]
}

export interface GameActions {
  setCurrentRoom: (room: Room) => void
  setCurrentPlayer: (username: string) => void
  setIsHost: (isHost: boolean) => void
  updateGameBoard: (board: GameTile[][]) => void
  setCurrentGuess: (guess: string) => void
  setGameStatus: (status: 'waiting' | 'playing' | 'finished') => void
  setWinner: (winner: string | null) => void
  setMode: (mode: 'duel' | 'battleRoyale') => void
  setEliminatedPlayers: (players: string[]) => void
  setActivePlayers: (players: Player[]) => void
  resetGame: () => void
  addPlayer: (player: Player) => void
  removePlayer: (playerId: string) => void
  updatePlayer: (playerId: string, updates: Partial<Player>) => void
  eliminatePlayer: (playerId: string) => void
}

export const useGameStore = create<GameState & GameActions>((set) => ({
  // Initial state
  currentRoom: null,
  currentPlayer: null,
  isHost: false,
  gameBoard: Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: 'unused' as const })),
  currentGuess: '',
  gameStatus: 'waiting',
  winner: null,
  mode: 'duel',
  eliminatedPlayers: [],
  activePlayers: [],

  // Actions
  setCurrentRoom: (room) => set({ 
    currentRoom: room,
    mode: room.mode,
    gameStatus: room.status,
    activePlayers: room.players.filter(p => !p.eliminated),
    eliminatedPlayers: room.players.filter(p => p.eliminated).map(p => p.id)
  }),

  setCurrentPlayer: (username) => set({ currentPlayer: username }),

  setIsHost: (isHost) => set({ isHost }),

  updateGameBoard: (board) => set({ gameBoard: board }),

  setCurrentGuess: (guess) => set({ currentGuess: guess }),

  setGameStatus: (status) => set({ gameStatus: status }),

  setWinner: (winner) => set({ winner }),

  setMode: (mode) => set({ mode }),

  setEliminatedPlayers: (players) => set({ eliminatedPlayers: players }),

  setActivePlayers: (players) => set({ activePlayers: players }),

  resetGame: () => set({
    gameBoard: Array(6).fill(null).map(() => Array(5).fill({ letter: '', status: 'unused' as const })),
    currentGuess: '',
    gameStatus: 'waiting',
    winner: null,
    eliminatedPlayers: [],
    activePlayers: []
  }),

  addPlayer: (player) => set((state) => ({
    activePlayers: [...state.activePlayers, player]
  })),

  removePlayer: (playerId) => set((state) => ({
    activePlayers: state.activePlayers.filter(p => p.id !== playerId)
  })),

  updatePlayer: (playerId, updates) => set((state) => ({
    activePlayers: state.activePlayers.map(p => 
      p.id === playerId ? { ...p, ...updates } : p
    )
  })),

  eliminatePlayer: (playerId) => set((state) => ({
    eliminatedPlayers: [...state.eliminatedPlayers, playerId],
    activePlayers: state.activePlayers.filter(p => p.id !== playerId)
  }))
}))
