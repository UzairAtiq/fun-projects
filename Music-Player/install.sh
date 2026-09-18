#!/bin/bash

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd client
npm install
npm install prop-types

# Install server dependencies
echo "Installing server dependencies..."
cd ../server
npm install

echo "✅ All dependencies installed successfully!"
echo ""
echo "To start the development servers:"
echo "  npm run dev (runs both client and server)"
echo "  npm run dev:client (client only)"
echo "  npm run dev:server (server only)"
