#!/bin/bash

echo "==================================="
echo "Medication Reminder App Setup"
echo "==================================="
echo

echo "Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo
echo "Step 2: Checking for .env file..."
if [ -f .env ]; then
    echo "✓ .env file found"
else
    echo "⚠ .env file not found"
    echo "Please create .env file using .env.example as template"
    echo
fi

echo
echo "Step 3: Testing build..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Build failed. Check your .env configuration."
    exit 1
fi

echo
echo "✓ Setup completed successfully!"
echo
echo "Next steps:"
echo "1. Make sure your .env file is configured"
echo "2. Install Vercel CLI: npm install -g vercel"
echo "3. Login to Vercel: vercel login"
echo "4. Deploy: vercel --prod"
echo
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
