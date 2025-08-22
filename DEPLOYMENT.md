# 🚀 Word Duel Production Deployment Guide

This guide covers deploying Word Duel to production environments using various methods.

## 📋 Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- Docker and Docker Compose (optional)
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificates (for HTTPS)

## 🏗️ Deployment Options

### Option 1: Traditional Server Deployment

#### 1.1 Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install UFW firewall
sudo apt install ufw -y
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

#### 1.2 Application Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/word-duel.git
cd word-duel

# Install dependencies
pnpm install

# Build frontend
pnpm run build:prod

# Setup backend
cd server
pnpm install

# Create environment file
cp env.example .env
# Edit .env with your production values

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

#### 1.3 Nginx Configuration
```bash
# Copy Nginx config
sudo cp server/nginx.conf /etc/nginx/nginx.conf

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Add your SSL certificates
sudo cp your-cert.pem /etc/nginx/ssl/cert.pem
sudo cp your-key.pem /etc/nginx/ssl/key.pem

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Docker Deployment

#### 2.1 Docker Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again
```

#### 2.2 Docker Deployment
```bash
# Navigate to server directory
cd server

# Build and run with Docker Compose
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

### Option 3: Cloud Platform Deployment

#### 3.1 Heroku
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create app
heroku create your-word-duel-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://yourdomain.com

# Deploy
git push heroku main
```

#### 3.2 Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## 🔧 Environment Configuration

### Required Environment Variables
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

### Optional Environment Variables
```bash
# Database (future use)
DATABASE_URL=postgresql://user:password@localhost:5432/wordduel

# Redis (future use)
REDIS_URL=redis://localhost:6379

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
```

## 📊 Monitoring and Logging

### PM2 Monitoring
```bash
# View logs
pm2 logs word-duel-server

# Monitor processes
pm2 monit

# View status
pm2 status

# Restart application
pm2 restart word-duel-server
```

### Log Management
```bash
# View application logs
tail -f server/logs/combined.log
tail -f server/logs/error.log

# Rotate logs (add to crontab)
0 0 * * * find /path/to/word-duel/server/logs -name "*.log" -mtime +7 -delete
```

### Health Checks
```bash
# Test health endpoint
curl https://yourdomain.com/health

# Test API endpoints
curl https://yourdomain.com/api/v1/rooms
```

## 🔒 Security Considerations

### Firewall Configuration
```bash
# Configure UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### SSL/TLS Setup
```bash
# Using Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Rate Limiting
- API endpoints: 10 requests per 15 minutes
- WebSocket connections: 30 connections per 15 minutes
- Adjust in `.env` file as needed

## 📈 Scaling and Performance

### Load Balancing
```bash
# Edit nginx.conf to add more backend servers
upstream word_duel_backend {
    server word-duel-server-1:3001;
    server word-duel-server-2:3001;
    server word-duel-server-3:3001;
}
```

### PM2 Clustering
```bash
# Scale to multiple instances
pm2 scale word-duel-server 4

# Or edit ecosystem.config.js
instances: 'max'
exec_mode: 'cluster'
```

### Database Scaling (Future)
- Consider PostgreSQL for persistent storage
- Redis for caching and session management
- Implement connection pooling

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 <PID>
```

#### Memory Issues
```bash
# Check memory usage
pm2 monit

# Restart if memory usage is high
pm2 restart word-duel-server
```

#### Log Analysis
```bash
# Search for errors
grep -i error server/logs/combined.log

# Monitor real-time logs
tail -f server/logs/combined.log | grep -i error
```

### Performance Monitoring
```bash
# System resources
htop
iotop

# Network connections
netstat -tulpn | grep :3001

# Process monitoring
pm2 monit
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Install dependencies
pnpm install

# Build frontend
pnpm run build:prod

# Restart backend
pm2 restart word-duel-server
```

### System Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js if needed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Restart services
sudo systemctl restart nginx
pm2 restart all
```

## 📚 Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

## 🆘 Support

For deployment issues:
1. Check logs: `pm2 logs` and `sudo journalctl -u nginx`
2. Verify configuration files
3. Test endpoints individually
4. Check firewall and network settings
5. Review system resources

---

**Note**: Always test deployments in a staging environment first before deploying to production.
