@echo off
REM Word Duel Frontend Environment Setup Script for Windows
REM This script helps set up the frontend environment for production

echo 🚀 Setting up Word Duel Frontend Environment...

REM Check if .env.production already exists
if exist "src\renderer\.env.production" (
    echo ⚠️  .env.production file already exists. Backing up to .env.production.backup
    copy "src\renderer\.env.production" "src\renderer\.env.production.backup"
)

REM Copy production environment template
if exist "src\renderer\frontend-production.env" (
    copy "src\renderer\frontend-production.env" "src\renderer\.env.production"
    echo ✅ Created .env.production file from template
) else (
    echo ❌ frontend-production.env template not found!
    pause
    exit /b 1
)

REM Create development environment file
copy "src\renderer\frontend-production.env" "src\renderer\.env.development"
echo ✅ Created .env.development file from template

REM Update development environment for local development using PowerShell
powershell -Command "(Get-Content 'src\renderer\.env.development') -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=http://localhost:3001/api/v1' | Set-Content 'src\renderer\.env.development'"
powershell -Command "(Get-Content 'src\renderer\.env.development') -replace 'VITE_SOCKET_URL=.*', 'VITE_SOCKET_URL=http://localhost:3001' | Set-Content 'src\renderer\.env.development'"
powershell -Command "(Get-Content 'src\renderer\.env.development') -replace 'VITE_HEALTH_CHECK_URL=.*', 'VITE_HEALTH_CHECK_URL=http://localhost:3001/health' | Set-Content 'src\renderer\.env.development'"
powershell -Command "(Get-Content 'src\renderer\.env.development') -replace 'VITE_NODE_ENV=.*', 'VITE_NODE_ENV=development' | Set-Content 'src\renderer\.env.development'"

echo ✅ Updated development environment for local development

REM Update production environment if domain is provided
if not '%1'=='' (
    set DOMAIN=%1
    powershell -Command "(Get-Content 'src\renderer\.env.production') -replace 'VITE_API_BASE_URL=.*', 'VITE_API_BASE_URL=https://%DOMAIN%/api/v1' | Set-Content 'src\renderer\.env.production'"
    powershell -Command "(Get-Content 'src\renderer\.env.production') -replace 'VITE_SOCKET_URL=.*', 'VITE_SOCKET_URL=https://%DOMAIN%' | Set-Content 'src\renderer\.env.production'"
    powershell -Command "(Get-Content 'src\renderer\.env.production') -replace 'VITE_HEALTH_CHECK_URL=.*', 'VITE_HEALTH_CHECK_URL=https://%DOMAIN%/health' | Set-Content 'src\renderer\.env.production'"
    echo ✅ Updated production environment for domain: %DOMAIN%
) else (
    echo ℹ️  To update production domain, run: setup-frontend-env.bat yourdomain.com
)

echo.
echo 🎉 Frontend environment setup complete!
echo.
echo 📋 Environment files created:
echo   - src\renderer\.env.development (for local development)
echo   - src\renderer\.env.production (for production builds)
echo.
echo 🔧 Next steps:
echo 1. Review and customize environment files
echo 2. Build for development: pnpm run build
echo 3. Build for production: pnpm run build:prod
echo 4. Create distributable: pnpm run dist:win (or mac/linux)
echo.
echo 🔒 Security reminder:
echo - Keep your .env files secure and never commit them to version control
echo - Update domain URLs in .env.production for your actual domain
echo - Consider using environment-specific builds for different deployments
echo.
echo 📚 For more information, see README.md
pause
