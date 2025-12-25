# Play a Game

* Backgammon
* Connect Four

## Framework
- Node.js: 20.17
- Vite: 6.2
- React: 19.2.3
- ESLint: ES2022

## Quick Start

**Install dependencies:**
  ```bash
  npm install
  cd websocket && npm install && cd ..
  ```

**Start both client and server:**
  ```bash
  npm run dev:full
  ```

  Or start them separately:
  ```bash
  # Terminal 1 - Start WebSocket server
  npm run websocket:dev

  # Terminal 2 - Start React app
  npm run dev
  ```

**Url of dev servers:**
   - http://localhost:3000 <-- webserver
   - http://localhost:8080 <-- websocket

### Multiplayer Mode
- Requires WebSocket server running on port 8080
- Real-time synchronization between players

### Single Player Mode
- Players take turns using the same interface
- Access via `/connect4/local` or `/backgammon/local` URLs
