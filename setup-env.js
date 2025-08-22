#!/usr/bin/env node

/**
 * Simple environment setup script for Word Duel
 * This script creates environment files from templates
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Main setup function
function setupEnvironment() {
  const args = process.argv.slice(2);
  const domain = args[0];
  
  log('🚀 Setting up Word Duel Frontend Environment...', 'bright');
  
  const rendererDir = path.join(__dirname, 'src', 'renderer');
  const templateFile = path.join(rendererDir, 'frontend-production.env');
  
  // Check if template exists
  if (!fs.existsSync(templateFile)) {
    logError('frontend-production.env template not found!');
    logInfo('Please ensure the template file exists in src/renderer/');
    process.exit(1);
  }
  
  // Read template
  let template = fs.readFileSync(templateFile, 'utf8');
  
  // Create development environment
  const devEnv = template
    .replace(/VITE_API_BASE_URL=.*/g, 'VITE_API_BASE_URL=http://localhost:3001/api/v1')
    .replace(/VITE_SOCKET_URL=.*/g, 'VITE_SOCKET_URL=http://localhost:3001')
    .replace(/VITE_HEALTH_CHECK_URL=.*/g, 'VITE_HEALTH_CHECK_URL=http://localhost:3001/health')
    .replace(/VITE_NODE_ENV=.*/g, 'VITE_NODE_ENV=development');
  
  // Create production environment
  let prodEnv = template;
  if (domain) {
    prodEnv = template
      .replace(/VITE_API_BASE_URL=.*/g, `VITE_API_BASE_URL=https://${domain}/api/v1`)
      .replace(/VITE_SOCKET_URL=.*/g, `VITE_SOCKET_URL=https://${domain}`)
      .replace(/VITE_HEALTH_CHECK_URL=.*/g, `VITE_HEALTH_CHECK_URL=https://${domain}/health`);
    logSuccess(`Updated production environment for domain: ${domain}`);
  } else {
    logWarning('No domain provided, using default production URLs');
    logInfo('To update production domain, run: node setup-env.js yourdomain.com');
  }
  
  // Write environment files
  try {
    // Development environment
    fs.writeFileSync(path.join(rendererDir, '.env.development'), devEnv);
    logSuccess('Created .env.development file');
    
    // Production environment
    fs.writeFileSync(path.join(rendererDir, '.env.production'), prodEnv);
    logSuccess('Created .env.production file');
    
    logSuccess('Environment setup complete!');
    
    log('\n📋 Next steps:', 'bright');
    log('1. Review and customize environment files');
    log('2. Build for development: pnpm run build');
    log('3. Build for production: pnpm run build:prod');
    log('4. Create distributable: pnpm run dist:win (or mac/linux)');
    
    log('\n🔒 Security reminder:', 'bright');
    log('- Keep your .env files secure and never commit them to version control');
    log('- Update domain URLs in .env.production for your actual domain');
    log('- Consider using environment-specific builds for different deployments');
    
  } catch (error) {
    logError(`Failed to create environment files: ${error.message}`);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupEnvironment();
}

module.exports = { setupEnvironment };
