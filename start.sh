#!/bin/bash
set -e

echo "Environment debug info:"
echo "PATH: $PATH"
echo "NODE_ENV: $NODE_ENV"
echo "Available commands:"
which node || echo "node not found in PATH"
which npm || echo "npm not found in PATH"
which python3 || echo "python3 not found in PATH"

# Install Python dependencies if needed
if [ -f requirements.txt ]; then
    echo "Installing Python dependencies..."
    python3 -m pip install -r requirements.txt || pip3 install -r requirements.txt || true
fi

# Start the Node.js application with multiple fallbacks
echo "Starting Node.js application..."

# Try different node paths
if command -v node &> /dev/null; then
    echo "Using node from PATH"
    node index.js
elif [ -x "/usr/local/bin/node" ]; then
    echo "Using /usr/local/bin/node"
    /usr/local/bin/node index.js
elif [ -x "/usr/bin/node" ]; then
    echo "Using /usr/bin/node"
    /usr/bin/node index.js
elif command -v nodejs &> /dev/null; then
    echo "Using nodejs command"
    nodejs index.js
else
    echo "ERROR: Node.js not found!"
    echo "Searching for node in common locations:"
    find / -name "node" -type f 2>/dev/null | head -10 || true
    exit 1
fi
