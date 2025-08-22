#!/bin/bash

# Word Duel Frontend Environment Setup Script
# This script helps set up the frontend environment for production

echo "🚀 Setting up Word Duel Frontend Environment..."

# Check if .env.production already exists
if [ -f "src/renderer/.env.production" ]; then
    echo "⚠️  .env.production file already exists. Backing up to .env.production.backup"
    cp src/renderer/.env.production src/renderer/.env.production.backup
fi

# Copy production environment template
if [ -f "src/renderer/frontend-production.env" ]; then
    cp src/renderer/frontend-production.env src/renderer/.env.production
    echo "✅ Created .env.production file from template"
else
    echo "❌ frontend-production.env template not found!"
    exit 1
fi

# Create development environment file
cp src/renderer/frontend-production.env src/renderer/.env.development
echo "✅ Created .env.development file from template"

# Update development environment for local development
sed -i 's|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://localhost:3001/api/v1|' src/renderer/.env.development
sed -i 's|VITE_SOCKET_URL=.*|VITE_SOCKET_URL=http://localhost:3001|' src/renderer/.env.development
sed -i 's|VITE_HEALTH_CHECK_URL=.*|VITE_HEALTH_CHECK_URL=http://localhost:3001/health|' src/renderer/.env.development
sed -i 's|VITE_NODE_ENV=.*|VITE_NODE_ENV=development|' src/renderer/.env.development

echo "✅ Updated development environment for local development"

# Update production environment if domain is provided
if [ ! -z "$1" ]; then
    DOMAIN=$1
    sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=https://$DOMAIN/api/v1|" src/renderer/.env.production
    sed -i "s|VITE_SOCKET_URL=.*|VITE_SOCKET_URL=https://$DOMAIN|" src/renderer/.env.production
    sed -i "s|VITE_HEALTH_CHECK_URL=.*|VITE_HEALTH_CHECK_URL=https://$DOMAIN/health|" src/renderer/.env.production
    echo "✅ Updated production environment for domain: $DOMAIN"
else
    echo "ℹ️  To update production domain, run: ./setup-frontend-env.sh yourdomain.com"
fi

# Set proper permissions
chmod 600 src/renderer/.env.production
chmod 600 src/renderer/.env.development
echo "✅ Set proper file permissions"

echo ""
echo "🎉 Frontend environment setup complete!"
echo ""
echo "📋 Environment files created:"
echo "  - src/renderer/.env.development (for local development)"
echo "  - src/renderer/.env.production (for production builds)"
echo ""
echo "🔧 Next steps:"
echo "1. Review and customize environment files"
echo "2. Build for development: pnpm run build"
echo "3. Build for production: pnpm run build:prod"
echo "4. Create distributable: pnpm run dist:win (or mac/linux)"
echo ""
echo "🔒 Security reminder:"
echo "- Keep your .env files secure and never commit them to version control"
echo "- Update domain URLs in .env.production for your actual domain"
echo "- Consider using environment-specific builds for different deployments"
echo ""
echo "📚 For more information, see README.md"
