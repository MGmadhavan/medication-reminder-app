@echo off
echo ===================================
echo Medication Reminder App Setup
echo ===================================
echo.

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Checking for .env file...
if exist .env (
    echo ✓ .env file found
) else (
    echo ⚠ .env file not found
    echo Please create .env file using .env.example as template
    echo.
    pause
)

echo.
echo Step 3: Testing build...
call npm run build
if errorlevel 1 (
    echo Error: Build failed. Check your .env configuration.
    pause
    exit /b 1
)

echo.
echo ✓ Setup completed successfully!
echo.
echo Next steps:
echo 1. Make sure your .env file is configured
echo 2. Install Vercel CLI: npm install -g vercel
echo 3. Login to Vercel: vercel login
echo 4. Deploy: vercel --prod
echo.
echo For detailed instructions, see DEPLOYMENT_GUIDE.md
pause
