# ShadowRealm 🎮

An interactive fantasy RPG with **real-time multiplayer support** using WebRTC!

## 🚀 Quick Start

**[🌐 Play Online](https://abdulaziz-yunusov.github.io/ShadowRealm/)** (GitHub Pages — Enable in repository settings)

## Features

✨ **Single Player:**
- Explore a dynamically generated hex-based fantasy world
- Turn-based combat with 6 unique classes
- 20+ enemy types and powerful bosses
- 15+ locations with NPCs and shops
- Quests, achievements, and loot system
- Day/night cycle and weather system

⚔️ **Multiplayer (2 Players):**
- WebRTC peer-to-peer connection (no server needed)
- Shared world exploration
- PvP duels with full ability system
- Real-time opponent tracking
- In-game chat
- No account registration required

## How to Play

### Single Player
1. Click "🗡️ New Adventure"
2. Choose your hero class (Warrior, Mage, Ranger, Paladin, Rogue, Necromancer)
3. Explore tiles, battle enemies, complete quests, and defeat the Shadow Dragon!

### Multiplayer
1. Click "⚔️ Multiplayer (2 Players)"
2. **Host**: Click "🏠 Host a Game" and share the room code
3. **Guest**: Enter the room code and click "🔗 Join Game"
4. Create characters and explore together!

**[📖 Full Multiplayer Guide](MULTIPLAYER_GUIDE.md)**

## Tech Stack

- **Vanilla JavaScript** (4000+ lines)
- **HTML5 Canvas** — Hex map rendering
- **Web Audio API** — Dynamic sound effects
- **WebRTC + PeerJS** — Peer-to-peer multiplayer
- **LocalStorage** — Save/load game progress

## 🛠️ Installation

1. Clone the repository
2. Enable GitHub Pages in repository settings (Settings → Pages → Deploy from branch: main)
3. Access at: `https://yourusername.github.io/ShadowRealm/`

Or run locally:
```bash
# Open index.html in a browser (works with any local server)
python -m http.server
# Visit http://localhost:8000/
```

## 🎮 Game Classes

| Class | Strength | Special Ability |
|-------|----------|-----------------|
| ⚔️ **Warrior** | High HP & ATK | Berserker Rage |
| 🧙 **Mage** | Powerful spells | Fireball |
| 🏹 **Ranger** | Speed & precision | Eagle Eye |
| 🛡️ **Paladin** | Defense & healing | Holy Strike |
| 🗡️ **Rogue** | Critical strikes | Backstab |
| 💀 **Necromancer** | Lifesteal | Soul Drain |

## 📋 Gameplay Elements

- **Quests**: 4 dynamic quests with rewards
- **Enemies**: 15+ enemy types with biome-specific encounters
- **Loot**: 40+ items (weapons, armor, potions, relics)
- **Locations**: 15+ unique places (cities, dungeons, shrines, towers)
- **Achievements**: 13 unlockable achievements
- **Weather & Time**: Dynamic day/night cycle and weather system

## 🎯 Objectives

**Single Player Victory:**
- Defeat the Shadow Dragon at Shadowkeep
- Complete 3+ side quests
- Reach max exploration

**Multiplayer PvP:**
- Challenge opponents and earn gold
- Win duels through strategy and skill
- Cooperative world exploration

## 🔧 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

*Requires WebRTC support for multiplayer*

## 📝 License

Open source — Feel free to modify and share!

---

**Built by**: Abdulaziz Yunusov  
**Repository**: [github.com/abdulaziz-yunusov/ShadowRealm](https://github.com/abdulaziz-yunusov/ShadowRealm)

Enjoy your adventure in the Realm of Shadows! 🏆
