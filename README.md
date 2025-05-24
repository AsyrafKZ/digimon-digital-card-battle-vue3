# Digimon Digital Card Battle (Vue3 Fan Remake)

A fan remake of the PlayStation 1 game "Digimon World Digital Card Battle" using Vue.js and TroisJS.

A complete rewrite of [an unfinished older project of mine](https://github.com/AsyrafKZ/digimon-digital-card-battle-vue-clone).

## Tech Stack
- Vue 3
- TroisJS (Three.js wrapper for Vue)
- Pinia for state management
- Tailwind CSS
- Vite

## Core Features
- 3D game board with animated camera transitions
- Card selection and battle system
- Main menu navigation
- Turn-based gameplay mechanics

## Project Structure
```javascript
src/
  ├── animations/     # Camera and visual effects
  ├── components/     # Vue components and field management
  ├── stores/         # Pinia state management
  │   ├── state.js    # Main game state
  │   └── opponent.js # Opponent logic
  └── main.js         # App entry point
```

## Game Mechanics
- Camera rotation system for board/player view switching
- Card selection interface
- Battle system (WIP)

## Development Setup

1. Install dependencies:
`npm install`

2. Run development server:
`npm run dev`

## Roadmap
[Future features and planned improvements]