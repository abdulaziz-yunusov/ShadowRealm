# 🎮 Realm of Shadows — Multiplayer Guide

## 🌐 Live Game Link
Once GitHub Pages is enabled, your game will be available at:
```
https://abdulaziz-yunusov.github.io/ShadowRealm/
```

## ⚔️ How Multiplayer Works

### Technology Stack
- **WebRTC** — Peer-to-peer direct connection
- **PeerJS** — Simplifies WebRTC setup (no server needed)
- **No accounts required** — Just share a room code!

### Starting a Multiplayer Game

#### For the **Host** (Player 1):
1. Click **"⚔️ Multiplayer (2 Players)"** on title screen
2. Click **"🏠 Host a Game"**
3. Share the **6-character room code** with your friend
4. Create your character
5. Wait for opponent to join

#### For the **Guest** (Player 2):
1. Click **"⚔️ Multiplayer (2 Players)"** on title screen
2. Enter the **6-character room code** provided by host
3. Click **"🔗 Join Game"**
4. Create your character
5. Game starts once both players are ready!

### Game Features in Multiplayer

#### 🗺️ Shared World Map
- Both players explore the **same dynamically generated map**
- See your opponent's location in real-time
- Opponent appears as a pulsing red icon

#### ⚔️ Player vs Player (PvP) Duels
- **Challenge system**: When adjacent to opponent, click "Challenge" in location panel
- **Turn-based combat** with HP bars for both fighters
- **Abilities**: Use your class-specific skills (Fireball, Backstab, Holy Strike, etc.)
- **Actions**: Attack, Defend, Heal (with potions), or Flee
- **Rewards**: Winner gains gold; loser loses a percentage of gold

#### 💬 In-Game Chat
- Real-time messaging during gameplay
- Click **"💬"** button to open chat panel
- Coordinate strategy or friendly banter!

#### 📊 Opponent Status Display
- Always see opponent's **name, level, and HP** in top-right corner
- Updates in real-time as they take damage or heal

---

## 🛠️ Technical Details

### How Data Syncs

**During Setup:**
1. Host generates the game map
2. Host sends map to guest
3. Both players send character stats to each other
4. Opponent positions sync on every move

**During Gameplay:**
- **Moves**: Position updates every tile move
- **HP Changes**: Updated after every combat action
- **Chat**: Instant delivery via WebRTC
- **Combat Actions**: Full turn-by-turn synchronization

### Supported Combat Actions
- **Basic**: Attack, Defend, Heal
- **Warrior**: Berserker Rage, Shield Bash
- **Mage**: Fireball, Frost Nova
- **Ranger**: Eagle Eye, Rain of Arrows
- **Paladin**: Divine Shield, Holy Strike
- **Rogue**: Backstab, Smoke Bomb
- **Necromancer**: Soul Drain, Bone Shield

---

## ⚙️ Room Code System

- **Format**: 6 random uppercase alphanumeric characters
- **Auto-generated**: Host creates a unique code each session
- **Expiration**: Code expires when both players disconnect
- **Peer ID**: Internally stored as `realm-{ROOMCODE}`

### Example Room Codes
```
A7K2P9
XM3JQ4
BZWN6R
```

---

## 🎯 Multiplayer Tips

✅ **Best Practices:**
- Ensure stable internet connection
- Use the **same map seed** for fairness (host generates it)
- Chat to coordinate strategies
- Take advantage of terrain and abilities

⚠️ **Known Limitations:**
- Requires **active WebRTC connection** (may have issues on some networks/firewalls)
- Works best with **stable internet**
- Connection drops will disconnect both players from combat

---

## 🔧 Configuration

The multiplayer system uses **PeerJS free cloud signaling service**:
- Host: `0.peerjs.com` port `443`
- Path: `/`
- Key: `peerjs` (free tier)

### For Custom Deployment (Optional):
Edit `multiplayer.js` lines 75-81 and 115-121 to point to your own PeerJS server if needed.

---

## 📱 Browser Compatibility

Tested on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Requires WebRTC support** — Older browsers may not work.

---

## 🎉 Enjoy Your Adventures!

Share the game link with friends and conquer the Realm together! 🏆

**GitHub**: [abdulaziz-yunusov/ShadowRealm](https://github.com/abdulaziz-yunusov/ShadowRealm)
