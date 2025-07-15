#!/bin/bash
# Install Python dependencies if needed
if [ -f requirements.txt ]; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt || true
fi

# Start the Node.js application
echo "Starting Node.js application..."
# Use full path or ensure node is in PATH
/usr/local/bin/node index.js || node index.js || nodejs index.js
