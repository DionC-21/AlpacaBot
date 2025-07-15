# AlpacaBot Trading System - Desktop Client

This is the desktop Electron client for the AlpacaBot Trading System, built with React and TypeScript.

## 🚀 Quick Start Options

### Option 1: Run as Background Service (Recommended)
```bash
# One-click installer (auto-starts on login)
./install-service.sh

# Or run once in background
./start-background.sh
```

### Option 2: Normal Desktop App
```bash
# Development mode
npm start

# Production desktop app
npm run desktop
```

### Option 3: Manual Service Management
```bash
# Install as system service
./scripts/service-manager.sh install

# Manage the service
./scripts/service-manager.sh start|stop|restart|status|logs
```

## 📋 Available Scripts

### Background & Service Scripts
- **`npm run desktop-background`** - Run in background with system tray
- **`npm run desktop-dev-background`** - Development mode in background
- **`npm run service`** - Run as system service
- **`./start-background.sh`** - One-click background starter
- **`./install-service.sh`** - One-click service installer

### Standard Development Scripts

### Standard Development Scripts

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run desktop`

Runs the production desktop app with visible window.

### `npm run desktop-dev`

Runs the desktop app in development mode with visible window.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
