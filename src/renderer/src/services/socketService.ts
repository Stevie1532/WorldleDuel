import { io, Socket } from 'socket.io-client';

// Socket service for managing Socket.IO connections and events
class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  // Get socket URL from environment variables
  private getSocketUrl(): string {
    return import.meta.env.VITE_SOCKET_URL || 
           (import.meta.env.DEV ? 'http://localhost:3001' : 'https://wordduel.com');
  }

  // Connect to Socket.IO server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socketUrl = this.getSocketUrl();
        console.log('Connecting to Socket.IO server:', socketUrl);
        
        this.socket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          maxReconnectionAttempts: 5,
          autoConnect: true
        });

        this.socket.on('connect', () => {
          console.log('Connected to Socket.IO server');
          this.isConnected = true;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from Socket.IO server:', reason);
          this.isConnected = false;
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('Reconnected to Socket.IO server after', attemptNumber, 'attempts');
          this.isConnected = true;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('Socket.IO reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
          console.error('Socket.IO reconnection failed');
          this.isConnected = false;
        });

      } catch (error) {
        console.error('Error creating Socket.IO connection:', error);
        reject(error);
      }
    });
  }

  // Disconnect from Socket.IO server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('Disconnected from Socket.IO server');
    }
  }

  // Join a room
  joinRoom(username: string, roomCode: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', { username, roomCode });
      console.log('Joining room:', { username, roomCode });
    } else {
      console.error('Cannot join room: Socket not connected');
    }
  }

  // Start a game
  startGame(roomCode: string, customWord?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('start-game', { roomCode, customWord });
      console.log('Starting game:', { roomCode, customWord });
    } else {
      console.error('Cannot start game: Socket not connected');
    }
  }

  // Submit a guess
  submitGuess(roomCode: string, username: string, guess: string, boardState: string[][], attemptNumber: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('submit-guess', { roomCode, username, guess, boardState, attemptNumber });
      console.log('Submitting guess:', { roomCode, username, guess, attemptNumber });
    } else {
      console.error('Cannot submit guess: Socket not connected');
    }
  }

  // Listen for room updates
  onRoomUpdated(callback: (room: any) => void): void {
    if (this.socket) {
      this.socket.on('room-updated', callback);
    }
  }

  // Listen for game started
  onGameStarted(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('game-started', callback);
    }
  }

  // Listen for guess submitted
  onGuessSubmitted(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('guess-submitted', callback);
    }
  }

  // Listen for game over
  onGameOver(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('game-over', callback);
    }
  }

  // Listen for game errors
  onGameError(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('game-error', callback);
    }
  }

  // Listen for player eliminated (Battle Royale mode)
  onPlayerEliminated(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('player-eliminated', callback);
    }
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Remove specific listener
  removeListener(event: string): void {
    if (this.socket) {
      this.socket.removeAllListeners(event);
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
