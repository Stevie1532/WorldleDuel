# 🎯 Word Duel - Multiplayer Wordle Game

A modern, multiplayer Wordle-style game built with React, TypeScript, and Socket.IO. Features two exciting game modes: **1v1 Duel** and **Battle Royale** for up to 8 players.

## ✨ Features

### 🎮 Game Modes
- **1v1 Duel**: Classic head-to-head competition
- **Battle Royale**: Up to 8 players, last one standing wins

### 🚀 Core Features
- **Real-time Multiplayer**: Live game updates with Socket.IO
- **Custom Words**: Hosts can set custom 5-letter words
- **Word Validation**: Comprehensive dictionary with 10,657 valid words
- **Dynamic UI**: Responsive design that adapts to game mode
- **Player Management**: Live player lists, scores, and status
- **Game Statistics**: Win rates, attempts, and leaderboards
- **Beautiful Animations**: Smooth tile flips and transitions

### 🛡️ Production Ready
- **Security**: Helmet.js, rate limiting, CORS protection
- **Logging**: Winston logging with file rotation
- **Monitoring**: Health checks and performance metrics
- **Scalability**: PM2 clustering and load balancing support
- **Containerization**: Docker and Docker Compose support
- **Reverse Proxy**: Nginx configuration with SSL/TLS

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Electron)    │◄──►│   (Node.js)     │◄──►│   (JSON/Redis)  │
│   React + TS    │    │   Express       │    │                 │
│   TailwindCSS   │    │   Socket.IO     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Git

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/word-duel.git
   cd word-duel
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   cd server && pnpm install
   cd ..
   ```

3. **Start development servers**
   ```bash
   # Terminal 1: Frontend
   pnpm dev
   
   # Terminal 2: Backend
   cd server && pnpm dev
   ```

4. **Open the application**
   - Frontend: Electron app will open automatically
   - Backend: http://localhost:3001

### Production Build

```bash
# Build for all platforms
pnpm run build:all

# Build for specific platform
pnpm run build:win    # Windows
pnpm run build:mac    # macOS
pnpm run build:linux  # Linux

# Create distributable packages
pnpm run dist:win     # Windows installer
pnpm run dist:mac     # macOS app
pnpm run dist:linux   # Linux packages
```

## 🐳 Docker Deployment

### Quick Start with Docker
```bash
cd server
docker-compose up -d
```

### Custom Docker Build
```bash
docker build -t word-duel-server .
docker run -p 3001:3001 word-duel-server
```

## 🚀 Production Deployment

### Option 1: Traditional Server
```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
cd server
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option 2: Cloud Platforms
- **Heroku**: `git push heroku main`
- **Railway**: `railway up`
- **DigitalOcean App Platform**: Connect GitHub repository

### Option 3: VPS with Nginx
```bash
# Copy Nginx configuration
sudo cp server/nginx.conf /etc/nginx/nginx.conf

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com

# Reload Nginx
sudo systemctl reload nginx
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the server directory:

```bash
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=your-super-secret-key
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### API Endpoints
- `POST /api/v1/create-room` - Create a new game room
- `POST /api/v1/join-room` - Join an existing room
- `POST /api/v1/validate-word` - Validate custom words
- `GET /api/v1/rooms` - List all active rooms
- `GET /health` - Health check endpoint

## 📊 Monitoring

### Health Checks
```bash
# Test server health
curl http://localhost:3001/health

# View PM2 status
pm2 status
pm2 monit
```

### Logs
```bash
# Application logs
tail -f server/logs/combined.log
tail -f server/logs/error.log

# PM2 logs
pm2 logs word-duel-server
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 📁 Project Structure

```
word-duel/
├── src/
│   ├── renderer/          # Frontend React app
│   │   ├── src/
│   │   │   ├── components/    # React components
│   │   │   ├── routes/        # TanStack Router routes
│   │   │   ├── stores/        # Zustand state management
│   │   │   ├── services/      # API and Socket services
│   │   │   └── data/          # Game data and word lists
│   │   └── index.html
│   ├── main/             # Electron main process
│   └── preload/          # Electron preload scripts
├── server/               # Backend Node.js server
│   ├── index.js         # Main server file
│   ├── ecosystem.config.js  # PM2 configuration
│   ├── Dockerfile       # Docker configuration
│   ├── docker-compose.yml   # Docker Compose
│   ├── nginx.conf       # Nginx configuration
│   └── validWords.json  # Word dictionary
├── resources/            # App icons and resources
├── out/                 # Build output
└── dist/                # Distribution packages
```

## 🔒 Security Features

- **Helmet.js**: Security headers and CSP
- **Rate Limiting**: API and WebSocket rate limiting
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Comprehensive word and data validation
- **Error Handling**: Secure error messages in production

## 📈 Performance Features

- **Compression**: Gzip compression for all responses
- **Caching**: Static asset caching with Nginx
- **Load Balancing**: Support for multiple backend instances
- **WebSocket Optimization**: Efficient Socket.IO configuration
- **Memory Management**: PM2 memory limits and auto-restart

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/word-duel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/word-duel/discussions)
- **Documentation**: [Deployment Guide](DEPLOYMENT.md)

## 🙏 Acknowledgments

- Built with [Electron](https://www.electronjs.org/)
- Frontend powered by [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/)
- Styling with [TailwindCSS](https://tailwindcss.com/)
- State management with [Zustand](https://github.com/pmndrs/zustand)
- Routing with [TanStack Router](https://tanstack.com/router)
- Backend with [Express](https://expressjs.com/) and [Socket.IO](https://socket.io/)
- Real-time communication powered by [Socket.IO](https://socket.io/)

---

**🎮 Ready to play?** Create a room and challenge your friends to a Word Duel!
