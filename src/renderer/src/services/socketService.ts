import { io, Socket } from 'socket.io-client';

// Socket service for managing Socket.IO connections and events
class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  // Get socket URL from environment variables with fallbacks
  private getSocketUrl(): string {
    return import.meta.env.VITE_SOCKET_URL || 
           (import.meta.env.DEV ? 'http://localhost:3001' : 'https://wordduel.com');
  }

  // Get socket configuration from environment
  private getSocketConfig() {
    return {
      transports: ['websocket', 'polling'] as string[],
      timeout: parseInt(import.meta.env.VITE_SOCKET_TIMEOUT || '20000'),
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS || '5'),
      reconnectionDelay: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY || '1000'),
      reconnectionDelayMax: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY_MAX || '5000'),
      maxReconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_MAX_RECONNECTION_ATTEMPTS || '5'),
      autoConnect: true,
      upgrade: true,
      rememberUpgrade: true
    };
  }

  // Connect to Socket.IO server
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socketUrl = this.getSocketUrl();
        const config = this.getSocketConfig();
        
        console.log('🔌 Attempting to connect to Socket.IO server:', socketUrl);
        console.log('⚙️ Socket configuration:', config);
        
        // If already connected, resolve immediately
        if (this.isConnected && this.socket) {
          console.log('✅ Already connected to Socket.IO server');
          resolve();
          return;
        }
        
        this.socket = io(socketUrl, config);

        this.socket.on('connect', () => {
          console.log('✅ Connected to Socket.IO server successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.IO connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from Socket.IO server:', reason);
          this.isConnected = false;
          
          // Handle reconnection for certain disconnect reasons
          if (reason === 'io server disconnect' || reason === 'io client disconnect') {
            console.log('🔄 Server disconnected, attempting to reconnect...');
            this.socket?.connect();
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log('🔄 Reconnected to Socket.IO server after', attemptNumber, 'attempts');
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        this.socket.on('reconnect_error', (error) => {
          console.error('❌ Socket.IO reconnection error:', error);
          this.reconnectAttempts++;
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            this.isConnected = false;
          }
        });

        this.socket.on('reconnect_failed', () => {
          console.error('❌ Socket.IO reconnection failed');
          this.isConnected = false;
        });

        this.socket.on('error', (error) => {
          console.error('❌ Socket.IO error:', error);
        });

        // Add timeout for connection
        setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏰ Socket connection timeout');
            reject(new Error('Socket connection timeout'));
          }
        }, 10000); // 10 second timeout

      } catch (error) {
        console.error('❌ Error creating Socket.IO connection:', error);
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
      this.reconnectAttempts = 0;
      console.log('Disconnected from Socket.IO server');
    }
  }

  // Join a room
  joinRoom(username: string, roomCode: string): void {
    if (this.socket && this.isConnected) {
      console.log('🚪 Joining room:', { username, roomCode });
      this.socket.emit('join-room', { username, roomCode });
    } else {
      console.error('❌ Cannot join room: Socket not connected');
      console.log('🔍 Socket status:', {
        socketExists: !!this.socket,
        isConnected: this.isConnected,
        connectionInfo: this.getConnectionInfo()
      });
      throw new Error('Socket not connected. Please try connecting again.');
    }
  }

  // Start a game
  startGame(roomCode: string, customWord?: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('start-game', { roomCode, customWord });
      console.log('Starting game:', { roomCode, customWord });
    } else {
      console.error('Cannot start game: Socket not connected');
      throw new Error('Socket not connected');
    }
  }

  // Submit a guess
  submitGuess(roomCode: string, username: string, guess: string, boardState: string[][], attemptNumber: number): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('submit-guess', { roomCode, username, guess, boardState, attemptNumber });
      console.log('Submitting guess:', { roomCode, username, guess, attemptNumber });
    } else {
      console.error('Cannot submit guess: Socket not connected');
      throw new Error('Socket not connected');
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

  // Get connection info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketUrl: this.getSocketUrl(),
      socketConfig: this.getSocketConfig(),
      socketExists: !!this.socket,
      socketId: this.socket?.id || 'N/A'
    };
  }

  // Check if socket is ready for operations
  isReady(): boolean {
    return this.isConnected && !!this.socket;
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

  // Force reconnection
  forceReconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
