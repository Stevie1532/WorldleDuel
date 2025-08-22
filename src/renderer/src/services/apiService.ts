// API service for making HTTP requests to the backend
// Supports both development and production environments

// Environment configuration with fallbacks
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// API URLs with environment-specific fallbacks
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (isDevelopment ? 'http://localhost:3001/api/v1' : 'https://wordleduel.onrender.com/api/v1');

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (isDevelopment ? 'http://localhost:3001' : 'https://wordleduel.onrender.com');

const HEALTH_CHECK_URL = import.meta.env.VITE_HEALTH_CHECK_URL ||
  (isDevelopment ? 'http://localhost:3001/health' : 'https://wordleduel.onrender.com/health');

// Feature flags from environment
const FEATURE_FLAGS = {
  analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  leaderboards: import.meta.env.VITE_ENABLE_LEADERBOARDS === 'true',
  tournaments: import.meta.env.VITE_ENABLE_TOURNAMENTS === 'true',
  maintenance: import.meta.env.VITE_MAINTENANCE_MODE === 'true'
};

// Game configuration from environment
const GAME_CONFIG = {
  maxPlayersDuel: parseInt(import.meta.env.VITE_MAX_PLAYERS_DUEL || '2'),
  maxPlayersBattleRoyale: parseInt(import.meta.env.VITE_MAX_PLAYERS_BATTLE_ROYALE || '8'),
  maxGuessAttempts: parseInt(import.meta.env.VITE_MAX_GUESS_ATTEMPTS || '6'),
  gameTimeout: parseInt(import.meta.env.VITE_GAME_TIMEOUT || '300000')
};

// API response interfaces
export interface CreateRoomRequest {
  username: string
  mode: 'duel' | 'battleRoyale'
}

export interface CreateRoomResponse {
  code: string
  mode: 'duel' | 'battleRoyale'
}

export interface JoinRoomRequest {
  code: string
  username: string
}

export interface JoinRoomResponse {
  success: boolean
  room: any
}

export interface ValidateWordRequest {
  word: string
}

export interface ValidateWordResponse {
  isValid: boolean
  suggestions: string[]
  message: string
}

// Error handling utility
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request utility with error handling and retry logic
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries: number = 3
): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If error response is not JSON, use the status text
      }
      
      throw new ApiError(errorMessage, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Retry logic for network errors
      if (retries > 0) {
        console.log(`Network error, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return makeRequest<T>(endpoint, options, retries - 1);
      }
      
      throw new ApiError(
        'Network error: Unable to connect to server',
        0,
        'NETWORK_ERROR'
      );
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      'UNKNOWN_ERROR'
    );
  }
}

// API service methods
export const apiService = {
  // Create a new room
  async createRoom(data: CreateRoomRequest): Promise<CreateRoomResponse> {
    return makeRequest<CreateRoomResponse>('/create-room', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Join an existing room
  async joinRoom(data: JoinRoomRequest): Promise<JoinRoomResponse> {
    return makeRequest<JoinRoomResponse>('/join-room', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Validate a custom word
  async validateWord(data: ValidateWordRequest): Promise<ValidateWordResponse> {
    return makeRequest<ValidateWordResponse>('/validate-word', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all rooms (for debugging/admin)
  async getRooms(): Promise<{ rooms: any[]; total: number; timestamp: string }> {
    return makeRequest<{ rooms: any[]; total: number; timestamp: string }>('/rooms', {
      method: 'GET',
    });
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number; environment: string; version: string }> {
    try {
      const response = await fetch(HEALTH_CHECK_URL);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new ApiError(
        'Health check failed',
        0,
        'HEALTH_CHECK_FAILED'
      );
    }
  },

  // Get API configuration
  getConfig() {
    return {
      baseUrl: API_BASE_URL,
      socketUrl: SOCKET_URL,
      healthUrl: HEALTH_CHECK_URL,
      isDevelopment,
      isProduction,
      environment: import.meta.env.VITE_NODE_ENV || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      featureFlags: FEATURE_FLAGS,
      gameConfig: GAME_CONFIG
    };
  },

  // Check if maintenance mode is enabled
  isMaintenanceMode(): boolean {
    return FEATURE_FLAGS.maintenance;
  },

  // Get feature flags
  getFeatureFlags() {
    return FEATURE_FLAGS;
  },

  // Get game configuration
  getGameConfig() {
    return GAME_CONFIG;
  }
};

// Export error class for use in components
export { ApiError };
