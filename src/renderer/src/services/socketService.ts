import { io, Socket } from 'socket.io-client';

// Socket service for managing Socket.IO connections and events
class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionPromise: Promise<void> | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;

  // Get socket URL from environment variables with fallbacks
  private getSocketUrl(): string {
    const url = import.meta.env.VITE_SOCKET_URL || 
                (import.meta.env.DEV ? 'http://localhost:3001' : 'https://wordleduel.onrender.com');
    
    // Ensure URL doesn't have trailing slash for consistency
    return url.replace(/\/$/, '');
  }

  // Get socket configuration from environment
  private getSocketConfig() {
    return {
      transports: ['websocket', 'polling'] as string[],
      timeout: parseInt(import.meta.env.VITE_SOCKET_TIMEOUT || '20000'),
      forceNew: false, // Changed to false to allow connection reuse
      reconnection: true,
      reconnectionAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_ATTEMPTS || '5'),
      reconnectionDelay: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY || '1000'),
      reconnectionDelayMax: parseInt(import.meta.env.VITE_SOCKET_RECONNECTION_DELAY_MAX || '5000'),
      autoConnect: true, // Changed back to true for better UX
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: false, // Add explicit CORS setting
    };
  }

  // Clear connection timeout
  private clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  // Connect to Socket.IO server
  connect(): Promise<void> {
    // If there's already a connection attempt in progress, return it
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, resolve immediately
    if (this.isConnected && this.socket?.connected) {
      console.log('✅ Already connected to Socket.IO server');
      return Promise.resolve();
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const socketUrl = this.getSocketUrl();
        const config = this.getSocketConfig();
        
        console.log('🔌 Attempting to connect to Socket.IO server:', socketUrl);
        console.log('⚙️ Socket configuration:', config);
        
        // Clean up existing socket if it exists but is not connected
        if (this.socket && !this.socket.connected) {
          console.log('🔄 Cleaning up existing disconnected socket...');
          this.cleanupSocket();
        }
        
        // Create new socket connection
        this.socket = io(socketUrl, config);

        // Set up connection timeout with proper cleanup
        this.connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            console.error('⏰ Socket connection timeout after 15 seconds');
            this.cleanupSocket();
            this.connectionPromise = null;
            reject(new Error('Connection timeout - server may be unavailable. Please check your internet connection and try again.'));
          }
        }, 15000);

        // Connection successful
        this.socket.on('connect', () => {
          console.log('✅ Connected to Socket.IO server successfully');
          console.log('🆔 Socket ID:', this.socket?.id);
          
          this.clearConnectionTimeout();
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.connectionPromise = null;
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error('❌ Socket.IO connection error:', error.message || error);
          console.error('🔍 Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
          });
          
          this.clearConnectionTimeout();
          this.isConnected = false;
          this.connectionPromise = null;
          
          // Provide more helpful error messages
          let errorMessage = 'Connection failed';
          if (error.message?.includes('ECONNREFUSED')) {
            errorMessage = 'Server is not responding. Please try again later.';
          } else if (error.message?.includes('timeout')) {
            errorMessage = 'Connection timed out. Please check your internet connection.';
          } else if (error.message?.includes('CORS')) {
            errorMessage = 'Cross-origin request blocked. Please contact support.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          reject(new Error(errorMessage));
        });

        // Disconnection handling
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 Disconnected from Socket.IO server:', reason);
          
          this.isConnected = false;
          
          // Handle different disconnect reasons
          if (reason === 'io server disconnect') {
            console.log('🔄 Server initiated disconnect - will attempt to reconnect');
          } else if (reason === 'io client disconnect') {
            console.log('📝 Client initiated disconnect - no auto-reconnection');
          } else if (reason === 'ping timeout') {
            console.log('⏰ Connection lost due to ping timeout - will attempt to reconnect');
          } else if (reason === 'transport close') {
            console.log('🚪 Transport connection closed - will attempt to reconnect');
          }
        });

        // Successful reconnection
        this.socket.on('reconnect', (attemptNumber) => {
          console.log('🔄 Reconnected to Socket.IO server after', attemptNumber, 'attempts');
          console.log('🆔 New Socket ID:', this.socket?.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        // Reconnection attempt
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log('🔄 Reconnection attempt', attemptNumber, 'of', this.maxReconnectAttempts);
          this.reconnectAttempts = attemptNumber;
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
          console.error('❌ All reconnection attempts failed');
          this.isConnected = false;
        });

        // General socket errors
        this.socket.on('error', (error) => {
          console.error('❌ Socket.IO error:', error);
        });

      } catch (error) {
        console.error('❌ Error creating Socket.IO connection:', error);
        this.clearConnectionTimeout();
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  // Clean up socket connection
  private cleanupSocket(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.clearConnectionTimeout();
  }

  // Disconnect from Socket.IO server
  disconnect(): void {
    console.log('🔌 Manually disconnecting from Socket.IO server');
    this.cleanupSocket();
    this.reconnectAttempts = 0;
    this.connectionPromise = null;
    console.log('✅ Disconnected from Socket.IO server');
  }

  // Ensure connection before performing operations
  private async ensureConnection(): Promise<void> {
    if (!this.isReady()) {
      console.log('🔄 Socket not ready, attempting to connect...');
      await this.connect();
    }
  }

  // Join a room
  async joinRoom(username: string, roomCode: string): Promise<void> {
    try {
      await this.ensureConnection();
      
      if (!this.socket || !this.isConnected) {
        throw new Error('Failed to establish socket connection');
      }

      console.log('🚪 Joining room:', { username, roomCode });
      this.socket.emit('join-room', { username, roomCode });
      
    } catch (error) {
      console.error('❌ Cannot join room:', error);
      throw new Error(`Failed to join room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Start a game
  async startGame(roomCode: string, customWord?: string): Promise<void> {
    try {
      await this.ensureConnection();
      
      if (!this.socket || !this.isConnected) {
        throw new Error('Failed to establish socket connection');
      }

      console.log('🎮 Starting game:', { roomCode, customWord });
      this.socket.emit('start-game', { roomCode, customWord });
      
    } catch (error) {
      console.error('❌ Cannot start game:', error);
      throw new Error(`Failed to start game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Submit a guess
  async submitGuess(roomCode: string, username: string, guess: string, boardState: string[][], attemptNumber: number): Promise<void> {
    try {
      await this.ensureConnection();
      
      if (!this.socket || !this.isConnected) {
        throw new Error('Failed to establish socket connection');
      }

      console.log('📝 Submitting guess:', { roomCode, username, guess, attemptNumber });
      this.socket.emit('submit-guess', { roomCode, username, guess, boardState, attemptNumber });
      
    } catch (error) {
      console.error('❌ Cannot submit guess:', error);
      throw new Error(`Failed to submit guess: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Event listeners - these don't need connection checks since they're just setting up handlers
  onRoomUpdated(callback: (room: any) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized for room updates listener');
      return () => {}; // Return empty cleanup function
    }
    this.socket.on('room-updated', callback);
    return () => this.socket?.off('room-updated', callback);
  }

  onGameStarted(callback: (data: any) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized for game started listener');
      return () => {};
    }
    this.socket.on('game-started', callback);
    return () => this.socket?.off('game-started', callback);
  }

  onGuessSubmitted(callback: (data: any) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized for guess submitted listener');
      return () => {};
    }
    this.socket.on('guess-submitted', callback);
    return () => this.socket?.off('guess-submitted', callback);
  }

  onGameOver(callback: (data: any) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized for game over listener');
      return () => {};
    }
    this.socket.on('game-over', callback);
    return () => this.socket?.off('game-over', callback);
  }

  onGameError(callback: (data: any) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized for game error listener');
      return () => {};
    }
    this.socket.on('game-error', callback);
    return () => this.socket?.off('game-error', callback);
  }

  onPlayerEliminated(callback: (data: any) => void): () => void {
    if (!this.socket) {
      console.warn('⚠️ Socket not initialized for player eliminated listener');
      return () => {};
    }
    this.socket.on('player-eliminated', callback);
    return () => this.socket?.off('player-eliminated', callback);
  }

  // Get connection info
  getConnectionInfo() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      socketUrl: this.getSocketUrl(),
      socketExists: !!this.socket,
      socketId: this.socket?.id || 'N/A',
      socketConnected: this.socket?.connected || false,
      hasConnectionPromise: !!this.connectionPromise
    };
  }

  // Check if socket is ready for operations
  isReady(): boolean {
    return this.isConnected && !!this.socket && this.socket.connected;
  }

  // Get connection status
  getConnectionStatus(): boolean {
    return this.isConnected && !!this.socket?.connected;
  }

  // Debug connection state
  debugConnection(): void {
    console.log('🔍 Socket Connection Debug Info:');
    const info = this.getConnectionInfo();
    Object.entries(info).forEach(([key, value]) => {
      console.log(`  - ${key}:`, value);
    });
  }

  // Get socket instance (use with caution)
  getSocket(): Socket | null {
    return this.socket;
  }

  // Remove all listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      console.log('🧹 Removed all socket listeners');
    }
  }

  // Remove specific listener
  removeListener(event: string): void {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      console.log(`🧹 Removed listeners for event: ${event}`);
    }
  }

  // Manual reconnection with proper cleanup
  async reconnect(): Promise<void> {
    console.log('🔄 Manual reconnection requested');
    
    // Clean up existing connection
    this.cleanupSocket();
    this.connectionPromise = null;
    this.reconnectAttempts = 0;
    
    // Attempt new connection
    try {
      await this.connect();
      console.log('✅ Manual reconnection successful');
    } catch (error) {
      console.error('❌ Manual reconnection failed:', error);
      throw error;
    }
  }

  // Test backend connectivity
  async testBackendConnectivity(): Promise<{ success: boolean; error?: string; details?: any }> {
    const socketUrl = this.getSocketUrl();
    console.log('🧪 Testing backend connectivity to:', socketUrl);
    
    try {
      const healthUrl = `${socketUrl}/health`;
      console.log('🏥 Testing health endpoint:', healthUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        console.log('✅ Backend health check successful:', data);
        return { success: true, details: { status: response.status, data } };
      } else {
        console.error('❌ Backend health check failed:', response.status, response.statusText);
        return { 
          success: false, 
          error: `Health check failed: ${response.status} ${response.statusText}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }
    } catch (error) {
      console.error('❌ Backend connectivity test failed:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: error
      };
    }
  }

  // Test Socket.IO specific connectivity
  async testSocketIOConnectivity(): Promise<{ success: boolean; error?: string; details?: any }> {
    const socketUrl = this.getSocketUrl();
    console.log('🔌 Testing Socket.IO connectivity to:', socketUrl);
    
    try {
      const socketIOUrl = `${socketUrl}/socket.io/`;
      console.log('🔌 Testing Socket.IO endpoint:', socketIOUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(socketIOUrl, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('🔌 Socket.IO endpoint response:', response.status, response.statusText);
      
      // Socket.IO endpoint typically returns 400 for GET requests, which is expected
      if (response.status < 500) {
        console.log('✅ Socket.IO endpoint is reachable');
        return { 
          success: true, 
          details: { 
            status: response.status, 
            statusText: response.statusText,
            note: response.status === 400 ? 'Expected 400 response for GET request' : undefined
          } 
        };
      } else {
        console.error('❌ Socket.IO endpoint error:', response.status, response.statusText);
        return { 
          success: false, 
          error: `Socket.IO endpoint error: ${response.status} ${response.statusText}`,
          details: { status: response.status, statusText: response.statusText }
        };
      }
    } catch (error) {
      console.error('❌ Socket.IO connectivity test failed:', error);
      
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        error: errorMessage,
        details: error
      };
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;