# 🕹️ Neon Void – Area Enclosure Arcade Game

A cyberpunk-themed **Volfied-style** area enclosure arcade game built with **Next.js 15**, **React 19**, and a custom 2D game engine.

![Neon Void](https://img.shields.io/badge/Game-Neon%20Void-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)

## 🎮 Play Now

🔗 **[Play Neon Void Live](https://neon-void-game.vercel.app)**

## 📖 About

Capture **80%** of the playfield area to complete each level. Navigate the border (safe zone), venture into the open field (danger zone) to draw lines, and enclose territory while avoiding spider enemies!

### Features
- ♾️ **Infinite progressive difficulty** — levels scale forever with dynamic enemy counts & speeds
- 🕷️ **SVG spider enemies** — animated small spiders and boss spiders
- 🖥️ **Fullscreen gameplay** — adapts to any screen size
- 🎵 **Spatial audio** with synthesized background music
- 🛡️ **Shield system** — protection on the border with energy management
- ⚡ **Combo system** — chain captures for score multipliers
- 🔫 **Shooting mechanic** (Z key) — shoot projectiles to destroy enemies
- 💎 **Diamond powerups** — collect for bonus abilities
- 🎨 **Neon cyberpunk aesthetics** — glowing particles, grid effects

## 🎯 Game Rules

| Zone | Description |
|------|-------------|
| **Border** (Safe) | Outer frame — player is protected by shield |
| **Open Field** (Danger) | Inner area — enemies roam freely |
| **Captured Area** | Enclosed territory — locked and inaccessible |

- Capture **≥80%** of the area to complete a level
- Avoid enemies while drawing capture lines
- Boss enemies cannot be trapped — only killed
- Minor enemies caught in captured areas are destroyed

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** | Move player |
| **Z** | Shoot projectile |
| **ESC** | Pause game |

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/moseri25/neon-void-game.git
cd neon-void-game

# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
npm start
```

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **UI**: React 19 + Zustand + Framer Motion
- **Styling**: TailwindCSS 3.4
- **Engine**: Custom ECS (Entity-Component-System) architecture
- **Physics**: Custom 2D physics with spatial hash grid
- **Rendering**: Canvas 2D with WebGPU-ready renderer
- **Audio**: Web Audio API spatial audio system

## 📁 Project Structure

```
src/
├── app/          # Next.js pages (game, leaderboard)
├── components/   # React components (GameCanvas)
├── domain/       # Game domain (entities, geometry, match logic)
├── engine/       # Custom game engine (ECS, physics, renderer)
├── game/         # Game logic (AI, DDA, levels)
├── hooks/        # React hooks (audio, game state)
├── lib/          # Utilities (audio, websocket)
├── providers/    # Context providers
├── stores/       # Zustand state stores
└── ui/           # UI components (atoms, molecules, organisms)
```

## 📄 License

MIT
