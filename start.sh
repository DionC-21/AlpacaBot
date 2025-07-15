#!/bin/bash
# Install Python dependencies if needed
if [ -f requirements.txt ]; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt || true
fi

# Start the Node.js application
echo "Starting Node.js application..."
node index.js
