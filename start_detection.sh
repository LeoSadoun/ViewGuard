#!/bin/bash

# ViewGuard Detection Server Launcher
# This script helps you set up and run the Python detection backend

echo "==================================="
echo "ViewGuard Detection Server Setup"
echo "==================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
    echo "✓ Virtual environment created"
    echo ""
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing Python dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Start the server
echo "🚀 Starting detection server on http://localhost:8001"
echo "   WebSocket endpoint: ws://localhost:8001/ws"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python detection_server.py
