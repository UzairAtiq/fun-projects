#!/bin/bash
# Quick installation script for Mac Control

set -e

echo "🚀 Mac Control - Quick Setup"
echo "================================"
echo ""

# Check if we're in the right directory
if [ ! -f "run.py" ]; then
    echo "❌ Error: Please run this script from the Mac-control-py directory"
    exit 1
fi

# Check Python version
echo "📋 Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Found Python $PYTHON_VERSION"

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo ""
    echo "📦 Creating virtual environment..."
    python3 -m venv .venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "🔄 Activating virtual environment..."
source .venv/bin/activate

# Upgrade pip
echo ""
echo "⬆️  Upgrading pip..."
pip install --upgrade pip -q

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
pip install -r requirements.txt -q
echo "✅ Dependencies installed"

# Create logs directory
mkdir -p logs

# Generate a secure token
echo ""
echo "🔑 Generating secure authentication token..."
TOKEN=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
echo ""
echo "================================"
echo "Your secure token:"
echo "$TOKEN"
echo "================================"
echo ""
echo "⚠️  IMPORTANT: Save this token securely!"
echo "   You'll need it to access the web interface."
echo ""

# Ask if user wants to set the token now
read -p "Do you want to set this token now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    export MAC_CONTROL_TOKEN="$TOKEN"
    echo "✅ Token set for this session"
    echo ""
    echo "🎉 Setup complete! Ready to run."
    echo ""
    echo "To start the server:"
    echo "  python run.py"
    echo ""
    echo "Or run this command:"
    echo "  MAC_CONTROL_TOKEN='$TOKEN' python run.py"
else
    echo ""
    echo "To start with this token, run:"
    echo "  MAC_CONTROL_TOKEN='$TOKEN' python run.py"
fi

echo ""
echo "📚 For auto-start setup, see SETUP_GUIDE.md"
echo ""
