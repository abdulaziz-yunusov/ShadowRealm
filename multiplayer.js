/* ═══════════════════════════════════════════════════
   REALM OF SHADOWS — Multiplayer System
   Uses PeerJS (WebRTC) for peer-to-peer online play.
   No server required — PeerJS cloud handles signaling.
   ═══════════════════════════════════════════════════ */

const MP = {
  peer: null,
  conn: null,
  isHost: false,
  roomCode: null,
  connected: false,
  isMultiplayer: false,

  opponentData: null,     // { name, classId, classIcon, level, hp, maxHp, atk, def, spd, luck, pos, gold }
  myDataSent: false,
  opponentDataReceived: false,
  mapSent: false,

  pvp: {
    active: false,
    myTurn: false,
    myDefending: false,
    oppDefending: false,
    myHp: 0,
    myMaxHp: 0,
    oppHp: 0,
    oppMaxHp: 0,
    combatLog: [],
    cooldowns: {},
    isLocked: false,
  },

  // ─── INIT ────────────────────────────────────────────────────────────────────

  showLobby() {
    this.isMultiplayer = true;
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('mp-lobby').classList.add('active');
    document.getElementById('mp-connect-section').style.display = 'block';
    document.getElementById('mp-status-section').style.display = 'none';
    document.getElementById('mp-join-code').value = '';
  },

  backToTitle() {
    this.cleanup();
    document.getElementById('mp-lobby').classList.remove('active');
    document.getElementById('title-screen').classList.remove('hidden');
    this.isMultiplayer = false;
  },

  cleanup() {
    if (this.conn) { try { this.conn.close(); } catch(e){} this.conn = null; }
    if (this.peer) { try { this.peer.destroy(); } catch(e){} this.peer = null; }
    this.connected = false;
    this.opponentData = null;
    this.myDataSent = false;
    this.opponentDataReceived = false;
    this.mapSent = false;
    this.pvp.active = false;
  },

  // ─── ROOM HOSTING ────────────────────────────────────────────────────────────

  createRoom() {
    this.setStatus('🔄 Creating room...');
    document.getElementById('mp-connect-section').style.display = 'none';
    document.getElementById('mp-status-section').style.display = 'block';

    this.isHost = true;
    // Generate a short 6-char room code as the peer ID prefix
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.roomCode = code;

    this.peer = new Peer('realm-' + code);

    // Timeout if the signalling server never responds
    const openTimeout = setTimeout(() => {
      if (!this.peer || this.peer.disconnected) return;
      this.setStatus('❌ Could not reach PeerJS server. Check your connection and try again.');
      this.peer.destroy();
    }, 10000);

    this.peer.on('open', () => {
      clearTimeout(openTimeout);
      document.getElementById('mp-room-code-display').textContent = code;
      document.getElementById('mp-room-code-box').style.display = 'block';
      this.setStatus('⏳ Waiting for a player to join...');
    });

    this.peer.on('connection', (conn) => {
      this.conn = conn;
      this.setupConnection(conn);
      this.setStatus('🔗 Opponent connected! Creating your character...');
      this.showCharCreationForMP();
    });

    this.peer.on('error', (err) => {
      this.setStatus('❌ Connection error: ' + err.type + '. Try again.');
      console.error('PeerJS host error:', err);
    });
  },

  // ─── ROOM JOINING ────────────────────────────────────────────────────────────

  joinRoom(code) {
    code = (code || '').trim().toUpperCase();
    if (code.length < 4) { this.setStatus('❌ Enter a valid room code.'); return; }

    this.isHost = false;
    this.roomCode = code;

    document.getElementById('mp-connect-section').style.display = 'none';
    document.getElementById('mp-status-section').style.display = 'block';
    this.setStatus('🔄 Connecting to room ' + code + '...');

    this.peer = new Peer(undefined);

    // Timeout if the signalling server never responds
    const openTimeout = setTimeout(() => {
      if (!this.peer || this.peer.disconnected) return;
      this.setStatus('❌ Could not reach PeerJS server. Check your connection and try again.');
      this.peer.destroy();
    }, 10000);

    this.peer.on('open', () => {
      clearTimeout(openTimeout);
      const conn = this.peer.connect('realm-' + code, { reliable: true });
      this.conn = conn;
      this.setupConnection(conn);
    });

    this.peer.on('error', (err) => {
      this.setStatus('❌ Could not connect: ' + err.type + '. Check the code and try again.');
      console.error('PeerJS join error:', err);
    });
  },

  // ─── CONNECTION SETUP ────────────────────────────────────────────────────────

  setupConnection(conn) {
    conn.on('open', () => {
      this.connected = true;
      if (!this.isHost) {
        this.setStatus('✅ Connected! Create your character...');
        this.showCharCreationForMP();
      }
    });

    conn.on('data', (msg) => {
      try { this.receive(msg); } catch(e) { console.error('MP receive error:', e); }
    });

    conn.on('close', () => {
      this.connected = false;
      if (state.screen === 'playing' || state.screen === 'combat') {
        showToast('⚠️ Opponent disconnected!');
        addLog('danger', '⚠️ Your opponent has disconnected.');
      }
      this.updateConnectionStatus(false);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      showToast('❌ Connection error.');
    });
  },

  showCharCreationForMP() {
    document.getElementById('mp-lobby').classList.remove('active');
    document.getElementById('char-creation').classList.add('active');
    // Patch the begin button to use MP flow
    const btn = document.getElementById('btn-begin');
    btn.textContent = '⚔️ Ready – Enter the Realm';
  },

  // ─── MESSAGING ───────────────────────────────────────────────────────────────

  broadcast(type, data) {
    if (this.conn && this.conn.open) {
      try { this.conn.send({ type, data }); } catch(e) { console.error('Send error:', e); }
    }
  },

  receive(msg) {
    const { type, data } = msg;

    switch (type) {

      case 'player_data':
        this.opponentData = { ...data };
        this.opponentDataReceived = true;
        this.updateConnectionStatus(true);
        addLog('explore', `⚔️ ${data.name} the ${data.className} joins the realm!`);
        showToast(`⚔️ ${data.name} has joined!`, 'quest');
        // Host sends map once both players have sent their data
        if (this.isHost && this.myDataSent) {
          this._sendMapData();
        }
        // Update in-game opponent HUD
        this._renderOpponentHud();
        break;

      case 'map_data':
        // Guest receives map from host
        if (!this.isHost) {
          this._applyMapData(data);
        }
        break;

      case 'move':
        if (this.opponentData) {
          this.opponentData.pos = { col: data.col, row: data.row };
          // Update location panel in case challenge button needs to appear/disappear
          if (state.screen === 'playing') updateLocationPanel();
        }
        break;

      case 'hp_update':
        if (this.opponentData) {
          this.opponentData.hp = data.hp;
          this.opponentData.maxHp = data.maxHp;
          if (data.level) this.opponentData.level = data.level;
          this._renderOpponentHud();
        }
        break;

      case 'challenge':
        this._receivedChallenge();
        break;

      case 'challenge_response':
        if (data.accepted) {
          this._startPvpCombat(true); // challenger goes first
        } else {
          showToast('❌ Challenge declined.', '');
          addLog('combat', '❌ Your challenge was declined.');
        }
        break;

      case 'pvp_start':
        // Guest side: host told us who goes first
        this._startPvpCombat(!data.hostFirst); // if host goes first, guest goes second
        break;

      case 'pvp_action':
        this._receivePvpAction(data);
        break;

      case 'pvp_flee':
        this._opponentFled();
        break;

      case 'chat':
        this._receiveChat(data.message, data.senderName);
        break;

      case 'gold_transfer':
        // Winner receives gold from loser
        if (state.player) {
          state.player.gold += data.amount;
          updateHUD();
          addLog('loot', `💰 Won ${data.amount}g from the duel!`);
        }
        break;
    }
  },

  // ─── MAP SHARING ─────────────────────────────────────────────────────────────

  onMapGenerated() {
    // Called by beginAdventure() after generateMap()
    this.myDataSent = true;

    // Send player data to opponent
    const p = state.player;
    this.broadcast('player_data', {
      name: p.name,
      classId: p.class.id,
      className: p.class.name,
      classIcon: p.class.icon,
      level: p.level,
      hp: p.hp,
      maxHp: p.maxHp,
      atk: p.atk,
      def: p.def,
      spd: p.spd,
      luck: p.luck,
      gold: p.gold,
      pos: state.playerPos,
    });

    // Host: if opponent already sent their data, send map
    if (this.isHost && this.opponentDataReceived) {
      this._sendMapData();
    }
    // Guest: wait for map from host (game starts when map_data received)
  },

  _sendMapData() {
    if (this.mapSent) return;
    this.mapSent = true;
    // Send minimal serializable map data (strip non-serializable bits)
    const mapForSend = state.map.map(row => row.map(tile => ({
      biome: tile.biome,
      location: tile.location ? {
        type: tile.location.type,
        name: tile.location.name,
        desc: tile.location.desc,
        visited: tile.location.visited,
        actions: [...tile.location.actions],
      } : null,
    })));
    this.broadcast('map_data', {
      map: mapForSend,
      revealed: state.revealed,
      // Give guest a slightly different start (adjacent to center, so they're apart)
      guestStartPos: this._findGuestStart(),
    });
  },

  _findGuestStart() {
    // Find a walkable tile a few steps from host's start
    const { col, row } = state.playerPos;
    const candidates = [];
    for (let dc = -6; dc <= 6; dc++) {
      for (let dr = -6; dr <= 6; dr++) {
        const c = col + dc, r = row + dr;
        const dist = Math.abs(dc) + Math.abs(dr);
        if (dist < 4 || dist > 8) continue;
        if (c >= 0 && c < MAP_COLS && r >= 0 && r < MAP_ROWS) {
          if (BIOMES[state.map[r][c].biome].walkable) {
            candidates.push({ col: c, row: r });
          }
        }
      }
    }
    if (candidates.length > 0) {
      return candidates[Math.floor(Math.random() * candidates.length)];
    }
    return { col: col + 3, row: row };
  },

  _applyMapData(data) {
    state.map = data.map;
    state.revealed = data.revealed;
    // Move guest to their start position
    const guestPos = data.guestStartPos || state.playerPos;
    state.playerPos = guestPos;
    // Reveal around guest start
    revealAround(guestPos.col, guestPos.row, 2);
    // Start the game (guest was waiting)
    this._guestStartGame(guestPos);
  },

  _guestStartGame(startPos) {
    state.screen = 'playing';
    document.getElementById('char-creation').classList.remove('active');
    document.getElementById('game-wrapper').classList.add('active');
    resizeCanvases();
    centerOnPlayer();
    updateHUD();
    updateLocationPanel();
    updateTurnIndicator();
    addLog('explore', `${state.player.name} steps into the shared realm!`);
    addLog('explore', `Use your moves to explore adjacent tiles.`);
    showToast(`⚔️ ${state.player.name} the ${state.player.class.name} begins!`);
    this._renderOpponentHud();
    // Broadcast position to host
    this.broadcast('move', startPos);
  },

  // ─── HUD ─────────────────────────────────────────────────────────────────────

  updateConnectionStatus(connected) {
    const badge = document.getElementById('mp-connection-badge');
    if (!badge) return;
    if (connected && this.opponentData) {
      badge.textContent = `⚔️ ${this.opponentData.name}`;
      badge.className = 'mp-badge connected';
    } else if (this.connected) {
      badge.textContent = `🔗 Connected`;
      badge.className = 'mp-badge connected';
    } else {
      badge.textContent = `⚡ Offline`;
      badge.className = 'mp-badge disconnected';
    }
  },

  _renderOpponentHud() {
    const hud = document.getElementById('mp-opp-hud');
    if (!hud || !this.opponentData) return;
    const opp = this.opponentData;
    const hpPct = opp.maxHp > 0 ? Math.max(0, (opp.hp / opp.maxHp) * 100) : 100;
    hud.innerHTML = `
      <div class="mp-opp-hud-inner">
        <div class="mp-opp-avatar">${opp.classIcon || '⚔️'}</div>
        <div class="mp-opp-info">
          <div class="mp-opp-name">${opp.name} <span class="mp-opp-level">Lv.${opp.level}</span></div>
          <div class="mp-opp-bar-wrap">
            <div class="mp-opp-bar" style="width:${hpPct}%"></div>
          </div>
          <div class="mp-opp-hp-text">${opp.hp}/${opp.maxHp} ❤️</div>
        </div>
      </div>
    `;
    hud.style.display = 'block';
  },

  drawOpponent(ctx) {
    if (!this.opponentData || !this.opponentData.pos) return;
    const { col, row } = this.opponentData.pos;
    if (!state.revealed[row] || !state.revealed[row][col]) return;
    const { x: cx, y: cy } = hexToPixel(col, row);

    // Pulsing red glow for opponent
    const pulseR = HEX_SIZE * 0.5 + Math.sin(Date.now() / 500 + 1) * 3;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
    glow.addColorStop(0, 'rgba(255, 80, 80, 0.35)');
    glow.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    // Opponent icon
    ctx.font = `${HEX_SIZE * 0.6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.opponentData.classIcon || '⚔️', cx, cy);

    // Name tag
    ctx.fillStyle = 'rgba(255, 80, 80, 0.9)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.fillText(this.opponentData.name, cx, cy + HEX_SIZE * 0.75);
  },

  isOpponentAdjacent() {
    if (!this.opponentData || !this.opponentData.pos) return false;
    const { col: oc, row: or } = this.opponentData.pos;
    const neighbors = getNeighbors(state.playerPos.col, state.playerPos.row);
    // Also check if on same tile
    if (oc === state.playerPos.col && or === state.playerPos.row) return true;
    return neighbors.some(n => n.col === oc && n.row === or);
  },

  // ─── PVP CHALLENGE ───────────────────────────────────────────────────────────

  sendChallenge() {
    if (!this.connected || this.pvp.active) return;
    this.broadcast('challenge', {});
    showToast('⚔️ Challenge sent! Waiting...', 'quest');
    addLog('combat', `⚔️ You challenged ${this.opponentData ? this.opponentData.name : 'opponent'} to a duel!`);
  },

  _receivedChallenge() {
    const challName = this.opponentData ? this.opponentData.name : 'Opponent';
    const overlay = document.getElementById('mp-challenge-overlay');
    if (overlay) {
      document.getElementById('mp-challenge-text').textContent = `⚔️ ${challName} challenges you to a duel!`;
      overlay.classList.add('active');
    } else {
      // Fallback
      const accept = confirm(`⚔️ ${challName} challenges you to a duel! Accept?`);
      this.broadcast('challenge_response', { accepted: accept });
      if (accept) this._startPvpCombat(false); // challenger goes first
    }
  },

  acceptChallenge() {
    const overlay = document.getElementById('mp-challenge-overlay');
    if (overlay) overlay.classList.remove('active');
    this.broadcast('challenge_response', { accepted: true });
    // Challenger (opponent) goes first
    this._startPvpCombat(false);
  },

  declineChallenge() {
    const overlay = document.getElementById('mp-challenge-overlay');
    if (overlay) overlay.classList.remove('active');
    this.broadcast('challenge_response', { accepted: false });
    addLog('combat', '🚫 You declined the duel.');
  },

  // ─── PVP COMBAT ──────────────────────────────────────────────────────────────

  _startPvpCombat(iGoFirst) {
    if (this.pvp.active) return;
    const p = state.player;
    const opp = this.opponentData;
    if (!p || !opp) return;

    this.pvp.active = true;
    this.pvp.myTurn = iGoFirst;
    this.pvp.myDefending = false;
    this.pvp.oppDefending = false;
    this.pvp.myHp = p.hp;
    this.pvp.myMaxHp = p.maxHp;
    this.pvp.oppHp = opp.hp;
    this.pvp.oppMaxHp = opp.maxHp;
    this.pvp.cooldowns = {};
    this.pvp.isLocked = false;
    this.pvp.combatLog = [];

    state.screen = 'combat';

    // Set up combat overlay for PvP
    const overlay = document.getElementById('combat-overlay');
    overlay.classList.add('active');
    overlay.setAttribute('data-pvp', 'true');

    document.getElementById('combat-title').textContent = `⚔️ Duel vs ${opp.name}!`;
    document.getElementById('fighter-player-sprite').textContent = p.class.icon;
    document.getElementById('fighter-player-name').textContent = p.name;
    document.getElementById('fighter-enemy-sprite').textContent = opp.classIcon || '⚔️';
    document.getElementById('fighter-enemy-name').textContent = opp.name;

    this._updatePvpUI();
    document.getElementById('combat-log').innerHTML = '';
    this._addPvpLog(`⚔️ Duel started! ${iGoFirst ? 'You attack first!' : opp.name + ' attacks first!'}`);

    // Hide standard ability area (we'll replace)
    const abilityArea = document.getElementById('combat-ability-actions');
    if (abilityArea) abilityArea.innerHTML = '';

    // Show PvP turn indicator
    this._renderPvpTurnUI();
  },

  _updatePvpUI() {
    const pvp = this.pvp;
    const p = state.player;
    const opp = this.opponentData;
    if (!opp) return;

    // My HP bar
    const myPct = (pvp.myHp / pvp.myMaxHp * 100).toFixed(0);
    document.getElementById('fighter-player-hp').style.width = myPct + '%';
    document.getElementById('fighter-player-hp-text').textContent = `${pvp.myHp}/${pvp.myMaxHp}`;

    // Opp HP bar
    const oppPct = pvp.oppMaxHp > 0 ? (pvp.oppHp / pvp.oppMaxHp * 100).toFixed(0) : 0;
    document.getElementById('fighter-enemy-hp').style.width = oppPct + '%';
    document.getElementById('fighter-enemy-hp-text').textContent = `${pvp.oppHp}/${pvp.oppMaxHp}`;

    if (parseFloat(myPct) <= 25) {
      document.getElementById('fighter-player-hp').classList.add('low');
    } else {
      document.getElementById('fighter-player-hp').classList.remove('low');
    }
  },

  _renderPvpTurnUI() {
    if (!this.pvp.active) return;
    const pvp = this.pvp;
    const actionsEl = document.getElementById('combat-actions');
    const abilityEl = document.getElementById('combat-ability-actions');

    if (pvp.myTurn && !pvp.isLocked) {
      // Show action buttons (standard ones)
      actionsEl.style.opacity = '1';
      actionsEl.style.pointerEvents = 'auto';

      // Show/hide heal btn
      const hasPotion = state.inventory.some(i => i.icon === '🧪' && i.type === 'consumable');
      const healBtn = document.getElementById('combat-heal-btn');
      if (healBtn) healBtn.disabled = !hasPotion;

      // Finisher btn
      const finBtn = document.getElementById('combat-finisher-btn');
      if (finBtn) finBtn.style.display = 'none';

      // PvP abilities
      this._renderPvpAbilityButtons();

      // Remove "waiting" overlay
      const waiting = document.getElementById('pvp-waiting');
      if (waiting) waiting.remove();
    } else {
      // Lock buttons, show waiting
      actionsEl.style.opacity = '0.3';
      actionsEl.style.pointerEvents = 'none';
      if (abilityEl) { abilityEl.innerHTML = ''; abilityEl.style.display = 'none'; }

      if (!document.getElementById('pvp-waiting')) {
        const wait = document.createElement('div');
        wait.id = 'pvp-waiting';
        wait.className = 'pvp-waiting-indicator';
        const oppName = this.opponentData ? this.opponentData.name : 'Opponent';
        wait.textContent = pvp.isLocked ? '⏳ Processing...' : `⏳ Waiting for ${oppName}...`;
        document.querySelector('.combat-arena').insertBefore(wait, document.getElementById('combat-log'));
      }
    }
  },

  _renderPvpAbilityButtons() {
    const abilityEl = document.getElementById('combat-ability-actions');
    if (!abilityEl) return;
    abilityEl.innerHTML = '';
    abilityEl.style.display = 'flex';

    const abilities = CLASS_ABILITIES[state.player.class.id] || [];
    abilities.forEach(ability => {
      const btn = document.createElement('button');
      btn.className = 'combat-btn ability-btn';
      btn.innerHTML = `${ability.icon} ${ability.name}`;
      btn.title = `${ability.desc} (CD: ${ability.cooldown} turns)`;
      const cd = this.pvp.cooldowns[ability.id] || 0;
      if (cd > 0) {
        btn.disabled = true;
        const ov = document.createElement('div');
        ov.className = 'cooldown-overlay';
        ov.textContent = `⏳ ${cd}`;
        btn.appendChild(ov);
      } else {
        btn.onclick = () => this._pvpUseAbility(ability.id);
      }
      abilityEl.appendChild(btn);
    });
  },

  _addPvpLog(text, cls = '') {
    const log = document.getElementById('combat-log');
    const entry = document.createElement('div');
    entry.className = `combat-log-entry ${cls}`;
    entry.textContent = text;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  },

  // ─── PVP ACTIONS ─────────────────────────────────────────────────────────────

  pvpCombatAction(action) {
    if (!this.pvp.active || !this.pvp.myTurn || this.pvp.isLocked) return;
    this.pvp.isLocked = true;
    this._renderPvpTurnUI();

    const p = state.player;
    const pvp = this.pvp;
    const opp = this.opponentData;
    const myAtk = p.atk + getEquipBonus('atk');
    const oppDef = (opp ? (opp.def || 5) : 5) + (pvp.oppDefending ? 8 : 0);
    const myDef = p.def + getEquipBonus('def');
    const myLuck = p.luck;

    let damageToOpp = 0;
    let myHpAfter = pvp.myHp;
    let isCrit = false;
    let isDefending = false;
    let healed = 0;
    let abilityId = null;

    switch (action) {
      case 'attack': {
        isCrit = Math.random() * 100 < myLuck;
        damageToOpp = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        if (isCrit) damageToOpp = Math.floor(damageToOpp * 1.8);

        if (isCrit) {
          this._addPvpLog(`💥 CRITICAL! You deal ${damageToOpp} damage!`, 'crit');
          spawnDmgNumber(damageToOpp, 'dmg-crit', document.getElementById('fighter-enemy'));
          SoundEngine.playCrit();
        } else {
          this._addPvpLog(`⚔️ You attack for ${damageToOpp} damage.`, 'player-hit');
          spawnDmgNumber(damageToOpp, 'dmg-enemy', document.getElementById('fighter-enemy'));
          SoundEngine.playHit();
        }
        shakeFighter('enemy');

        // Necro lifesteal
        if (p.class.id === 'necro') {
          const steal = Math.floor(damageToOpp * 0.15);
          myHpAfter = Math.min(pvp.myMaxHp, pvp.myHp + steal);
          if (steal > 0) {
            this._addPvpLog(`🧛 Lifesteal: +${steal} HP`, 'heal');
            spawnDmgNumber(steal, 'dmg-lifesteal', document.getElementById('fighter-player'));
            healed = steal;
          }
        }
        break;
      }
      case 'defend': {
        isDefending = true;
        this._addPvpLog(`🛡️ You raise your guard!`, 'player-hit');
        SoundEngine.playStep();
        break;
      }
      case 'heal': {
        const potionIdx = state.inventory.findIndex(i => i.icon === '🧪' && i.type === 'consumable');
        if (potionIdx >= 0) {
          const potion = state.inventory[potionIdx];
          healed = potion.effect.hp || 40;
          myHpAfter = Math.min(pvp.myMaxHp, pvp.myHp + healed);
          potion.qty--;
          if (potion.qty <= 0) state.inventory.splice(potionIdx, 1);
          this._addPvpLog(`🧪 You drink a potion! +${healed} HP`, 'heal');
          spawnDmgNumber(healed, 'dmg-heal', document.getElementById('fighter-player'));
          SoundEngine.playHeal();
          state.potionUsed = true;
        } else {
          this._addPvpLog(`❌ No potions!`);
          pvp.isLocked = false;
          this._renderPvpTurnUI();
          return;
        }
        break;
      }
      case 'flee': {
        const fleeChance = 35 + (p.spd * 2);
        if (Math.random() * 100 < fleeChance) {
          this._addPvpLog(`🏃 You flee the duel!`);
          SoundEngine.playFlee();
          this.broadcast('pvp_flee', {});
          this._endPvpCombat(false, true);
          return;
        } else {
          this._addPvpLog(`❌ Failed to flee!`);
          spawnDmgNumber('MISS', 'dmg-miss', document.getElementById('fighter-player'));
        }
        break;
      }
    }

    pvp.myDefending = isDefending;
    pvp.myHp = myHpAfter;

    // Send result to opponent
    this.broadcast('pvp_action', {
      action,
      damageToOpp,
      myHpAfter,
      isCrit,
      isDefending,
      abilityId,
      healed,
    });

    // Apply opp HP change locally
    pvp.oppHp = Math.max(0, pvp.oppHp - damageToOpp);
    this._updatePvpUI();

    // Check if opponent died
    if (pvp.oppHp <= 0) {
      setTimeout(() => this._pvpVictory(), 800);
      return;
    }

    // Now opponent's turn
    pvp.myTurn = false;
    pvp.isLocked = false;

    // Decrement cooldowns
    for (const k in pvp.cooldowns) {
      if (pvp.cooldowns[k] > 0) pvp.cooldowns[k]--;
    }

    this._renderPvpTurnUI();
  },

  _pvpUseAbility(abilityId) {
    if (!this.pvp.active || !this.pvp.myTurn || this.pvp.isLocked) return;
    if ((this.pvp.cooldowns[abilityId] || 0) > 0) return;

    const pvp = this.pvp;
    const p = state.player;
    const opp = this.opponentData;
    const myAtk = p.atk + getEquipBonus('atk');
    const oppDef = (opp ? (opp.def || 5) : 5) + (pvp.oppDefending ? 8 : 0);
    const myLuck = p.luck;

    pvp.isLocked = true;
    this._renderPvpTurnUI();

    let damageToOpp = 0;
    let myHpAfter = pvp.myHp;
    let isCrit = false;
    const healed = 0;

    const abilities = {
      berserker_rage: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        d = Math.floor(d * 2);
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        this._addPvpLog(`🔥 Berserker Rage! ${isCrit ? 'CRIT! ' : ''}${d} damage!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.berserker_rage = 4;
      },
      shield_bash: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        this._addPvpLog(`💥 Shield Bash! ${isCrit ? 'CRIT! ' : ''}${d} damage!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.shield_bash = 3;
      },
      fireball: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        d = Math.floor(d * 3);
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        this._addPvpLog(`☄️ Fireball! ${isCrit ? 'CRIT! ' : ''}${d} damage!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.fireball = 5;
      },
      frost_nova: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        this._addPvpLog(`❄️ Frost Nova! ${isCrit ? 'CRIT! ' : ''}${d} damage + STUN!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.frost_nova = 4;
      },
      eagle_eye: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk + Math.floor(Math.random() * 5)); // ignores def
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        this._addPvpLog(`🎯 Eagle Eye! ${isCrit ? 'CRIT! ' : ''}${d} damage (ignores DEF)!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.eagle_eye = 3;
      },
      rain_of_arrows: () => {
        const hits = Math.floor(Math.random() * 2) + 2;
        let total = 0;
        const ec = document.getElementById('fighter-enemy');
        for (let i = 0; i < hits; i++) {
          let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
          total += d;
          setTimeout(() => { spawnDmgNumber(d, 'dmg-enemy', ec); SoundEngine.playHit(); shakeFighter('enemy'); }, i * 180);
        }
        damageToOpp = total;
        this._addPvpLog(`🏹 Rain of Arrows! ${hits}x hits for ${total} total!`, 'player-hit');
        pvp.cooldowns.rain_of_arrows = 4;
      },
      divine_shield: () => {
        pvp.myDefending = true; // extra block
        this._addPvpLog(`🛡️ Divine Shield! Block next attack!`, 'heal');
        SoundEngine.playHeal();
        pvp.cooldowns.divine_shield = 4;
      },
      holy_strike: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        d = Math.floor(d * 2);
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        const heal = Math.floor(d * 0.2);
        myHpAfter = Math.min(pvp.myMaxHp, pvp.myHp + heal);
        this._addPvpLog(`✨ Holy Strike! ${isCrit ? 'CRIT! ' : ''}${d} dmg, +${heal} HP!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        spawnDmgNumber(heal, 'dmg-heal', document.getElementById('fighter-player'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.holy_strike = 4;
      },
      backstab: () => {
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        d = Math.floor(d * 1.8); // guaranteed crit
        isCrit = true;
        damageToOpp = d;
        this._addPvpLog(`🗡️ Backstab! CRITICAL ${d} damage!`, 'crit');
        spawnDmgNumber(d, 'dmg-crit', document.getElementById('fighter-enemy'));
        SoundEngine.playCrit();
        shakeFighter('enemy');
        pvp.cooldowns.backstab = 3;
      },
      smoke_bomb: () => {
        this._addPvpLog(`💨 Smoke Bomb! Guaranteed flee next turn!`, 'player-hit');
        SoundEngine.playHeal();
        pvp.cooldowns.smoke_bomb = 3;
      },
      soul_drain: () => {
        isCrit = Math.random() * 100 < myLuck;
        let d = Math.max(1, myAtk - oppDef + Math.floor(Math.random() * 5));
        if (isCrit) d = Math.floor(d * 1.8);
        damageToOpp = d;
        const steal = Math.floor(d * 0.5);
        myHpAfter = Math.min(pvp.myMaxHp, pvp.myHp + steal);
        this._addPvpLog(`🧛 Soul Drain! ${isCrit ? 'CRIT! ' : ''}${d} dmg, lifesteal +${steal}!`, isCrit ? 'crit' : 'player-hit');
        spawnDmgNumber(d, isCrit ? 'dmg-crit' : 'dmg-enemy', document.getElementById('fighter-enemy'));
        spawnDmgNumber(steal, 'dmg-lifesteal', document.getElementById('fighter-player'));
        isCrit ? SoundEngine.playCrit() : SoundEngine.playHit();
        shakeFighter('enemy');
        pvp.cooldowns.soul_drain = 3;
      },
      bone_shield: () => {
        pvp.myDefending = true;
        this._addPvpLog(`💀 Bone Shield! Absorb next hit!`, 'heal');
        SoundEngine.playHeal();
        pvp.cooldowns.bone_shield = 4;
      },
    };

    if (abilities[abilityId]) abilities[abilityId]();
    pvp.myHp = myHpAfter;

    this.broadcast('pvp_action', {
      action: 'ability',
      abilityId,
      damageToOpp,
      myHpAfter,
      isCrit,
      isDefending: pvp.myDefending,
      healed,
    });

    pvp.oppHp = Math.max(0, pvp.oppHp - damageToOpp);
    this._updatePvpUI();

    if (pvp.oppHp <= 0) {
      setTimeout(() => this._pvpVictory(), 800);
      return;
    }

    pvp.myTurn = false;
    pvp.isLocked = false;
    for (const k in pvp.cooldowns) {
      if (pvp.cooldowns[k] > 0) pvp.cooldowns[k]--;
    }
    this._renderPvpTurnUI();
  },

  _receivePvpAction(data) {
    const pvp = this.pvp;
    if (!pvp.active) return;

    const { action, damageToOpp, myHpAfter, isCrit, isDefending, abilityId, healed } = data;
    const oppName = this.opponentData ? this.opponentData.name : 'Opponent';

    // Update opponent's HP (their HP after their self-heal etc.)
    if (myHpAfter !== undefined) {
      pvp.oppHp = myHpAfter;
    }

    // Apply damage they dealt to me
    const dmgToMe = damageToOpp || 0;
    pvp.myHp = Math.max(0, pvp.myHp - dmgToMe);
    pvp.oppDefending = isDefending || false;

    // Log what opponent did
    if (action === 'attack' || action === 'ability') {
      if (dmgToMe > 0) {
        const label = abilityId ? this._abilityName(abilityId) : 'attacks';
        if (isCrit) {
          this._addPvpLog(`💥 CRITICAL! ${oppName} ${label} for ${dmgToMe}!`, 'enemy-hit');
          spawnDmgNumber(dmgToMe, 'dmg-crit', document.getElementById('fighter-player'));
          SoundEngine.playCrit();
        } else {
          this._addPvpLog(`${oppName} ${label} for ${dmgToMe} damage!`, 'enemy-hit');
          spawnDmgNumber(dmgToMe, 'dmg-player', document.getElementById('fighter-player'));
          SoundEngine.playHit();
        }
        shakeFighter('player');
      } else if (abilityId) {
        this._addPvpLog(`${oppName} uses ${this._abilityName(abilityId)}!`, 'enemy-hit');
      }
    } else if (action === 'defend') {
      this._addPvpLog(`🛡️ ${oppName} raises their guard!`, 'enemy-hit');
    } else if (action === 'heal') {
      this._addPvpLog(`🧪 ${oppName} drinks a potion!`, 'heal');
      if (healed) spawnDmgNumber(healed, 'dmg-heal', document.getElementById('fighter-enemy'));
    }

    this._updatePvpUI();

    // Check if I died
    if (pvp.myHp <= 0) {
      setTimeout(() => this._pvpDefeat(), 800);
      return;
    }

    // My turn now!
    pvp.myTurn = true;
    pvp.isLocked = false;
    this._renderPvpTurnUI();
    this._addPvpLog(`⚔️ Your turn!`);
  },

  _abilityName(id) {
    const names = {
      berserker_rage: 'Berserker Rages', fireball: 'casts Fireball',
      frost_nova: 'casts Frost Nova', eagle_eye: 'uses Eagle Eye',
      rain_of_arrows: 'fires Rain of Arrows', divine_shield: 'activates Divine Shield',
      holy_strike: 'uses Holy Strike', backstab: 'Backstabs',
      smoke_bomb: 'throws Smoke Bomb', soul_drain: 'casts Soul Drain',
      bone_shield: 'summons Bone Shield', shield_bash: 'Shield Bashes',
    };
    return names[id] || id;
  },

  _opponentFled() {
    this._addPvpLog(`🏃 ${this.opponentData ? this.opponentData.name : 'Opponent'} fled the duel!`);
    SoundEngine.playVictory();
    setTimeout(() => {
      this._endPvpCombat(true, false);
      const gold = 10;
      state.player.gold += gold;
      updateHUD();
      addLog('combat', `🏆 Duel won (opponent fled)! +${gold}g`);
      showToast(`🏆 Duel won! +${gold}g`, 'quest');
    }, 1000);
  },

  _pvpVictory() {
    SoundEngine.playVictory();
    this._addPvpLog(`🏆 You defeated ${this.opponentData ? this.opponentData.name : 'opponent'}!`, 'crit');
    const goldReward = Math.floor(30 + (this.opponentData ? (this.opponentData.level || 1) * 10 : 10));
    state.kills++;
    state.player.gold += goldReward;
    // Transfer gold from loser
    this.broadcast('gold_transfer', { amount: goldReward });
    updateHUD();
    addLog('combat', `🏆 Won the duel! +${goldReward}g`);
    checkAchievements();

    setTimeout(() => {
      this._endPvpCombat(true, false);
      showToast(`🏆 Duel won! +${goldReward}g`, 'quest');
    }, 1500);
  },

  _pvpDefeat() {
    SoundEngine.playDefeat();
    this._addPvpLog(`💀 You were defeated!`, 'enemy-hit');
    const goldLost = Math.floor(state.player.gold * 0.15);
    state.player.gold = Math.max(0, state.player.gold - goldLost);
    updateHUD();
    addLog('combat', `💀 Lost the duel. -${goldLost}g`);

    setTimeout(() => {
      this._endPvpCombat(false, false);
      // Respawn at half HP
      state.player.hp = Math.max(1, Math.floor(state.player.maxHp * 0.5));
      updateHUD();
      showToast(`💀 Defeated! Respawned at 50% HP.`);
    }, 1500);
  },

  _endPvpCombat(won, fled) {
    this.pvp.active = false;
    this.pvp.myTurn = false;
    this.pvp.isLocked = false;
    state.screen = 'playing';

    const overlay = document.getElementById('combat-overlay');
    overlay.classList.remove('active');
    overlay.removeAttribute('data-pvp');

    // Restore HP in actual player state
    state.player.hp = Math.max(1, this.pvp.myHp > 0 ? this.pvp.myHp : Math.floor(state.player.maxHp * 0.5));

    // Broadcast new HP
    this.broadcast('hp_update', { hp: state.player.hp, maxHp: state.player.maxHp });

    const waiting = document.getElementById('pvp-waiting');
    if (waiting) waiting.remove();

    const actionsEl = document.getElementById('combat-actions');
    actionsEl.style.opacity = '1';
    actionsEl.style.pointerEvents = 'auto';

    updateHUD();
    updateLocationPanel();
  },

  // ─── CHAT ────────────────────────────────────────────────────────────────────

  sendChat(message) {
    if (!message || !message.trim()) return;
    const name = state.player ? state.player.name : 'You';
    this.broadcast('chat', { message: message.trim(), senderName: name });
    this._displayChat(name, message.trim(), true);
  },

  _receiveChat(message, senderName) {
    this._displayChat(senderName || 'Opponent', message, false);
    showToast(`💬 ${senderName}: ${message}`);
  },

  _displayChat(name, message, isMe) {
    const chatLog = document.getElementById('mp-chat-log');
    if (!chatLog) return;
    const entry = document.createElement('div');
    entry.className = `mp-chat-entry ${isMe ? 'me' : 'them'}`;
    entry.innerHTML = `<strong>${name}:</strong> ${message}`;
    chatLog.appendChild(entry);
    chatLog.scrollTop = chatLog.scrollHeight;
  },

  // ─── UTILITY ─────────────────────────────────────────────────────────────────

  setStatus(text) {
    const el = document.getElementById('mp-status');
    if (el) el.textContent = text;
  },
};

// ─── GLOBAL WRAPPERS (called from HTML) ───────────────────────────────────────

function showMultiplayerLobby() {
  MP.showLobby();
}

function mpCreateRoom() {
  MP.createRoom();
}

function mpJoinRoom() {
  const code = document.getElementById('mp-join-code').value;
  MP.joinRoom(code);
}

function mpBackToTitle() {
  MP.backToTitle();
}

function mpAcceptChallenge() {
  MP.acceptChallenge();
}

function mpDeclineChallenge() {
  MP.declineChallenge();
}

function mpSendChat() {
  const input = document.getElementById('mp-chat-input');
  if (!input) return;
  MP.sendChat(input.value);
  input.value = '';
}

function pvpAction(action) {
  if (MP.pvp.active) {
    MP.pvpCombatAction(action);
  } else {
    combatAction(action);
  }
}
