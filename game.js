/* ═══════════════════════════════════════════════════
   REALM OF SHADOWS — Game Engine
   Interactive Hex-Map Fantasy RPG
   ═══════════════════════════════════════════════════ */

// ═══ CONSTANTS ═══
const HEX_SIZE = 38;
const MAP_COLS = 28;
const MAP_ROWS = 22;
const MOVES_PER_TURN = 3;

const BIOMES = {
  ocean:    { color: '#0d47a1', fogColor: '#0a1929', name: 'Deep Ocean',    walkable: false, icon: '🌊' },
  water:    { color: '#1565c0', fogColor: '#0d2137', name: 'Shallow Water', walkable: false, icon: '💧' },
  beach:    { color: '#f9a825', fogColor: '#3d2a0a', name: 'Sandy Beach',   walkable: true,  icon: '🏖️' },
  plains:   { color: '#558b2f', fogColor: '#1b2d10', name: 'Green Plains',  walkable: true,  icon: '🌾' },
  forest:   { color: '#2e7d32', fogColor: '#0f2910', name: 'Dense Forest',  walkable: true,  icon: '🌲' },
  darkwood: { color: '#1b5e20', fogColor: '#0a1f0a', name: 'Dark Woods',    walkable: true,  icon: '🌳' },
  mountain: { color: '#5d4037', fogColor: '#1f1610', name: 'Mountains',     walkable: true,  icon: '⛰️' },
  peak:     { color: '#78909c', fogColor: '#262c30', name: 'Snowy Peak',    walkable: false, icon: '🏔️' },
  desert:   { color: '#e65100', fogColor: '#3d1b00', name: 'Scorched Desert', walkable: true, icon: '🏜️' },
  swamp:    { color: '#33691e', fogColor: '#111f08', name: 'Toxic Swamp',   walkable: true,  icon: '🦎' },
  tundra:   { color: '#b0bec5', fogColor: '#2a3035', name: 'Frozen Tundra', walkable: true,  icon: '❄️' },
  lava:     { color: '#bf360c', fogColor: '#3d1004', name: 'Volcanic Land', walkable: true,  icon: '🌋' },
  ruins:    { color: '#4a148c', fogColor: '#190729', name: 'Ancient Ruins', walkable: true,  icon: '🏛️' },
};

// ═══ WEATHER & TIME OF DAY ═══
const TIME_OF_DAY = [
  { id: 'dawn',  label: 'Dawn',  icon: '🌅', overlay: [80,40,0,0.20]  },
  { id: 'day',   label: 'Day',   icon: '☀️',  overlay: null            },
  { id: 'dusk',  label: 'Dusk',  icon: '🌇', overlay: [80,40,0,0.20]  },
  { id: 'night', label: 'Night', icon: '🌙', overlay: [0,0,20,0.35]   },
];

const WEATHER_TYPES = [
  { id: 'clear',     label: 'Clear',     icon: '✨',  overlay: null },
  { id: 'rain',      label: 'Rain',      icon: '🌧️', overlay: [20,30,50,0.25] },
  { id: 'fog',       label: 'Fog',       icon: '🌫️', overlay: [200,200,220,0.18] },
  { id: 'storm',     label: 'Storm',     icon: '⛈️', overlay: [20,10,40,0.40] },
  // ash_storm only on lava/desert — managed in weather roll
  { id: 'ash_storm', label: 'Ash Storm', icon: '🌋', overlay: [40,20,10,0.35] },
];

const LOCATION_TYPES = {
  camp:     { icon: '🏕️', name: 'Camp', color: '#66bb6a' },
  village:  { icon: '🏘️', name: 'Village', color: '#81d4fa' },
  city:     { icon: '🏰', name: 'City', color: '#ffd54f' },
  dungeon:  { icon: '⚰️', name: 'Dungeon', color: '#ef5350' },
  shrine:   { icon: '⛩️', name: 'Shrine', color: '#ce93d8' },
  cave:     { icon: '🕳️', name: 'Cave', color: '#8d6e63' },
  tower:    { icon: '🗼', name: 'Wizard Tower', color: '#7c4dff' },
  market:   { icon: '🏪', name: 'Market', color: '#ffb74d' },
  fortress: { icon: '🏯', name: 'Dark Fortress', color: '#c62828' },
  portal:   { icon: '🌀', name: 'Portal', color: '#00e5ff' },
  treasure: { icon: '💎', name: 'Treasure', color: '#ffd54f' },
  oasis:    { icon: '🌴', name: 'Oasis', color: '#00e676' },
};

const CLASSES = [
  { id: 'warrior',  icon: '⚔️', name: 'Warrior',  desc: 'Strong melee fighter',
    stats: { hp: 120, atk: 14, def: 10, spd: 6, luck: 5 }},
  { id: 'mage',     icon: '🧙', name: 'Mage',     desc: 'Powerful spellcaster',
    stats: { hp: 80, atk: 18, def: 5, spd: 7, luck: 8 }},
  { id: 'ranger',   icon: '🏹', name: 'Ranger',   desc: 'Swift and precise',
    stats: { hp: 95, atk: 12, def: 7, spd: 12, luck: 10 }},
  { id: 'paladin',  icon: '🛡️', name: 'Paladin',  desc: 'Holy warrior, high defense',
    stats: { hp: 110, atk: 11, def: 14, spd: 5, luck: 6 }},
  { id: 'rogue',    icon: '🗡️', name: 'Rogue',    desc: 'Stealthy & lucky crits',
    stats: { hp: 85, atk: 13, def: 6, spd: 14, luck: 15 }},
  { id: 'necro',    icon: '💀', name: 'Necromancer', desc: 'Dark magic & lifesteal',
    stats: { hp: 75, atk: 16, def: 4, spd: 8, luck: 12 }},
];

const CLASS_ABILITIES = {
  warrior: [
    { id: 'berserker_rage', name: 'Berserker Rage', icon: '🔥', desc: '2x ATK for this turn', cooldown: 4 },
    { id: 'shield_bash', name: 'Shield Bash', icon: '💥', desc: 'Stun enemy 1 turn', cooldown: 3 }
  ],
  mage: [
    { id: 'fireball', name: 'Fireball', icon: '☄️', desc: '3x damage', cooldown: 5 },
    { id: 'frost_nova', name: 'Frost Nova', icon: '❄️', desc: 'Stun enemy (skips next turn)', cooldown: 4 }
  ],
  ranger: [
    { id: 'eagle_eye', name: 'Eagle Eye', icon: '🎯', desc: 'Guaranteed hit, ignores DEF', cooldown: 3 },
    { id: 'rain_of_arrows', name: 'Rain of Arrows', icon: '🏹', desc: 'Hits 2-3 times', cooldown: 4 }
  ],
  paladin: [
    { id: 'divine_shield', name: 'Divine Shield', icon: '🛡️', desc: 'Block next enemy turn', cooldown: 4 },
    { id: 'holy_strike', name: 'Holy Strike', icon: '✨', desc: '2x damage + heal 20% of damage', cooldown: 4 }
  ],
  rogue: [
    { id: 'backstab', name: 'Backstab', icon: '🗡️', desc: 'Guaranteed crit', cooldown: 3 },
    { id: 'smoke_bomb', name: 'Smoke Bomb', icon: '💨', desc: 'Next flee attempt is guaranteed', cooldown: 3 }
  ],
  necro: [
    { id: 'soul_drain', name: 'Soul Drain', icon: '🧛', desc: '50% damage lifesteal', cooldown: 3 },
    { id: 'bone_shield', name: 'Bone Shield', icon: '💀', desc: 'Absorb next enemy hit completely', cooldown: 4 }
  ]
};

const ENEMIES = {
  // Forest enemies
  wolf:         { icon: '🐺', name: 'Shadow Wolf',      hp: 30,  atk: 8,  def: 3,  xp: 15, gold: 5,  biomes: ['forest','darkwood'] },
  spider:       { icon: '🕷️', name: 'Giant Spider',     hp: 25,  atk: 10, def: 2,  xp: 12, gold: 4,  biomes: ['forest','cave'] },
  treant:       { icon: '🌳', name: 'Corrupted Treant',  hp: 55,  atk: 12, def: 8,  xp: 30, gold: 12, biomes: ['darkwood'] },
  // Plains enemies
  bandit:       { icon: '🦹', name: 'Bandit',            hp: 35,  atk: 9,  def: 4,  xp: 18, gold: 15, biomes: ['plains','beach'] },
  boar:         { icon: '🐗', name: 'Wild Boar',         hp: 40,  atk: 11, def: 5,  xp: 20, gold: 3,  biomes: ['plains'] },
  // Desert enemies
  scorpion:     { icon: '🦂', name: 'Giant Scorpion',    hp: 38,  atk: 14, def: 6,  xp: 25, gold: 8,  biomes: ['desert'] },
  mummy:        { icon: '🧟', name: 'Ancient Mummy',     hp: 50,  atk: 12, def: 10, xp: 35, gold: 20, biomes: ['desert','ruins'] },
  // Mountain enemies
  golem:        { icon: '🗿', name: 'Stone Golem',       hp: 70,  atk: 15, def: 14, xp: 45, gold: 18, biomes: ['mountain'] },
  eagle:        { icon: '🦅', name: 'Storm Eagle',       hp: 28,  atk: 13, def: 3,  xp: 22, gold: 6,  biomes: ['mountain','tundra'] },
  // Swamp enemies
  slime:        { icon: '🟢', name: 'Toxic Slime',       hp: 20,  atk: 7,  def: 2,  xp: 10, gold: 3,  biomes: ['swamp'] },
  croc:         { icon: '🐊', name: 'Swamp Croc',        hp: 45,  atk: 13, def: 7,  xp: 28, gold: 10, biomes: ['swamp'] },
  // Tundra enemies
  yeti:         { icon: '🦍', name: 'Frost Yeti',        hp: 65,  atk: 16, def: 10, xp: 40, gold: 15, biomes: ['tundra'] },
  // Lava enemies
  demon:        { icon: '👹', name: 'Fire Demon',        hp: 80,  atk: 20, def: 12, xp: 55, gold: 25, biomes: ['lava'] },
  // Ruins enemies
  ghost:        { icon: '👻', name: 'Phantom',           hp: 35,  atk: 15, def: 1,  xp: 30, gold: 12, biomes: ['ruins'] },
  skeleton:     { icon: '💀', name: 'Skeleton Knight',   hp: 45,  atk: 14, def: 8,  xp: 32, gold: 14, biomes: ['ruins','dungeon'] },
  // Boss
  dragon:       { icon: '🐉', name: 'Shadow Dragon',    hp: 200, atk: 28, def: 18, xp: 200, gold: 100, biomes: ['fortress'], boss: true },
  lich:         { icon: '🧛', name: 'Lich King',        hp: 160, atk: 25, def: 15, xp: 150, gold: 80,  biomes: ['dungeon'], boss: true },
};

const ITEMS = {
  health_potion:  { icon: '🧪', name: 'Health Potion',  desc: 'Restores 40 HP', type: 'consumable', effect: { hp: 40 }, value: 15 },
  mana_crystal:   { icon: '💎', name: 'Mana Crystal',   desc: '+5 ATK for battle', type: 'consumable', effect: { tempAtk: 5 }, value: 20 },
  shield_scroll:  { icon: '📜', name: 'Shield Scroll',  desc: '+8 DEF for battle', type: 'consumable', effect: { tempDef: 8 }, value: 18 },
  lucky_charm:    { icon: '🍀', name: 'Lucky Charm',    desc: '+10 Luck permanently', type: 'permanent', effect: { luck: 10 }, value: 35 },
  iron_sword:     { icon: '🗡️', name: 'Iron Sword',    desc: 'ATK +4',  type: 'weapon', effect: { atk: 4 }, value: 25 },
  steel_sword:    { icon: '⚔️', name: 'Steel Blade',   desc: 'ATK +8',  type: 'weapon', effect: { atk: 8 }, value: 50 },
  shadow_blade:   { icon: '🔮', name: 'Shadow Blade',   desc: 'ATK +14', type: 'weapon', effect: { atk: 14 }, value: 100 },
  leather_armor:  { icon: '🦺', name: 'Leather Armor',  desc: 'DEF +3',  type: 'armor', effect: { def: 3 }, value: 20 },
  chain_mail:     { icon: '🛡️', name: 'Chain Mail',    desc: 'DEF +7',  type: 'armor', effect: { def: 7 }, value: 45 },
  plate_armor:    { icon: '🏋️', name: 'Plate Armor',   desc: 'DEF +12', type: 'armor', effect: { def: 12 }, value: 90 },
  amulet_life:    { icon: '📿', name: 'Amulet of Life', desc: 'Max HP +30', type: 'amulet', effect: { maxHp: 30 }, value: 60 },
  amulet_speed:   { icon: '💨', name: 'Wind Amulet',    desc: 'SPD +5', type: 'amulet', effect: { spd: 5 }, value: 55 },
  ancient_key:    { icon: '🗝️', name: 'Ancient Key',   desc: 'Opens sealed doors', type: 'quest', value: 0 },
  dragon_scale:   { icon: '🔥', name: 'Dragon Scale',   desc: 'Proof of dragon slaying', type: 'quest', value: 0 },
  map_fragment:   { icon: '🗺️', name: 'Map Fragment',  desc: 'Reveals nearby area', type: 'consumable', effect: { reveal: 3 }, value: 30 },
  herbal_elixir:  { icon: '🌿', name: 'Herbal Elixir',  desc: 'Potent draft. Restores 60 HP', type: 'consumable', effect: { hp: 60 }, value: 30 },
  merchant_ruby:  { icon: '💎', name: 'Merchant\'s Ruby', desc: '+15 Luck permanently', type: 'permanent', effect: { luck: 15 }, value: 80 },
  sunspire_elixir: { icon: '☀️', name: 'Sunspire Elixir', desc: '+3 SPD and +3 ATK permanently', type: 'permanent', effect: { spd: 3, atk: 3 }, value: 50 },
  frostbound_bow: { icon: '🏹', name: 'Frostbound Bow', desc: 'Frostbound hunt-bow. ATK +7, SPD +3', type: 'weapon', effect: { atk: 7, spd: 3 }, value: 65 },
  ice_amulet:     { icon: '❄️', name: 'Ice Amulet',     desc: 'Frosty northern relic. DEF +5, SPD +5', type: 'amulet', effect: { def: 5, spd: 5 }, value: 70 },
};

const LOOT_TABLES = {
  common:   ['health_potion', 'health_potion', 'mana_crystal', 'shield_scroll', 'lucky_charm'],
  forest:   ['health_potion', 'leather_armor', 'iron_sword', 'map_fragment'],
  desert:   ['mana_crystal', 'shield_scroll', 'amulet_speed', 'map_fragment'],
  mountain: ['iron_sword', 'chain_mail', 'health_potion'],
  ruins:    ['mana_crystal', 'amulet_life', 'steel_sword', 'ancient_key'],
  dungeon:  ['steel_sword', 'chain_mail', 'plate_armor', 'shadow_blade', 'amulet_life'],
  boss:     ['shadow_blade', 'plate_armor', 'amulet_life', 'dragon_scale'],
};

// ═══ GAME STATE ═══
const ACHIEVEMENT_STORAGE_KEY = 'realm_achievements';
const ACHIEVEMENT_DEFS = [
  { id: 'first_blood',     title: 'First Blood',     desc: 'Defeat 1 enemy',                  icon: '\uD83E\uDE78',       check: () => state.kills >= 1 },
  { id: 'slayer',          title: 'Slayer',          desc: 'Defeat 25 enemies',               icon: '\u2694\uFE0F',       check: () => state.kills >= 25 },
  { id: 'exterminator',    title: 'Exterminator',    desc: 'Defeat 100 enemies',              icon: '\u2620\uFE0F',       check: () => state.kills >= 100 },
  { id: 'explorer',        title: 'Explorer',        desc: 'Explore 20 tiles',                icon: '\uD83E\uDDED',       check: () => state.explored >= 20 },
  { id: 'cartographer',    title: 'Cartographer',    desc: 'Explore 100 tiles',               icon: '\uD83D\uDDFA\uFE0F', check: () => state.explored >= 100 },
  { id: 'treasure_hunter', title: 'Treasure Hunter', desc: 'Find 5 items from the ground',    icon: '\uD83D\uDC8E',       check: () => (state.groundLootFound || 0) >= 5 },
  { id: 'wealthy',         title: 'Wealthy',         desc: 'Accumulate 500 gold',             icon: '\uD83D\uDCB0',       check: () => state.player && state.player.gold >= 500 },
  { id: 'dragon_slayer',   title: 'Dragon Slayer',   desc: 'Defeat the Shadow Dragon',        icon: '\uD83D\uDC09',       check: () => state.bossDefeated },
  { id: 'survivor',        title: 'Survivor',        desc: 'Reach turn 50',                   icon: '\u23F3',             check: () => state.turn >= 50 },
  { id: 'speed_runner',    title: 'Speed Runner',    desc: 'Beat the game in under 30 turns', icon: '\u26A1',             check: () => state.bossDefeated && state.turn < 30 },
  { id: 'pacifist',        title: 'Pacifist',        desc: 'Flee from 5 combats',             icon: '\uD83D\uDD4A\uFE0F', check: () => (state.flees || 0) >= 5 },
  { id: 'ironman',         title: 'Ironman',         desc: 'Never use a potion',              icon: '\uD83D\uDEE1\uFE0F', check: () => state.bossDefeated && !state.potionUsed },
];

const STATUS_EFFECTS = {
  poison: { type: 'poison', icon: '\uD83D\uDFE2', turnsLeft: 3, dmgPerTurn: 5 },
  burn:   { type: 'burn',   icon: '\uD83D\uDD25', turnsLeft: 2, dmgPerTurn: 8 },
  freeze: { type: 'freeze', icon: '\uD83E\uDDCA', turnsLeft: 1, dmgPerTurn: 0 },
  stun:   { type: 'stun',   icon: '\u2B50',       turnsLeft: 1, dmgPerTurn: 0 },
};

let state = {
  screen: 'title', // title, creation, playing, combat, dead, victory
  turn: 1,
  movesLeft: MOVES_PER_TURN,
  player: null,
  map: [],
  revealed: [],
  locations: [],
  playerPos: { col: 0, row: 0 },
  inventory: [],
  equipped: { weapon: null, armor: null, amulet: null },
  quests: [],
  eventLog: [],
  kills: 0,
  explored: 0,
  combat: null,
  bossDefeated: false,
  // ── Day/Night & Weather ──
  timeIndex: 1,      // index into TIME_OF_DAY (starts at Day)
  weatherId: 'clear', // current weather id string
  achievements: loadAchievements(),
  potionUsed: false,
  flees: 0,
  groundLootFound: 0,
};

// ═══ MAP / CAMERA ═══
let camera = { x: 0, y: 0, zoom: 1 };
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let camStart = { x: 0, y: 0 };
let hoveredHex = null;
let mapCanvas, mapCtx, minimapCanvas, minimapCtx, bgCanvas, bgCtx;

// ═══ INITIALIZATION ═══
window.addEventListener('DOMContentLoaded', () => {
  bgCanvas = document.getElementById('bg-canvas');
  bgCtx = bgCanvas.getContext('2d');
  mapCanvas = document.getElementById('map-canvas');
  mapCtx = mapCanvas.getContext('2d');
  minimapCanvas = document.getElementById('minimap-canvas');
  minimapCtx = minimapCanvas.getContext('2d');

  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  initBgParticles();
  buildClassGrid();
  checkSaveGame();

  // Map interactions
  mapCanvas.addEventListener('mousedown', onMapMouseDown);
  mapCanvas.addEventListener('mousemove', onMapMouseMove);
  mapCanvas.addEventListener('mouseup', onMapMouseUp);
  mapCanvas.addEventListener('mouseleave', onMapMouseUp);
  mapCanvas.addEventListener('wheel', onMapWheel);
  mapCanvas.addEventListener('click', onMapClick);

  // Touch support
  mapCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
  mapCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
  mapCanvas.addEventListener('touchend', onTouchEnd);

  requestAnimationFrame(gameLoop);
});

function resizeCanvases() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;

  if (mapCanvas.parentElement) {
    mapCanvas.width = mapCanvas.parentElement.clientWidth;
    mapCanvas.height = mapCanvas.parentElement.clientHeight;
  }

  minimapCanvas.width = 160;
  minimapCanvas.height = 120;
}

// ═══ BACKGROUND PARTICLES ═══
let particles = [];

function initBgParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
      color: ['#5c6bc0', '#7c4dff', '#4dd0e1', '#ffd54f'][Math.floor(Math.random() * 4)],
    });
  }
}

function drawBgParticles() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = bgCanvas.width;
    if (p.x > bgCanvas.width) p.x = 0;
    if (p.y < 0) p.y = bgCanvas.height;
    if (p.y > bgCanvas.height) p.y = 0;

    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    bgCtx.fillStyle = p.color;
    bgCtx.globalAlpha = p.alpha;
    bgCtx.fill();
  }
  bgCtx.globalAlpha = 1;
}

// ═══ GAME LOOP ═══
function gameLoop(ts) {
  drawBgParticles();

  if (state.screen === 'playing' || state.screen === 'combat') {
    drawMap();
    drawMinimap();
  }

  requestAnimationFrame(gameLoop);
}

// ═══ CLASS SELECTION ═══
let selectedClass = null;

function buildClassGrid() {
  const grid = document.getElementById('class-grid');
  grid.innerHTML = '';
  CLASSES.forEach(cls => {
    const card = document.createElement('div');
    card.className = 'class-card';
    card.id = `class-${cls.id}`;
    card.innerHTML = `
      <div class="class-icon">${cls.icon}</div>
      <div class="class-name">${cls.name}</div>
      <div class="class-desc">${cls.desc}</div>
    `;
    card.addEventListener('click', () => selectClass(cls));
    grid.appendChild(card);
  });
}

function selectClass(cls) {
  selectedClass = cls;
  document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`class-${cls.id}`).classList.add('selected');

  const preview = document.getElementById('class-preview');
  preview.className = 'class-stats-preview visible';
  preview.innerHTML = `
    <div class="stat-row"><span class="stat-lbl">❤️ Health</span><span class="stat-val">${cls.stats.hp}</span></div>
    <div class="stat-row"><span class="stat-lbl">⚔️ Attack</span><span class="stat-val">${cls.stats.atk}</span></div>
    <div class="stat-row"><span class="stat-lbl">🛡️ Defense</span><span class="stat-val">${cls.stats.def}</span></div>
    <div class="stat-row"><span class="stat-lbl">💨 Speed</span><span class="stat-val">${cls.stats.spd}</span></div>
    <div class="stat-row"><span class="stat-lbl">🍀 Luck</span><span class="stat-val">${cls.stats.luck}</span></div>
  `;

  document.getElementById('btn-begin').disabled = false;
}

// ═══ SCREEN TRANSITIONS ═══
function showCharCreation() {
  document.getElementById('title-screen').classList.add('hidden');
  const cc = document.getElementById('char-creation');
  cc.classList.add('active');
}

function beginAdventure() {
  if (!selectedClass) return;
  const name = document.getElementById('hero-name-input').value.trim() || 'Wanderer';

  state.player = {
    name,
    class: selectedClass,
    level: 1,
    hp: selectedClass.stats.hp,
    maxHp: selectedClass.stats.hp,
    atk: selectedClass.stats.atk,
    def: selectedClass.stats.def,
    spd: selectedClass.stats.spd,
    luck: selectedClass.stats.luck,
    xp: 0,
    xpNeeded: 100,
    gold: 20,
  };

  state.inventory = [
    { ...ITEMS.health_potion, qty: 3 },
  ];
  state.equipped = { weapon: null, armor: null, amulet: null };
  state.quests = [
    { id: 'explore_5', title: 'Explorer', desc: 'Discover 5 new locations', target: 5, progress: 0, reward: { gold: 30, xp: 50 }, done: false },
    { id: 'kill_10', title: 'Monster Slayer', desc: 'Defeat 10 enemies', target: 10, progress: 0, reward: { gold: 50, xp: 80 }, done: false },
    { id: 'find_city', title: 'Civilization', desc: 'Discover a City', target: 1, progress: 0, reward: { gold: 40, item: 'iron_sword' }, done: false },
    { id: 'slay_dragon', title: 'Dragon Slayer', desc: 'Defeat the Shadow Dragon', target: 1, progress: 0, reward: { gold: 200, xp: 500 }, done: false },
  ];

  generateMap();
  // Multiplayer: host shares map seed + data with guest
  if (typeof MP !== 'undefined' && MP.isMultiplayer) {
    MP.onMapGenerated();
  }
  state.screen = 'playing';
  state.turn = 1;
  state.movesLeft = MOVES_PER_TURN;
  state.kills = 0;
  state.explored = 0;
  state.eventLog = [];
  state.potionUsed = false;
  state.flees = 0;
  state.groundLootFound = 0;
  state.bossDefeated = false;
  state.achievements = loadAchievements();

  document.getElementById('char-creation').classList.remove('active');
  document.getElementById('game-wrapper').classList.add('active');

  resizeCanvases();
  centerOnPlayer();
  updateHUD();
  updateLocationPanel();
  addLog('explore', `${name} steps into the unknown world. Your adventure begins!`);
  addLog('explore', `Use your moves to explore adjacent tiles. End turn to regain moves.`);

  showToast(`⚔️ ${name} the ${selectedClass.name} begins the quest!`);
}

// ═══ MAP GENERATION ═══
let mapSeed = 0;
function generateMap(customSeed) {
  // Initialize map with noise-based biome generation
  state.map = [];
  state.revealed = [];

  // Simplex-like noise using layered random
  const seed = (customSeed !== undefined) ? customSeed : (Math.random() * 10000);
  mapSeed = seed;
  const noise = (x, y) => {
    const n1 = Math.sin(x * 0.15 + seed) * Math.cos(y * 0.15 + seed * 0.7) * 0.5;
    const n2 = Math.sin(x * 0.08 - seed * 0.3) * Math.cos(y * 0.12 + seed * 0.5) * 0.3;
    const n3 = Math.cos(x * 0.2 + y * 0.1 + seed * 0.2) * 0.2;
    return n1 + n2 + n3;
  };

  const moisture = (x, y) => {
    const m1 = Math.sin(x * 0.1 + seed * 1.5) * Math.cos(y * 0.08 + seed * 0.3) * 0.5;
    const m2 = Math.cos(x * 0.05 + seed * 0.8) * Math.sin(y * 0.15 - seed) * 0.3;
    return m1 + m2 + 0.5;
  };

  for (let row = 0; row < MAP_ROWS; row++) {
    state.map[row] = [];
    state.revealed[row] = [];
    for (let col = 0; col < MAP_COLS; col++) {
      const elevation = noise(col, row);
      const moist = moisture(col, row);

      let biome;
      // Edge of map is ocean
      const edgeDist = Math.min(col, row, MAP_COLS - 1 - col, MAP_ROWS - 1 - row);
      if (edgeDist <= 1) {
        biome = 'ocean';
      } else if (edgeDist <= 2 && elevation < 0.1) {
        biome = 'water';
      } else if (elevation < -0.35) {
        biome = 'water';
      } else if (elevation < -0.25) {
        biome = edgeDist <= 3 ? 'beach' : 'plains';
      } else if (elevation < 0.0) {
        biome = moist > 0.6 ? 'forest' : 'plains';
      } else if (elevation < 0.15) {
        biome = moist > 0.7 ? 'darkwood' : moist > 0.4 ? 'forest' : moist < 0.2 ? 'desert' : 'plains';
      } else if (elevation < 0.25) {
        biome = moist > 0.6 ? 'swamp' : moist < 0.3 ? 'desert' : 'mountain';
      } else if (elevation < 0.35) {
        biome = moist > 0.5 ? 'tundra' : 'mountain';
      } else if (elevation < 0.45) {
        biome = 'mountain';
      } else {
        biome = 'peak';
      }

      state.map[row][col] = { biome, location: null };
      state.revealed[row][col] = false;
    }
  }

  // Place special biomes
  placeSpecialBiomes();

  // Find starting position on walkable tile near center
  let startCol = Math.floor(MAP_COLS / 2);
  let startRow = Math.floor(MAP_ROWS / 2);
  // Search outward for walkable
  for (let r = 0; r < 5; r++) {
    for (let dc = -r; dc <= r; dc++) {
      for (let dr = -r; dr <= r; dr++) {
        const c = startCol + dc;
        const rr = startRow + dr;
        if (c >= 0 && c < MAP_COLS && rr >= 0 && rr < MAP_ROWS) {
          const b = state.map[rr][c].biome;
          if (BIOMES[b].walkable) {
            startCol = c;
            startRow = rr;
            r = 99; dc = 99; dr = 99; // break all loops
          }
        }
      }
    }
  }

  // Ensure starting area is plains
  state.map[startRow][startCol].biome = 'plains';
  state.map[startRow][startCol].location = {
    type: 'camp',
    name: 'Wanderer\'s Camp',
    desc: 'A safe campfire to rest and prepare for the journey ahead.',
    visited: true,
    actions: ['rest'],
  };

  state.playerPos = { col: startCol, row: startRow };

  // Reveal starting area
  revealAround(startCol, startRow, 2);
  state.explored = 1;

  // Place locations
  placeLocations();
}

function placeSpecialBiomes() {
  // Add ruins patches
  for (let i = 0; i < 3; i++) {
    const rx = 3 + Math.floor(Math.random() * (MAP_COLS - 6));
    const ry = 3 + Math.floor(Math.random() * (MAP_ROWS - 6));
    if (BIOMES[state.map[ry][rx].biome].walkable) {
      state.map[ry][rx].biome = 'ruins';
    }
  }

  // Add lava area
  const lx = 3 + Math.floor(Math.random() * (MAP_COLS - 6));
  const ly = 3 + Math.floor(Math.random() * (MAP_ROWS - 6));
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const c = lx + dx, r = ly + dy;
      if (c >= 2 && c < MAP_COLS - 2 && r >= 2 && r < MAP_ROWS - 2) {
        if (Math.random() < 0.6) state.map[r][c].biome = 'lava';
      }
    }
  }
}

function placeLocations() {
  const placed = [];
  const tryPlace = (type, name, desc, biomes, actions, count = 1) => {
    let attempts = 0;
    let c = 0;
    while (c < count && attempts < 200) {
      attempts++;
      const col = 2 + Math.floor(Math.random() * (MAP_COLS - 4));
      const row = 2 + Math.floor(Math.random() * (MAP_ROWS - 4));
      const tile = state.map[row][col];
      if (!tile.location && BIOMES[tile.biome].walkable && biomes.includes(tile.biome)) {
        // Not too close to another location
        const tooClose = placed.some(p => Math.abs(p.col - col) + Math.abs(p.row - row) < 3);
        if (!tooClose) {
          tile.location = { type, name, desc, visited: false, actions };
          placed.push({ col, row });
          c++;
        }
      }
    }
  };

  // Villages
  tryPlace('village', 'Eldergrove', 'A quiet village of wise elders who know ancient secrets.', ['forest', 'plains'], ['rest', 'shop', 'talk'], 1);
  tryPlace('village', 'Sandwatch', 'Desert settlers who trade in rare spices and silks.', ['desert', 'plains'], ['rest', 'shop', 'talk'], 1);
  tryPlace('village', 'Frostholm', 'Hardy northerners who thrive in the cold.', ['tundra', 'mountain', 'plains'], ['rest', 'shop', 'talk'], 1);

  // Cities
  tryPlace('city', 'Ironhaven', 'A grand fortified city with towering walls and bustling markets.', ['plains', 'forest'], ['rest', 'shop', 'arena', 'talk'], 1);
  tryPlace('city', 'Sunspire', 'The golden city rises from the sands like a mirage.', ['desert', 'plains'], ['rest', 'shop', 'talk'], 1);

  // Dungeons
  tryPlace('dungeon', 'Crypt of Whispers', 'Dark corridors echo with the voices of the dead.', ['ruins', 'darkwood', 'mountain'], ['explore_dungeon'], 1);
  tryPlace('dungeon', 'Abyssal Pit', 'A bottomless chasm where nightmares dwell.', ['mountain', 'lava', 'ruins'], ['explore_dungeon'], 1);

  // Caves
  tryPlace('cave', 'Crystal Cavern', 'Glittering crystals illuminate the underground.', ['mountain', 'forest'], ['explore_dungeon'], 1);
  tryPlace('cave', 'Shadow Grotto', 'A dark cave hiding untold treasures.', ['swamp', 'darkwood'], ['explore_dungeon'], 1);

  // Shrines
  tryPlace('shrine', 'Shrine of Light', 'An ancient holy place radiating warm energy.', ['plains', 'forest', 'mountain'], ['pray'], 1);
  tryPlace('shrine', 'Moonwell', 'A mystical pool that reflects starlight even in day.', ['forest', 'darkwood', 'tundra'], ['pray'], 1);

  // Towers
  tryPlace('tower', 'Arcane Spire', 'A wizard\'s tower crackling with magical energy.', ['ruins', 'plains', 'mountain'], ['study', 'shop'], 1);

  // Markets
  tryPlace('market', 'Trader\'s Post', 'A crossroads market with rare goods from distant lands.', ['plains', 'beach', 'desert'], ['shop'], 1);

  // Fortress (boss location)
  tryPlace('fortress', 'Shadowkeep', 'The dark fortress where the Shadow Dragon resides. Only the bravest dare enter.', ['lava', 'mountain', 'darkwood', 'ruins'], ['boss_fight'], 1);

  // Portals
  tryPlace('portal', 'Void Gate', 'A shimmering portal to an unknown dimension.', ['ruins', 'lava', 'tundra'], ['enter_portal'], 1);

  // Treasures (hidden)
  tryPlace('treasure', 'Hidden Cache', 'A forgotten treasure buried long ago.', ['beach', 'desert', 'forest', 'mountain', 'swamp'], ['open_treasure'], 3);

  // Oasis
  tryPlace('oasis', 'Desert Spring', 'A refreshing oasis in the harsh desert.', ['desert'], ['rest'], 1);
}

// ═══ HEX MATH ═══
function hexToPixel(col, row) {
  const w = HEX_SIZE * 2;
  const h = Math.sqrt(3) * HEX_SIZE;
  const x = col * w * 0.75;
  const y = row * h + (col % 2 === 1 ? h * 0.5 : 0);
  return { x, y };
}

function pixelToHex(px, py) {
  const w = HEX_SIZE * 2;
  const h = Math.sqrt(3) * HEX_SIZE;

  // Approximate column
  const col = Math.round(px / (w * 0.75));
  const offsetY = col % 2 === 1 ? h * 0.5 : 0;
  const row = Math.round((py - offsetY) / h);

  return { col, row };
}

function hexCorners(cx, cy, size) {
  const corners = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 30);
    corners.push({
      x: cx + size * Math.cos(angle),
      y: cy + size * Math.sin(angle),
    });
  }
  return corners;
}

function getNeighbors(col, row) {
  const neighbors = [];
  const isOdd = col % 2 === 1;
  const dirs = isOdd
    ? [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [0, -1]]
    : [[1, -1], [1, 0], [0, 1], [-1, 0], [-1, -1], [0, -1]];

  for (const [dc, dr] of dirs) {
    const nc = col + dc;
    const nr = row + dr;
    if (nc >= 0 && nc < MAP_COLS && nr >= 0 && nr < MAP_ROWS) {
      neighbors.push({ col: nc, row: nr });
    }
  }
  return neighbors;
}

function hexDistance(c1, r1, c2, r2) {
  // Convert offset to cube coordinates
  const toCube = (col, row) => {
    const x = col;
    const z = row - (col - (col & 1)) / 2;
    const y = -x - z;
    return { x, y, z };
  };
  const a = toCube(c1, r1);
  const b = toCube(c2, r2);
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}

// ═══ MAP RENDERING ═══
function drawMap() {
  if (!mapCtx) return;
  const w = mapCanvas.width;
  const h = mapCanvas.height;
  mapCtx.clearRect(0, 0, w, h);

  // Background
  mapCtx.fillStyle = '#060a12';
  mapCtx.fillRect(0, 0, w, h);

  mapCtx.save();
  mapCtx.translate(w / 2, h / 2);
  mapCtx.scale(camera.zoom, camera.zoom);
  mapCtx.translate(-camera.x, -camera.y);

  const hexW = HEX_SIZE * 2;
  const hexH = Math.sqrt(3) * HEX_SIZE;

  // Calculate visible range
  const viewLeft = camera.x - w / 2 / camera.zoom;
  const viewRight = camera.x + w / 2 / camera.zoom;
  const viewTop = camera.y - h / 2 / camera.zoom;
  const viewBottom = camera.y + h / 2 / camera.zoom;

  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      const { x: cx, y: cy } = hexToPixel(col, row);

      // Frustum culling
      if (cx < viewLeft - hexW || cx > viewRight + hexW || cy < viewTop - hexH || cy > viewBottom + hexH) continue;

      const tile = state.map[row][col];
      const revealed = state.revealed[row][col];
      const biome = BIOMES[tile.biome];

      if (!revealed) {
        // Fog of war
        drawHex(mapCtx, cx, cy, HEX_SIZE - 1, '#111622', '#0a0f1c');
        continue;
      }

      // Biome hex
      const isPlayerHere = state.playerPos.col === col && state.playerPos.row === row;
      const isHovered = hoveredHex && hoveredHex.col === col && hoveredHex.row === row;
      const isAdjacent = isAdjacentToPlayer(col, row);

      let fillColor = biome.color;
      let strokeColor = 'rgba(255,255,255,0.08)';
      let strokeWidth = 0.5;

      if (isPlayerHere) {
        strokeColor = '#ffd54f';
        strokeWidth = 2.5;
      } else if (isHovered && isAdjacent && biome.walkable && state.movesLeft > 0) {
        fillColor = lightenColor(biome.color, 25);
        strokeColor = 'rgba(255,255,255,0.4)';
        strokeWidth = 1.5;
      } else if (isAdjacent && biome.walkable && state.movesLeft > 0) {
        strokeColor = 'rgba(255,255,255,0.15)';
        strokeWidth = 1;
      }

      drawHex(mapCtx, cx, cy, HEX_SIZE - 1, fillColor, strokeColor, strokeWidth);

      // ── Biome Animations (drawn after fill, before icons) ──
      drawBiomeAnimation(mapCtx, tile.biome, cx, cy, col, row);

      // Location marker
      if (tile.location) {
        const locType = LOCATION_TYPES[tile.location.type];
        if (locType) {
          // Glow effect
          mapCtx.beginPath();
          const gradient = mapCtx.createRadialGradient(cx, cy, 0, cx, cy, HEX_SIZE * 0.6);
          gradient.addColorStop(0, locType.color + '40');
          gradient.addColorStop(1, 'transparent');
          mapCtx.fillStyle = gradient;
          mapCtx.arc(cx, cy, HEX_SIZE * 0.6, 0, Math.PI * 2);
          mapCtx.fill();

          // Icon
          mapCtx.font = `${HEX_SIZE * 0.55}px serif`;
          mapCtx.textAlign = 'center';
          mapCtx.textBaseline = 'middle';
          mapCtx.fillText(locType.icon, cx, cy);

          // Visited dot
          if (!tile.location.visited) {
            mapCtx.beginPath();
            mapCtx.arc(cx + HEX_SIZE * 0.35, cy - HEX_SIZE * 0.35, 3, 0, Math.PI * 2);
            mapCtx.fillStyle = '#ff5252';
            mapCtx.fill();
          }
        }
      }

      // Player marker
      if (isPlayerHere) {
        // Pulsing glow
        const pulseR = HEX_SIZE * 0.5 + Math.sin(Date.now() / 400) * 3;
        const glow = mapCtx.createRadialGradient(cx, cy, 0, cx, cy, pulseR);
        glow.addColorStop(0, 'rgba(255, 213, 79, 0.3)');
        glow.addColorStop(1, 'transparent');
        mapCtx.beginPath();
        mapCtx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        mapCtx.fillStyle = glow;
        mapCtx.fill();

        mapCtx.font = `${HEX_SIZE * 0.6}px serif`;
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        mapCtx.fillText(state.player.class.icon, cx, cy);
      }
    }
  }

  // Multiplayer: draw opponent's position
  if (typeof MP !== 'undefined' && MP.isMultiplayer && MP.opponentData && MP.opponentData.pos) {
    MP.drawOpponent(mapCtx);
  }

  // ── Weather / Time overlay tint ──
  drawWeatherOverlay(mapCtx, w, h);

  mapCtx.restore();
}

// Apply time-of-day + weather overlay tint AFTER the world is rendered
// (called outside the camera transform so it covers the full canvas)
function drawWeatherOverlay(ctx, w, h) {
  const tod = getTimeOfDay();
  const wx  = getWeather();

  // Time-of-day layer
  if (tod.overlay) {
    const [r, g, b, a] = tod.overlay;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fillRect(0, 0, w, h);
  }

  // Weather layer (stacks on top — additive atmosphere)
  if (wx.overlay) {
    const [r, g, b, a] = wx.overlay;
    ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawHex(ctx, cx, cy, size, fill, stroke, lineWidth = 0.5) {
  const corners = hexCorners(cx, cy, size);
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

// ─── Biome Animation Helper ──────────────────────────────────────────────────
// Clips to the hex shape, draws the effect, then restores. All timing via Date.now().
function drawBiomeAnimation(ctx, biome, cx, cy, col, row) {
  const t = Date.now();
  const size = HEX_SIZE - 2;   // slightly inset so animation stays inside
  const r = size;               // convenience alias

  // Build hex clip path once
  const corners = hexCorners(cx, cy, size);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  for (let i = 1; i < 6; i++) ctx.lineTo(corners[i].x, corners[i].y);
  ctx.closePath();
  ctx.clip();

  switch (biome) {

    /* ── Ocean / Water: 3 sine-wave lines ─────────────────────────────── */
    case 'ocean':
    case 'water': {
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = '#64b5f6';
      ctx.lineWidth = 1.2;
      const waveCount = 3;
      for (let w = 0; w < waveCount; w++) {
        const phase = (t / 1200) + w * 1.1;           // phase-shift per wave
        const yBase = cy - r * 0.5 + w * (r * 0.5);  // distribute vertically
        const amp   = r * 0.12;
        ctx.beginPath();
        // Draw wave across the hex width
        for (let px = cx - r; px <= cx + r; px += 2) {
          const py = yBase + Math.sin((px - cx) / (r * 0.5) + phase) * amp;
          px === cx - r ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      break;
    }

    /* ── Lava: 4-6 flickering ember circles ────────────────────────────── */
    case 'lava': {
      const seed0 = col * 31 + row * 17;           // deterministic seed per tile
      const emberCount = 4 + (seed0 % 3);          // 4, 5, or 6
      for (let e = 0; e < emberCount; e++) {
        const seed = seed0 + e * 7;
        // Pseudo-random positions within the hex bounding circle
        const angle = (seed * 137.508) % (Math.PI * 2);
        const dist  = (((seed * 53) % 100) / 100) * r * 0.65;
        const ex    = cx + Math.cos(angle) * dist;
        const ey    = cy + Math.sin(angle) * dist;
        const radius = 1.5 + ((seed % 5) / 5) * 2.5;
        // Flicker: opacity oscillates between 0.3 and 0.7
        const alpha = 0.3 + 0.2 * (Math.sin(t / 300 + seed) * 0.5 + 0.5);
        ctx.globalAlpha = alpha;
        // Colour cycles between orange and yellow
        const hue = 25 + ((Math.sin(t / 500 + seed) * 0.5 + 0.5) * 20);
        ctx.fillStyle = `hsl(${hue}, 100%, 55%)`;
        ctx.beginPath();
        ctx.arc(ex, ey, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    /* ── Tundra: 5-7 drifting snow dots ────────────────────────────────── */
    case 'tundra': {
      const seed0 = col * 23 + row * 41;
      const snowCount = 5 + (seed0 % 3);           // 5, 6, or 7
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < snowCount; s++) {
        const seed = seed0 + s * 11;
        // Normalised X position: pseudo-random per flake
        const nx = ((seed * 73) % 100) / 100;      // 0..1
        // Y drifts downward over time, wrapping
        const ny = ((t / 2000 + seed * 0.37)) % 1; // 0..1 wrapping
        const fx = cx - r + nx * r * 2;
        const fy = cy - r + ny * r * 2;
        const radius = 1 + ((seed % 3) / 3) * 1.2;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    /* ── Swamp: slow pulsing ripple ─────────────────────────────────────── */
    case 'swamp': {
      const minR = r * 0.15;
      const maxR = r * 0.45;
      const rippleR = minR + (Math.sin(t / 800) * 0.5 + 0.5) * (maxR - minR);
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = '#76ff03';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
      ctx.stroke();
      // Second ripple slightly out-of-phase
      const rippleR2 = minR + (Math.sin(t / 800 + 1.8) * 0.5 + 0.5) * (maxR - minR);
      ctx.globalAlpha = 0.08;
      ctx.beginPath();
      ctx.arc(cx, cy, rippleR2, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    /* ── Forest / Darkwood: drifting leaf ──────────────────────────────── */
    case 'forest':
    case 'darkwood': {
      const seed0 = col * 19 + row * 37;
      // Phase controls when the leaf is visible (cycles every ~4s)
      const cycle = (t / 4000 + (seed0 * 0.31)) % 1;
      // Only show leaf during the first ~60% of the cycle
      if (cycle < 0.6) {
        const progress = cycle / 0.6;             // 0..1 within visible phase
        // Start near top-right, drift to bottom-left with slight wobble
        const lx = cx + r * 0.35 - progress * r * 0.7 + Math.sin(progress * Math.PI * 3 + seed0) * r * 0.15;
        const ly = cy - r * 0.4  + progress * r * 0.9;
        const leafSize = 3 + ((seed0 % 4) / 4) * 2.5;
        const alpha = 0.15 * Math.sin(progress * Math.PI); // fade in/out
        ctx.globalAlpha = alpha;
        ctx.fillStyle = biome === 'darkwood' ? '#33691e' : '#4caf50';
        // Draw a simple oval "leaf"
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(progress * Math.PI * 2 + seed0);
        ctx.beginPath();
        ctx.ellipse(0, 0, leafSize, leafSize * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      break;
    }

  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawMinimap() {
  const mw = minimapCanvas.width;
  const mh = minimapCanvas.height;
  minimapCtx.clearRect(0, 0, mw, mh);
  minimapCtx.fillStyle = '#0a0f1c';
  minimapCtx.fillRect(0, 0, mw, mh);

  const scaleX = mw / MAP_COLS;
  const scaleY = mh / MAP_ROWS;
  const s = Math.min(scaleX, scaleY);

  for (let row = 0; row < MAP_ROWS; row++) {
    for (let col = 0; col < MAP_COLS; col++) {
      if (!state.revealed[row][col]) continue;
      const tile = state.map[row][col];
      const biome = BIOMES[tile.biome];
      minimapCtx.fillStyle = biome.color;
      minimapCtx.fillRect(col * s, row * s, s, s);

      if (tile.location) {
        const locType = LOCATION_TYPES[tile.location.type];
        minimapCtx.fillStyle = locType.color;
        minimapCtx.fillRect(col * s + 1, row * s + 1, s - 2, s - 2);
      }
    }
  }

  // Player position
  minimapCtx.fillStyle = '#ffd54f';
  minimapCtx.beginPath();
  minimapCtx.arc(
    state.playerPos.col * s + s / 2,
    state.playerPos.row * s + s / 2,
    3, 0, Math.PI * 2
  );
  minimapCtx.fill();

  // Camera viewport rectangle
  const hexW = HEX_SIZE * 2;
  const hexH = Math.sqrt(3) * HEX_SIZE;
  const viewW = mapCanvas.width / camera.zoom / (hexW * 0.75);
  const viewH = mapCanvas.height / camera.zoom / hexH;
  const viewCol = camera.x / (hexW * 0.75) - viewW / 2;
  const viewRow = camera.y / hexH - viewH / 2;

  minimapCtx.strokeStyle = 'rgba(255,255,255,0.5)';
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeRect(viewCol * s, viewRow * s, viewW * s, viewH * s);
}

// ═══ MAP INTERACTIONS ═══
function onMapMouseDown(e) {
  isDragging = true;
  dragStart = { x: e.clientX, y: e.clientY };
  camStart = { x: camera.x, y: camera.y };
}

function onMapMouseMove(e) {
  if (isDragging) {
    const dx = (e.clientX - dragStart.x) / camera.zoom;
    const dy = (e.clientY - dragStart.y) / camera.zoom;
    camera.x = camStart.x - dx;
    camera.y = camStart.y - dy;
  }

  // Hover detection
  const rect = mapCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;

  const worldX = (mx - mapCanvas.width / 2) / camera.zoom + camera.x;
  const worldY = (my - mapCanvas.height / 2) / camera.zoom + camera.y;

  hoveredHex = pixelToHex(worldX, worldY);

  // Clamp
  if (hoveredHex.col < 0 || hoveredHex.col >= MAP_COLS || hoveredHex.row < 0 || hoveredHex.row >= MAP_ROWS) {
    hoveredHex = null;
    hideTooltip();
    return;
  }

  // Tooltip
  const tile = state.map[hoveredHex.row][hoveredHex.col];
  if (state.revealed[hoveredHex.row][hoveredHex.col]) {
    const biome = BIOMES[tile.biome];
    const tt = document.getElementById('map-tooltip');
    document.getElementById('tt-name').textContent = tile.location ? tile.location.name : biome.name;
    document.getElementById('tt-type').textContent = tile.location ? LOCATION_TYPES[tile.location.type].name : tile.biome.toUpperCase();

    let desc = '';
    if (tile.location) {
      desc = tile.location.desc;
    } else if (!biome.walkable) {
      desc = 'Impassable terrain.';
    } else {
      desc = 'Click to move here.';
    }
    document.getElementById('tt-desc').textContent = desc;

    tt.style.left = (e.clientX + 15) + 'px';
    tt.style.top = (e.clientY - 10) + 'px';
    tt.classList.add('visible');
  } else {
    hideTooltip();
  }
}

function onMapMouseUp(e) {
  isDragging = false;
}

function onMapClick(e) {
  if (state.screen !== 'playing' || state.movesLeft <= 0) return;

  // Detect if it was a drag
  const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
  if (dist > 5) return; // Was a drag, not a click

  if (!hoveredHex) return;
  const { col, row } = hoveredHex;

  if (col === state.playerPos.col && row === state.playerPos.row) return;
  if (!state.revealed[row][col]) return;

  const tile = state.map[row][col];
  const biome = BIOMES[tile.biome];
  if (!biome.walkable) {
    showToast(`❌ ${biome.name} is impassable!`);
    return;
  }

  if (!isAdjacentToPlayer(col, row)) {
    showToast(`⚠️ Too far! Move to an adjacent tile.`);
    return;
  }

  movePlayer(col, row);
}

function onMapWheel(e) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -1 : 1;
  zoomMap(delta);
}

// Touch support
let lastTouchDist = 0;
function onTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    isDragging = true;
    dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    camStart = { x: camera.x, y: camera.y };
  } else if (e.touches.length === 2) {
    lastTouchDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
  }
}

function onTouchMove(e) {
  e.preventDefault();
  if (e.touches.length === 1 && isDragging) {
    const dx = (e.touches[0].clientX - dragStart.x) / camera.zoom;
    const dy = (e.touches[0].clientY - dragStart.y) / camera.zoom;
    camera.x = camStart.x - dx;
    camera.y = camStart.y - dy;
  } else if (e.touches.length === 2) {
    const dist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const delta = dist - lastTouchDist;
    if (Math.abs(delta) > 5) {
      zoomMap(delta > 0 ? 1 : -1);
      lastTouchDist = dist;
    }
  }
}

function onTouchEnd(e) {
  isDragging = false;
  // Simulate click on single tap
  if (e.changedTouches.length === 1) {
    const touch = e.changedTouches[0];
    const dist = Math.hypot(touch.clientX - dragStart.x, touch.clientY - dragStart.y);
    if (dist < 10) {
      const rect = mapCanvas.getBoundingClientRect();
      const mx = touch.clientX - rect.left;
      const my = touch.clientY - rect.top;
      const worldX = (mx - mapCanvas.width / 2) / camera.zoom + camera.x;
      const worldY = (my - mapCanvas.height / 2) / camera.zoom + camera.y;
      hoveredHex = pixelToHex(worldX, worldY);
      if (hoveredHex && hoveredHex.col >= 0 && hoveredHex.col < MAP_COLS && hoveredHex.row >= 0 && hoveredHex.row < MAP_ROWS) {
        onMapClick({ clientX: touch.clientX, clientY: touch.clientY });
      }
    }
  }
}

function hideTooltip() {
  document.getElementById('map-tooltip').classList.remove('visible');
}

function zoomMap(dir) {
  camera.zoom = Math.max(0.4, Math.min(2.5, camera.zoom + dir * 0.15));
}

function centerOnPlayer() {
  const pos = hexToPixel(state.playerPos.col, state.playerPos.row);
  camera.x = pos.x;
  camera.y = pos.y;
}

function isAdjacentToPlayer(col, row) {
  const neighbors = getNeighbors(state.playerPos.col, state.playerPos.row);
  return neighbors.some(n => n.col === col && n.row === row);
}

// ═══ WEATHER / TIME ACCESSORS ═══
function getTimeOfDay() {
  return TIME_OF_DAY[state.timeIndex] || TIME_OF_DAY[1];
}

function getWeather() {
  return WEATHER_TYPES.find(w => w.id === state.weatherId) || WEATHER_TYPES[0];
}

// Roll new weather; ash_storm only on lava/desert tiles near player
function rollWeather() {
  const tile = state.map[state.playerPos.row][state.playerPos.col];
  const nearLavOrDesert = tile && (tile.biome === 'lava' || tile.biome === 'desert');
  const pool = nearLavOrDesert
    ? ['clear','rain','fog','storm','ash_storm']
    : ['clear','clear','rain','fog','storm']; // clear weighted higher
  state.weatherId = pool[Math.floor(Math.random() * pool.length)];
}

// ═══ PLAYER MOVEMENT ═══
function movePlayer(col, row) {
  SoundEngine.playStep();
  state.playerPos = { col, row };
  state.movesLeft--;
  // Multiplayer: broadcast new position
  if (typeof MP !== 'undefined' && MP.isMultiplayer) {
    MP.broadcast('move', { col, row });
  }

  // Fog of war reveal — Fog weather halves radius
  const revealRadius = state.weatherId === 'fog' ? 1 : 2;
  const newReveals = revealAround(col, row, revealRadius);
  if (newReveals > 0) {
    state.explored += newReveals;
    updateQuestProgress('explore_5', newReveals);
  }

  const tile = state.map[row][col];
  const biome = BIOMES[tile.biome];

  // Rain heal in forest/swamp
  if (state.weatherId === 'rain' && (tile.biome === 'forest' || tile.biome === 'swamp' || tile.biome === 'darkwood')) {
    const rainHeal = 3;
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + rainHeal);
    addLog('heal', `🌧️ Rain heals you for ${rainHeal} HP in the ${biome.name}.`);
  }

  // Night: +20% encounter chance; ghost spawns everywhere
  const isNight = getTimeOfDay().id === 'night';
  let encounterChance = getEncounterChance(tile.biome);
  if (isNight) encounterChance = Math.min(0.95, encounterChance * 1.2);

  if (!tile.location && Math.random() < encounterChance) {
    const enemy = getRandomEnemy(tile.biome, isNight);
    if (enemy) {
      addLog('combat', `⚠️ A wild ${enemy.name} appears!`);
      startCombat(enemy);
      updateHUD();
      updateTurnIndicator();
      return;
    }
  }

  // Random loot find
  if (!tile.location && Math.random() < 0.08) {
    const lootTable = LOOT_TABLES[tile.biome] || LOOT_TABLES.common;
    const itemKey = lootTable[Math.floor(Math.random() * lootTable.length)];
    const item = ITEMS[itemKey];
    if (item) {
      addItemToInventory(itemKey);
      state.groundLootFound = (state.groundLootFound || 0) + 1;
      addLog('loot', `💰 Found ${item.icon} ${item.name}!`);
      showToast(`💰 Found ${item.icon} ${item.name}!`, 'loot');
    }
  }

  // Location discovery
  if (tile.location && !tile.location.visited) {
    tile.location.visited = true;
    const locType = LOCATION_TYPES[tile.location.type];
    addLog('explore', `📍 Discovered ${locType.icon} ${tile.location.name}!`);
    showToast(`📍 Discovered ${locType.icon} ${tile.location.name}!`, 'quest');

    if (tile.location.type === 'city') {
      updateQuestProgress('find_city', 1);
    }
  }

  updateHUD();
  updateLocationPanel();
  updateTurnIndicator();
  hideTooltip();
}

function revealAround(col, row, radius) {
  let count = 0;
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (!state.revealed[r][c] && hexDistance(col, row, c, r) <= radius) {
        state.revealed[r][c] = true;
        count++;
      }
    }
  }
  return count;
}

function getEncounterChance(biome) {
  const chances = {
    plains: 0.12, forest: 0.2, darkwood: 0.3, mountain: 0.25,
    desert: 0.2, swamp: 0.25, tundra: 0.18, lava: 0.35,
    ruins: 0.3, beach: 0.05, beach: 0.05
  };
  return chances[biome] || 0.1;
}

function getRandomEnemy(biome, nightMode = false) {
  // Night: 30% chance a ghost/phantom spawns regardless of biome
  if (nightMode && Math.random() < 0.30) {
    const nightCreatures = Object.entries(ENEMIES).filter(([k]) => k === 'ghost' || k === 'skeleton');
    if (nightCreatures.length > 0) {
      const [, ne] = nightCreatures[Math.floor(Math.random() * nightCreatures.length)];
      const lvl = state.player.level;
      return { ...ne,
        hp:   Math.floor(ne.hp  * (1 + (lvl-1)*0.15)),
        atk:  Math.floor(ne.atk * (1 + (lvl-1)*0.10)),
        def:  Math.floor(ne.def * (1 + (lvl-1)*0.08)),
        xp:   Math.floor(ne.xp  * (1 + (lvl-1)*0.10)),
        gold: Math.floor(ne.gold* (1 + (lvl-1)*0.10)),
      };
    }
  }

  const eligible = Object.entries(ENEMIES).filter(([, e]) =>
    !e.boss && e.biomes.includes(biome)
  );
  if (eligible.length === 0) {
    // Fallback to generic enemies
    const fallback = Object.entries(ENEMIES).filter(([, e]) => !e.boss);
    const [, enemy] = fallback[Math.floor(Math.random() * fallback.length)];
    return { ...enemy };
  }
  const [, enemy] = eligible[Math.floor(Math.random() * eligible.length)];

  // Scale enemy to player level
  const lvl = state.player.level;
  const scaled = { ...enemy };
  scaled.hp = Math.floor(enemy.hp * (1 + (lvl - 1) * 0.15));
  scaled.atk = Math.floor(enemy.atk * (1 + (lvl - 1) * 0.1));
  scaled.def = Math.floor(enemy.def * (1 + (lvl - 1) * 0.08));
  scaled.xp = Math.floor(enemy.xp * (1 + (lvl - 1) * 0.1));
  scaled.gold = Math.floor(enemy.gold * (1 + (lvl - 1) * 0.1));
  return scaled;
}

// ═══ TURN SYSTEM ═══
function endTurn() {
  // Storm blocks ending the turn
  if (state.weatherId === 'storm') {
    showToast('⛈️ A violent storm rages! You cannot rest — wait it out!');
    addLog('danger', `⛈️ Storm raging — cannot end turn! Move to shelter.`);
    return;
  }

  state.turn++;
  state.movesLeft = MOVES_PER_TURN;

  // Advance time of day every 5 turns
  if ((state.turn - 1) % 5 === 0) {
    state.timeIndex = (state.timeIndex + 1) % TIME_OF_DAY.length;
    const tod = getTimeOfDay();
    addLog('explore', `${tod.icon} ${tod.label} breaks over the realm.`);
    showToast(`${tod.icon} ${tod.label}`);
  }

  // Change weather every 3 turns
  if ((state.turn - 1) % 3 === 0) {
    const prevWeather = state.weatherId;
    rollWeather();
    if (state.weatherId !== prevWeather) {
      const w = getWeather();
      addLog('explore', `${w.icon} Weather shifts to ${w.label}.`);
      if (state.weatherId !== 'clear') showToast(`${w.icon} ${w.label}!`);
    }
  }

  // Passive HP regen at camp/village/city
  const tile = state.map[state.playerPos.row][state.playerPos.col];
  if (tile.location && ['camp', 'village', 'city', 'oasis'].includes(tile.location.type)) {
    const heal = Math.floor(state.player.maxHp * 0.05);
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    if (heal > 0) addLog('heal', `💚 Rested and recovered ${heal} HP.`);
  }

  updateHUD();
  updateTurnIndicator();
  addLog('explore', `── Turn ${state.turn} ──`);
}

function updateTurnIndicator() {
  const el = document.getElementById('turn-indicator');
  const tod = getTimeOfDay();
  const wx  = getWeather();
  // Only show weather icon when not clear
  const wxPart = wx.id !== 'clear' ? ` · ${wx.icon} ${wx.label}` : '';
  el.textContent = `Turn ${state.turn} · ${tod.icon} ${tod.label}${wxPart} · Moves: ${state.movesLeft}/${MOVES_PER_TURN}`;
}

// ═══ COMBAT SYSTEM ═══
function startCombat(enemy) {
  state.screen = 'combat';
  state.combat = {
    enemy: { ...enemy, currentHp: enemy.hp },
    playerDefending: false,
    log: [],
    tempBuffs: { atk: 0, def: 0 },
    cooldowns: {},
    activeEffects: [],
    combo: 0,
    finisherCooldown: 0,
    divineShieldActive: false,
    boneShieldActive: false,
    smokeBombActive: false,
    isLocked: false,
  };

  const overlay = document.getElementById('combat-overlay');
  overlay.classList.add('active');

  document.getElementById('combat-title').textContent = `⚔️ ${enemy.name} attacks!`;
  document.getElementById('fighter-player-sprite').textContent = state.player.class.icon;
  document.getElementById('fighter-player-name').textContent = state.player.name;
  document.getElementById('fighter-enemy-sprite').textContent = enemy.icon;
  document.getElementById('fighter-enemy-name').textContent = enemy.name;

  updateCombatUI();
  document.getElementById('combat-log').innerHTML = '';

  addCombatLog(`A ${enemy.name} blocks your path!`);

  // Check heal availability
  updateCombatHealBtn();
}

function getPlayerCombatDefense(includeDefending = false) {
  const c = state.combat;
  return state.player.def + getEquipBonus('def') + (includeDefending && c.playerDefending ? 8 : 0) + c.tempBuffs.def;
}

function incrementCombo() {
  const c = state.combat;
  if (!c) return;
  c.combo = (c.combo || 0) + 1;
}

function resetCombo() {
  const c = state.combat;
  if (!c) return;
  c.combo = 0;
}

function updateComboUI() {
  const c = state.combat;
  const counter = document.getElementById('combo-counter');
  const finisherBtn = document.getElementById('combat-finisher-btn');
  if (!counter || !finisherBtn) return;

  const combo = c ? (c.combo || 0) : 0;
  counter.textContent = combo > 0 ? `${combo}x COMBO` : '';
  counter.classList.toggle('show', combo > 0);
  counter.classList.toggle('combo-glow', combo > 5);

  const canUseFinisher = c && combo >= 3 && (c.finisherCooldown || 0) <= 0 && !c.isLocked;
  finisherBtn.style.display = canUseFinisher ? 'inline-flex' : 'none';
  finisherBtn.disabled = !canUseFinisher;
}

function getEnemyHitStatusType(enemy) {
  const biomes = enemy.biomes || [];
  if (biomes.includes('swamp')) return 'poison';
  if (biomes.includes('lava') || enemy.name.includes('Fire')) return 'burn';
  if (biomes.includes('tundra')) return 'freeze';
  return null;
}

function getEffectTarget(type) {
  return type === 'stun' ? 'enemy' : 'player';
}

function applyStatusEffect(type) {
  const template = STATUS_EFFECTS[type];
  const c = state.combat;
  if (!template || !c) return;

  const existing = c.activeEffects.find(effect => effect.type === type);
  if (existing) {
    existing.turnsLeft = Math.max(existing.turnsLeft, template.turnsLeft);
    existing.dmgPerTurn = template.dmgPerTurn;
  } else {
    c.activeEffects.push({ ...template });
  }

  const targetName = getEffectTarget(type) === 'enemy' ? c.enemy.name : state.player.name;
  addCombatLog(`${template.icon} ${targetName} is afflicted with ${type.toUpperCase()}!`, type === 'burn' ? 'enemy-hit' : 'player-hit');
  updateCombatUI();
}

function maybeApplyEnemyHitStatus(enemy) {
  const type = getEnemyHitStatusType(enemy);
  if (type && Math.random() < 0.35) {
    applyStatusEffect(type);
  }
}

function renderStatusEffects() {
  const c = state.combat;
  const playerEl = document.getElementById('fighter-player-effects');
  const enemyEl = document.getElementById('fighter-enemy-effects');
  if (!playerEl || !enemyEl) return;

  playerEl.innerHTML = '';
  enemyEl.innerHTML = '';
  if (!c) return;

  c.activeEffects.forEach(effect => {
    const badge = document.createElement('div');
    badge.className = `status-badge ${effect.type}`;
    badge.title = `${effect.type}: ${effect.turnsLeft} turn${effect.turnsLeft === 1 ? '' : 's'} left`;
    badge.innerHTML = `
      <span class="status-icon">${effect.icon}</span>
      <span class="status-turns">${effect.turnsLeft}</span>
    `;
    const targetEl = getEffectTarget(effect.type) === 'enemy' ? enemyEl : playerEl;
    targetEl.appendChild(badge);
  });
}

function tickPlayerRoundStatusEffects() {
  const c = state.combat;
  if (!c) return { skipPlayer: false, playerDead: false };

  let skipPlayer = false;
  const remaining = [];

  c.activeEffects.forEach(effect => {
    if (getEffectTarget(effect.type) !== 'player') {
      remaining.push(effect);
      return;
    }

    if (effect.dmgPerTurn > 0) {
      state.player.hp = Math.max(0, state.player.hp - effect.dmgPerTurn);
      resetCombo();
      addCombatLog(`${effect.icon} ${effect.type.toUpperCase()} deals ${effect.dmgPerTurn} damage!`, 'enemy-hit');
      spawnDmgNumber(effect.dmgPerTurn, 'dmg-player', document.getElementById('fighter-player'));
    }

    if (effect.type === 'freeze') {
      skipPlayer = true;
      addCombatLog(`${effect.icon} You are frozen and skip your action!`, 'enemy-hit');
    }

    effect.turnsLeft--;
    if (effect.turnsLeft > 0) remaining.push(effect);
  });

  c.activeEffects = remaining;
  updateCombatUI();

  if (state.player.hp <= 0) {
    setTimeout(() => playerDeath(), 500);
    return { skipPlayer, playerDead: true };
  }

  return { skipPlayer, playerDead: false };
}

function consumeEnemyStun() {
  const c = state.combat;
  if (!c) return false;

  const stun = c.activeEffects.find(effect => effect.type === 'stun');
  if (!stun) return false;

  addCombatLog(`${stun.icon} ${c.enemy.name} is stunned and skips their turn!`, 'player-hit');
  stun.turnsLeft--;
  c.activeEffects = c.activeEffects.filter(effect => effect.type !== 'stun' || effect.turnsLeft > 0);
  updateCombatUI();
  return true;
}

function handleEnemyTurn(playerDef) {
  if (state.screen !== 'combat' || !state.combat || state.combat.enemy.currentHp <= 0) return;

  const c = state.combat;
  const p = state.player;
  const e = c.enemy;

  if (consumeEnemyStun()) {
    tickCombatTurn();
    return;
  }

  if (c.divineShieldActive) {
    c.divineShieldActive = false;
    addCombatLog(`ðŸ›¡ï¸ Divine Shield blocks all damage from ${e.name}!`, 'heal');
    spawnDmgNumber('BLOCKED', 'dmg-miss', document.getElementById('fighter-player'));
    SoundEngine.playHeal();
    tickCombatTurn();
    return;
  }

  if (c.boneShieldActive) {
    c.boneShieldActive = false;
    addCombatLog(`ðŸ’€ Bone Shield absorbs the hit from ${e.name} completely!`, 'heal');
    spawnDmgNumber('ABSORBED', 'dmg-miss', document.getElementById('fighter-player'));
    SoundEngine.playHeal();
    tickCombatTurn();
    return;
  }

  const eDmg = Math.max(1, e.atk - playerDef + Math.floor(Math.random() * 4));
  p.hp = Math.max(0, p.hp - eDmg);
  resetCombo();
  addCombatLog(`${e.icon} ${e.name} deals ${eDmg} damage!`, 'enemy-hit');
  shakeFighter('player');
  spawnDmgNumber(eDmg, 'dmg-player', document.getElementById('fighter-player'));
  SoundEngine.playHit();
  maybeApplyEnemyHitStatus(e);

  if (p.hp <= 0) {
    setTimeout(() => playerDeath(), 500);
    return;
  }

  tickCombatTurn();
  updateHUD();
}

function combatAction(action) {
  if (state.screen !== 'combat') return;
  const c = state.combat;
  if (c.isLocked) return;

  const p = state.player;
  const e = c.enemy;

  const playerAtk = p.atk + getEquipBonus('atk') + c.tempBuffs.atk;
  const playerDef = p.def + getEquipBonus('def') + (c.playerDefending ? 8 : 0) + c.tempBuffs.def;
  const playerSpd = p.spd;
  const playerLuck = p.luck;

  c.isLocked = true;
  updateCombatUI();

  c.playerDefending = false;

  if (action === 'attack') {
    // Player attacks
    const crit = Math.random() * 100 < playerLuck;
    let dmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! You deal ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`⚔️ You attack for ${dmg} damage.`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');
    incrementCombo();

    // Necromancer lifesteal
    if (p.class.id === 'necro') {
      const steal = Math.floor(dmg * 0.15);
      p.hp = Math.min(p.maxHp, p.hp + steal);
      if (steal > 0) {
        addCombatLog(`🧛 Lifesteal: +${steal} HP`, 'heal');
        spawnDmgNumber(steal, 'dmg-lifesteal', document.getElementById('fighter-player'));
        SoundEngine.playHeal();
      }
    }

    // Check enemy death
    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  } else if (action === 'finisher') {
    if ((c.combo || 0) < 3 || (c.finisherCooldown || 0) > 0) {
      c.isLocked = false;
      updateCombatUI();
      return;
    }

    const baseDmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    const dmg = Math.floor(baseDmg * 3);
    e.currentHp = Math.max(0, e.currentHp - dmg);

    addCombatLog(`FINISHER! You unleash ${dmg} damage!`, 'crit');
    spawnDmgNumber(dmg, 'dmg-crit', document.getElementById('fighter-enemy'));
    SoundEngine.playCrit();
    shakeFighter('enemy');

    c.combo = 0;
    c.finisherCooldown = 2;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  } else if (action === 'defend') {
    resetCombo();
    c.playerDefending = true;
    addCombatLog(`🛡️ You raise your defense!`, 'player-hit');
    SoundEngine.playStep(); // low block thud
  } else if (action === 'heal') {
    const potionIdx = state.inventory.findIndex(i => i.icon === '🧪' && i.type === 'consumable');
    if (potionIdx >= 0) {
      resetCombo();
      const potion = state.inventory[potionIdx];
      const healAmt = potion.effect.hp || 40;
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
      potion.qty--;
      if (potion.qty <= 0) state.inventory.splice(potionIdx, 1);
      addCombatLog(`🧪 You drink a potion! +${healAmt} HP`, 'heal');
      spawnDmgNumber(healAmt, 'dmg-heal', document.getElementById('fighter-player'));
      SoundEngine.playHeal();
      updateCombatHealBtn();
      state.potionUsed = true;
    } else {
      addCombatLog(`❌ No potions left!`);
      c.isLocked = false;
      updateCombatUI();
      return;
    }
  } else if (action === 'flee') {
    resetCombo();
    const fleeChance = c.smokeBombActive ? 100 : (40 + playerSpd * 2);
    if (Math.random() * 100 < fleeChance) {
      addCombatLog(`🏃 You escaped!`);
      SoundEngine.playFlee();
      state.flees = (state.flees || 0) + 1;
      checkAchievements();
      endCombat();
      addLog('combat', `🏃 Fled from ${e.name}.`);
      return;
    } else {
      addCombatLog(`❌ Failed to escape!`);
      SoundEngine.playStep(); // low failed thud
    }
  }

  updateCombatUI();
  updateHUD();
  setTimeout(() => handleEnemyTurn(getPlayerCombatDefense(true)), 600);
  return;

}

function tickCombatTurn() {
  if (!state.combat) return;

  // Decrement active ability cooldowns
  if (state.combat.cooldowns) {
    for (const key in state.combat.cooldowns) {
      if (state.combat.cooldowns[key] > 0) {
        state.combat.cooldowns[key]--;
      }
    }
  }
  if (state.combat.finisherCooldown > 0) {
    state.combat.finisherCooldown--;
  }

  const statusTick = tickPlayerRoundStatusEffects();
  if (statusTick.playerDead) return;
  if (statusTick.skipPlayer) {
    state.combat.isLocked = true;
    setTimeout(() => handleEnemyTurn(getPlayerCombatDefense(false)), 600);
    return;
  }

  // Unlock combat controls
  state.combat.isLocked = false;
  updateCombatUI();
}

function updateAbilityButtons() {
  const p = state.player;
  const c = state.combat;
  const container = document.getElementById('combat-ability-actions');
  if (!container) return;

  // Clear previous buttons
  container.innerHTML = '';

  // Get current class abilities
  const abilities = CLASS_ABILITIES[p.class.id];
  if (!abilities || abilities.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  abilities.forEach(ability => {
    const btn = document.createElement('button');
    btn.className = 'combat-btn ability-btn';
    btn.innerHTML = `${ability.icon} ${ability.name}`;
    btn.title = `${ability.desc} (CD: ${ability.cooldown} turns)`;

    const cd = c.cooldowns[ability.id] || 0;
    const isLocked = c.isLocked;

    if (cd > 0) {
      btn.disabled = true;
      const overlay = document.createElement('div');
      overlay.className = 'cooldown-overlay';
      overlay.textContent = `⏳ ${cd}`;
      btn.appendChild(overlay);
    } else if (isLocked) {
      btn.disabled = true;
    } else {
      btn.onclick = () => useAbility(ability.id);
    }

    container.appendChild(btn);
  });
}

function useAbility(abilityId) {
  if (state.screen !== 'combat') return;
  const c = state.combat;
  if (c.isLocked) return;

  // Check cooldown
  if (c.cooldowns[abilityId] > 0) {
    addCombatLog(`❌ Ability is on cooldown!`);
    return;
  }

  const p = state.player;
  const e = c.enemy;

  const playerAtk = p.atk + getEquipBonus('atk') + c.tempBuffs.atk;
  const playerDef = p.def + getEquipBonus('def') + c.tempBuffs.def;
  const playerLuck = p.luck;

  c.isLocked = true;
  updateCombatUI();

  if (abilityId === 'berserker_rage') {
    // 2x ATK for 1 turn (deal 2x damage immediately)
    const crit = Math.random() * 100 < playerLuck;
    let baseDmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    let dmg = Math.floor(baseDmg * 2.0);
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! 🔥 Berserker Rage strikes for ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`🔥 Berserker Rage strikes for ${dmg} damage!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    c.cooldowns['berserker_rage'] = 4;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'shield_bash') {
    // Stun enemy 1 turn, deal damage
    const crit = Math.random() * 100 < playerLuck;
    let dmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! 💥 Shield Bash deals ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`💥 Shield Bash deals ${dmg} damage!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    applyStatusEffect('stun');
    addCombatLog(`💫 ${e.name} is STUNNED and will skip their next turn!`, 'player-hit');

    c.cooldowns['shield_bash'] = 3;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'fireball') {
    // 3x damage spell
    const crit = Math.random() * 100 < playerLuck;
    let baseDmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    let dmg = Math.floor(baseDmg * 3.0);
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! ☄️ Fireball incinerates the enemy for ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`☄️ Fireball blasts the enemy for ${dmg} damage!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    c.cooldowns['fireball'] = 5;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'frost_nova') {
    // Stun enemy (skips their next turn) + normal damage
    const crit = Math.random() * 100 < playerLuck;
    let dmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! ❄️ Frost Nova freezes the enemy for ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`❄️ Frost Nova freezes the enemy for ${dmg} damage!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    applyStatusEffect('stun');

    addCombatLog(`\u2B50 ${e.name} is STUNNED and will skip their next turn!`, 'player-hit');
    c.cooldowns['frost_nova'] = 4;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'eagle_eye') {
    // Guaranteed hit + ignore DEF
    const crit = Math.random() * 100 < playerLuck;
    let dmg = Math.max(1, playerAtk + Math.floor(Math.random() * 5)); // ignores enemy def
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! 🎯 Eagle Eye strikes ${e.name} for ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`🎯 Eagle Eye strikes ${e.name} for ${dmg} damage, ignoring defense!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    c.cooldowns['eagle_eye'] = 3;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'rain_of_arrows') {
    // Hits 2-3 times
    const hits = Math.floor(Math.random() * 2) + 2; // 2 or 3
    let totalDmg = 0;
    const enemyCard = document.getElementById('fighter-enemy');

    addCombatLog(`🏹 Rain of Arrows! Unleashing a volley of ${hits} shots!`, 'player-hit');

    for (let i = 0; i < hits; i++) {
      const crit = Math.random() * 100 < playerLuck;
      let dmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
      if (crit) { dmg = Math.floor(dmg * 1.8); }
      totalDmg += dmg;

      e.currentHp = Math.max(0, e.currentHp - dmg);

      setTimeout(() => {
        if (crit) {
          spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
          SoundEngine.playCrit();
        } else {
          spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
          SoundEngine.playHit();
        }
        shakeFighter('enemy');
      }, i * 180);
    }

    addCombatLog(`🏹 Volley strikes ${hits} times for ${totalDmg} total damage!`, 'player-hit');

    c.cooldowns['rain_of_arrows'] = 4;

    if (e.currentHp <= 0) {
      setTimeout(() => combatVictory(), hits * 180);
      return;
    }
  }
  else if (abilityId === 'divine_shield') {
    // Block all damage next enemy turn
    c.divineShieldActive = true;
    addCombatLog(`🛡️ Divine Shield activated! You will block the next attack completely!`, 'heal');
    SoundEngine.playHeal();

    c.cooldowns['divine_shield'] = 4;
  }
  else if (abilityId === 'holy_strike') {
    // 2x damage + heal 20% of damage dealt
    const crit = Math.random() * 100 < playerLuck;
    let baseDmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    let dmg = Math.floor(baseDmg * 2.0);
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! ✨ Holy Strike deals ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`✨ Holy Strike deals ${dmg} damage!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    const heal = Math.floor(dmg * 0.2);
    if (heal > 0) {
      p.hp = Math.min(p.maxHp, p.hp + heal);
      addCombatLog(`💚 Holy Strike heals you for +${heal} HP!`, 'heal');
      spawnDmgNumber(heal, 'dmg-heal', document.getElementById('fighter-player'));
      SoundEngine.playHeal();
    }

    c.cooldowns['holy_strike'] = 4;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'backstab') {
    // Guaranteed crit
    let baseDmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    let dmg = Math.floor(baseDmg * 1.8); // guaranteed crit (1.8x)
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    addCombatLog(`💥 CRITICAL! 🗡️ Backstab strikes for ${dmg} damage!`, 'crit');
    spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
    SoundEngine.playCrit();
    shakeFighter('enemy');

    c.cooldowns['backstab'] = 3;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'smoke_bomb') {
    // Next flee attempt always succeeds
    c.smokeBombActive = true;
    addCombatLog(`💨 Smoke Bomb deployed! Your next flee attempt is guaranteed!`, 'player-hit');
    SoundEngine.playHeal(); // smoke puff magic chime

    c.cooldowns['smoke_bomb'] = 3;
  }
  else if (abilityId === 'soul_drain') {
    // Lifesteal 50% of damage
    const crit = Math.random() * 100 < playerLuck;
    let dmg = Math.max(1, playerAtk - e.def + Math.floor(Math.random() * 5));
    if (crit) { dmg = Math.floor(dmg * 1.8); }
    e.currentHp = Math.max(0, e.currentHp - dmg);

    const enemyCard = document.getElementById('fighter-enemy');
    if (crit) {
      addCombatLog(`💥 CRITICAL! 🧛 Soul Drain drains ${dmg} damage!`, 'crit');
      spawnDmgNumber(dmg, 'dmg-crit', enemyCard);
      SoundEngine.playCrit();
    } else {
      addCombatLog(`🧛 Soul Drain drains ${dmg} damage!`, 'player-hit');
      spawnDmgNumber(dmg, 'dmg-enemy', enemyCard);
      SoundEngine.playHit();
    }
    shakeFighter('enemy');

    const steal = Math.floor(dmg * 0.5);
    if (steal > 0) {
      p.hp = Math.min(p.maxHp, p.hp + steal);
      addCombatLog(`🧛 Soul Drain lifesteals +${steal} HP!`, 'heal');
      spawnDmgNumber(steal, 'dmg-lifesteal', document.getElementById('fighter-player'));
      SoundEngine.playHeal();
    }

    c.cooldowns['soul_drain'] = 3;

    if (e.currentHp <= 0) {
      combatVictory();
      return;
    }
  }
  else if (abilityId === 'bone_shield') {
    // Absorb next hit completely
    c.boneShieldActive = true;
    addCombatLog(`💀 Bone Shield activated! You will absorb the next attack completely!`, 'heal');
    SoundEngine.playHeal();

    c.cooldowns['bone_shield'] = 4;
  }

  updateCombatUI();
  updateHUD();
  setTimeout(() => handleEnemyTurn(getPlayerCombatDefense(true)), 600);
  return;

}

function combatVictory() {
  SoundEngine.playVictory();
  const e = state.combat.enemy;
  const xpGain = e.xp;
  const goldGain = e.gold;

  state.player.xp += xpGain;
  state.player.gold += goldGain;
  state.kills++;

  addCombatLog(`🏆 ${e.name} defeated! +${xpGain} XP, +${goldGain} 💰`, 'crit');
  addLog('combat', `🏆 Defeated ${e.icon} ${e.name}! +${xpGain} XP, +${goldGain} 💰`);

  updateQuestProgress('kill_10', 1);

  if (e.name.includes('Wolf')) {
    updateQuestProgress('maren_wolves', 1);
  }
  if (e.name.includes('Bandit')) {
    updateQuestProgress('voss_bandits', 1);
  }
  if (e.name.includes('Yeti')) {
    updateQuestProgress('borg_yeti', 1);
  }

  if (e.boss) {
    state.bossDefeated = true;
    if (e.name.includes('Dragon')) updateQuestProgress('slay_dragon', 1);
  }

  checkAchievements();

  // Loot drop
  const lootChance = 0.4 + state.player.luck * 0.01;
  if (Math.random() < lootChance) {
    const lootTable = e.boss ? LOOT_TABLES.boss : LOOT_TABLES.common;
    const itemKey = lootTable[Math.floor(Math.random() * lootTable.length)];
    const item = ITEMS[itemKey];
    if (item) {
      addItemToInventory(itemKey);
      addCombatLog(`💰 Looted ${item.icon} ${item.name}!`, 'crit');
      addLog('loot', `💰 Looted ${item.icon} ${item.name}!`);
    }
  }

  // Level check
  checkLevelUp();

  setTimeout(() => {
    endCombat();
    updateHUD();

    // Check win condition
    if (state.bossDefeated && state.quests.filter(q => q.done).length >= 3) {
      showVictory();
    }
  }, 1500);
}

function endCombat() {
  state.screen = 'playing';
  state.combat = null;
  document.getElementById('combat-overlay').classList.remove('active');
}

function addCombatLog(text, cls = '') {
  const log = document.getElementById('combat-log');
  const entry = document.createElement('div');
  entry.className = `combat-log-entry ${cls}`;
  entry.textContent = text;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function shakeFighter(who) {
  const el = document.getElementById(`fighter-${who}`);
  el.classList.add('hit');
  setTimeout(() => el.classList.remove('hit'), 400);
}

// ═══ FLOATING DAMAGE NUMBERS ═══
// type: 'dmg-enemy' | 'dmg-player' | 'dmg-crit' | 'dmg-heal' | 'dmg-miss' | 'dmg-lifesteal'
// anchor: the fighter card element the number will float up from
function spawnDmgNumber(value, type, anchorEl) {
  const el = document.createElement('div');
  el.className = `dmg-number ${type}`;

  // Build label text
  if (type === 'dmg-miss') {
    el.textContent = 'MISS';
  } else if (type === 'dmg-heal' || type === 'dmg-lifesteal') {
    el.textContent = `+${value}`;
  } else if (type === 'dmg-crit') {
    el.textContent = `${value}!`;
  } else {
    el.textContent = `-${value}`;
  }

  // Position randomly within the top half of the card so multiple
  // numbers in quick succession don't perfectly overlap
  const cardW = anchorEl.offsetWidth  || 180;
  const cardH = anchorEl.offsetHeight || 160;

  // Crits emerge from the centre; others scatter a little
  const isCrit = type === 'dmg-crit';
  const jitterX = isCrit ? 0 : (Math.random() - 0.5) * cardW * 0.45;
  const jitterY = isCrit ? cardH * 0.25 : cardH * 0.15 + Math.random() * cardH * 0.25;

  el.style.left = `calc(50% + ${jitterX}px)`;
  el.style.top  = `${jitterY}px`;
  el.style.transform = 'translate(-50%, -50%)';

  anchorEl.appendChild(el);

  // Remove from DOM after animation completes (longest keyframe is 1.35 s)
  const duration = type === 'dmg-crit' ? 1400 : type === 'dmg-miss' ? 950 : 1250;
  setTimeout(() => el.remove(), duration);
}

function updateCombatUI() {
  const p = state.player;
  const e = state.combat.enemy;

  const pHpPct = (p.hp / p.maxHp * 100).toFixed(0);
  document.getElementById('fighter-player-hp').style.width = pHpPct + '%';
  document.getElementById('fighter-player-hp-text').textContent = `${p.hp}/${p.maxHp}`;

  const eHpPct = (e.currentHp / e.hp * 100).toFixed(0);
  document.getElementById('fighter-enemy-hp').style.width = eHpPct + '%';
  document.getElementById('fighter-enemy-hp-text').textContent = `${e.currentHp}/${e.hp}`;

  if (pHpPct <= 25) {
    document.getElementById('fighter-player-hp').classList.add('low');
  } else {
    document.getElementById('fighter-player-hp').classList.remove('low');
  }

  renderStatusEffects();
  updateComboUI();

  // Handle lock state of standard combat buttons
  const isLocked = state.combat ? state.combat.isLocked : false;
  const standardButtons = ['attack', 'defend', 'heal-btn', 'flee'];
  standardButtons.forEach(cls => {
    const btn = document.querySelector(`.combat-actions button.${cls}`);
    if (btn) {
      if (cls === 'heal-btn') {
        const hasPotion = state.inventory.some(i => i.icon === '🧪' && i.type === 'consumable');
        btn.disabled = isLocked || !hasPotion;
      } else {
        btn.disabled = isLocked;
      }
    }
  });

  // Render / Update Ability Buttons
  updateAbilityButtons();
}

function updateCombatHealBtn() {
  const hasPotion = state.inventory.some(i => i.icon === '🧪' && i.type === 'consumable');
  document.getElementById('combat-heal-btn').disabled = !hasPotion;
}

// ═══ LEVEL UP ═══
function checkLevelUp() {
  const p = state.player;
  while (p.xp >= p.xpNeeded) {
    p.xp -= p.xpNeeded;
    p.level++;
    p.xpNeeded = Math.floor(p.xpNeeded * 1.5);

    // Stat gains
    p.maxHp += 12 + Math.floor(Math.random() * 8);
    p.hp = p.maxHp; // Full heal on level up
    p.atk += 2 + Math.floor(Math.random() * 2);
    p.def += 1 + Math.floor(Math.random() * 2);
    p.spd += 1;
    p.luck += 1;

    addLog('level', `⬆️ LEVEL UP! You are now Level ${p.level}!`);
    showToast(`⬆️ Level ${p.level}! HP restored!`, 'level-up');
    SoundEngine.playLevelUp();
    if (typeof MP !== 'undefined' && MP.isMultiplayer) {
      MP.broadcast('hp_update', { hp: p.hp, maxHp: p.maxHp, level: p.level });
    }
  }
}

// ═══ INVENTORY ═══
function addItemToInventory(itemKey) {
  const item = ITEMS[itemKey];
  if (!item) return;

  // Check if stackable (consumable)
  const existing = state.inventory.find(i => i.name === item.name && i.type === 'consumable');
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    state.inventory.push({ ...item, key: itemKey, qty: 1 });
  }
}

let selectedItemIdx = -1;

function renderInventory() {
  const grid = document.getElementById('inv-grid');
  grid.innerHTML = '';

  for (let i = 0; i < 16; i++) {
    const slot = document.createElement('div');
    slot.className = 'inv-slot';

    if (i < state.inventory.length) {
      const item = state.inventory[i];
      slot.innerHTML = `${item.icon}${item.qty > 1 ? `<span class="inv-count">x${item.qty}</span>` : ''}`;
      if (i === selectedItemIdx) slot.classList.add('selected');
      slot.addEventListener('click', () => selectItem(i));
    } else {
      slot.classList.add('empty');
    }

    grid.appendChild(slot);
  }

  // Equipped items
  document.getElementById('equip-weapon').textContent =
    state.equipped.weapon ? `${ITEMS[state.equipped.weapon].icon} ${ITEMS[state.equipped.weapon].name}` : 'Fists';
  document.getElementById('equip-armor').textContent =
    state.equipped.armor ? `${ITEMS[state.equipped.armor].icon} ${ITEMS[state.equipped.armor].name}` : 'Cloth';
  document.getElementById('equip-amulet').textContent =
    state.equipped.amulet ? `${ITEMS[state.equipped.amulet].icon} ${ITEMS[state.equipped.amulet].name}` : 'None';
}

function selectItem(idx) {
  selectedItemIdx = idx;
  renderInventory();

  const detail = document.getElementById('item-detail');
  if (idx >= 0 && idx < state.inventory.length) {
    const item = state.inventory[idx];
    document.getElementById('item-name').textContent = `${item.icon} ${item.name}`;
    document.getElementById('item-desc').textContent = item.desc;

    const btn = document.getElementById('item-use-btn');
    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'amulet') {
      btn.textContent = 'Equip';
      btn.style.display = 'inline-block';
    } else if (item.type === 'consumable') {
      btn.textContent = 'Use';
      btn.style.display = 'inline-block';
    } else {
      btn.style.display = 'none';
    }
    detail.style.display = 'block';
  } else {
    detail.style.display = 'none';
  }
}

function useSelectedItem() {
  if (selectedItemIdx < 0 || selectedItemIdx >= state.inventory.length) return;
  const item = state.inventory[selectedItemIdx];

  if (item.type === 'weapon') {
    state.equipped.weapon = item.key;
    state.inventory.splice(selectedItemIdx, 1);
    addLog('loot', `⚔️ Equipped ${item.icon} ${item.name}`);
    showToast(`Equipped ${item.icon} ${item.name}!`);
  } else if (item.type === 'armor') {
    state.equipped.armor = item.key;
    state.inventory.splice(selectedItemIdx, 1);
    addLog('loot', `🛡️ Equipped ${item.icon} ${item.name}`);
    showToast(`Equipped ${item.icon} ${item.name}!`);
  } else if (item.type === 'amulet') {
    state.equipped.amulet = item.key;
    state.inventory.splice(selectedItemIdx, 1);
    addLog('loot', `📿 Equipped ${item.icon} ${item.name}`);
    showToast(`Equipped ${item.icon} ${item.name}!`);
  } else if (item.type === 'consumable') {
    if (item.effect.hp) {
      const heal = item.effect.hp;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
      addLog('heal', `🧪 Used ${item.name}: +${heal} HP`);
      showToast(`🧪 +${heal} HP!`);
      state.potionUsed = true;
    }
    if (item.effect.luck) {
      state.player.luck += item.effect.luck;
      addLog('loot', `🍀 ${item.name}: +${item.effect.luck} Luck!`);
      showToast(`🍀 +${item.effect.luck} Luck!`);
    }
    if (item.effect.reveal) {
      const newReveals = revealAround(state.playerPos.col, state.playerPos.row, item.effect.reveal);
      if (newReveals > 0) {
        state.explored += newReveals;
        updateQuestProgress('explore_5', newReveals);
      }
      addLog('explore', `🗺️ Map revealed around you!`);
      showToast(`🗺️ Area revealed!`);
    }
    item.qty--;
    if (item.qty <= 0) state.inventory.splice(selectedItemIdx, 1);
  } else if (item.type === 'permanent') {
    if (item.effect.luck) {
      state.player.luck += item.effect.luck;
      addLog('loot', `🍀 ${item.name}: +${item.effect.luck} Luck permanently!`);
    }
    state.inventory.splice(selectedItemIdx, 1);
  }

  selectedItemIdx = -1;
  renderInventory();
  updateHUD();
}

function getEquipBonus(stat) {
  let bonus = 0;
  for (const slot of ['weapon', 'armor', 'amulet']) {
    if (state.equipped[slot]) {
      const item = ITEMS[state.equipped[slot]];
      if (item && item.effect[stat]) bonus += item.effect[stat];
      if (stat === 'maxHp' && item && item.effect.maxHp) bonus += item.effect.maxHp;
    }
  }
  return bonus;
}

// ═══ LOCATION ACTIONS ═══
function updateLocationPanel() {
  const tile = state.map[state.playerPos.row][state.playerPos.col];
  const biome = BIOMES[tile.biome];
  const loc = tile.location;

  if (loc) {
    const locType = LOCATION_TYPES[loc.type];
    document.getElementById('loc-icon').textContent = locType.icon;
    document.getElementById('loc-name').textContent = loc.name;
    document.getElementById('loc-type').textContent = locType.name;
    document.getElementById('loc-desc').textContent = loc.desc;
  } else {
    document.getElementById('loc-icon').textContent = biome.icon;
    document.getElementById('loc-name').textContent = biome.name;
    document.getElementById('loc-type').textContent = 'Wilderness';
    document.getElementById('loc-desc').textContent = `You stand in the ${biome.name}. The wilderness stretches around you.`;
  }

  const actionsEl = document.getElementById('loc-actions');
  actionsEl.innerHTML = '';

  if (loc) {
    for (const action of loc.actions) {
      const btn = document.createElement('button');
      btn.className = 'loc-action-btn';

      switch (action) {
        case 'rest':
          btn.innerHTML = '<span class="action-icon">🛏️</span> Rest & Recover';
          btn.onclick = () => restAtLocation();
          break;
        case 'shop':
          btn.innerHTML = '<span class="action-icon">🏪</span> Visit Shop';
          btn.onclick = () => visitShop();
          break;
        case 'talk':
          btn.innerHTML = '<span class="action-icon">💬</span> Talk to Locals';
          btn.onclick = () => talkToLocals();
          break;
        case 'arena':
          btn.innerHTML = '<span class="action-icon">⚔️</span> Enter Arena';
          btn.className += ' combat';
          btn.onclick = () => enterArena();
          break;
        case 'explore_dungeon':
          btn.innerHTML = '<span class="action-icon">🔦</span> Explore Dungeon';
          btn.className += ' combat';
          btn.onclick = () => exploreDungeon();
          break;
        case 'pray':
          btn.innerHTML = '<span class="action-icon">🙏</span> Pray at Shrine';
          btn.onclick = () => prayAtShrine();
          break;
        case 'study':
          btn.innerHTML = '<span class="action-icon">📚</span> Study Magic';
          btn.onclick = () => studyMagic();
          break;
        case 'boss_fight':
          btn.innerHTML = '<span class="action-icon">🐉</span> Challenge the Dragon';
          btn.className += ' combat';
          btn.onclick = () => bossFight();
          if (state.player.level < 5) {
            btn.disabled = true;
            btn.innerHTML += ' (Lv.5+)';
          }
          break;
        case 'enter_portal':
          btn.innerHTML = '<span class="action-icon">🌀</span> Enter Portal';
          btn.onclick = () => enterPortal();
          break;
        case 'open_treasure':
          btn.innerHTML = '<span class="action-icon">💎</span> Open Treasure';
          btn.onclick = () => openTreasure();
          break;
      }

      actionsEl.appendChild(btn);
    }
  } else {
    // Wilderness actions
    const searchBtn = document.createElement('button');
    searchBtn.className = 'loc-action-btn';
    searchBtn.innerHTML = '<span class="action-icon">🔍</span> Search Area';
    searchBtn.onclick = () => searchWilderness();
    actionsEl.appendChild(searchBtn);
  }

  // Multiplayer: show PvP challenge button if opponent is adjacent
  if (typeof MP !== 'undefined' && MP.isMultiplayer && MP.connected && !MP.pvp.active) {
    if (MP.isOpponentAdjacent()) {
      const pvpBtn = document.createElement('button');
      pvpBtn.className = 'loc-action-btn pvp-challenge-btn';
      const oppName = MP.opponentData ? MP.opponentData.name : 'Opponent';
      pvpBtn.innerHTML = `<span class="action-icon">⚔️</span> Challenge ${oppName}`;
      pvpBtn.onclick = () => MP.sendChallenge();
      actionsEl.appendChild(pvpBtn);
    }
  }
}

function restAtLocation() {
  const heal = Math.floor(state.player.maxHp * 0.5);
  state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
  addLog('heal', `🛏️ Rested and recovered ${heal} HP.`);
  showToast(`🛏️ +${heal} HP!`);
  state.movesLeft = 0; // Rest consumes remaining moves
  updateHUD();
  updateTurnIndicator();
}

function visitShop() {
  // Random shop items
  const shopItems = ['health_potion', 'mana_crystal', 'shield_scroll', 'iron_sword', 'leather_armor', 'map_fragment']
    .sort(() => Math.random() - 0.5).slice(0, 4);

  const actionsEl = document.getElementById('loc-actions');
  actionsEl.innerHTML = '<div style="font-size:0.85rem; color: var(--text-secondary); margin-bottom:8px;">🏪 <strong>Shop</strong> — Your Gold: <span style="color:var(--text-gold)">' + state.player.gold + '</span></div>';

  shopItems.forEach(key => {
    const item = ITEMS[key];
    const btn = document.createElement('button');
    btn.className = 'loc-action-btn';
    btn.innerHTML = `<span class="action-icon">${item.icon}</span> ${item.name} — <span style="color:var(--text-gold)">${item.value}g</span>`;
    btn.onclick = () => buyItem(key);
    if (state.player.gold < item.value) btn.disabled = true;
    actionsEl.appendChild(btn);
  });

  const backBtn = document.createElement('button');
  backBtn.className = 'loc-action-btn';
  backBtn.innerHTML = '<span class="action-icon">↩️</span> Back';
  backBtn.onclick = () => updateLocationPanel();
  actionsEl.appendChild(backBtn);
}

function buyItem(key) {
  const item = ITEMS[key];
  if (state.player.gold >= item.value) {
    state.player.gold -= item.value;
    addItemToInventory(key);
    addLog('loot', `🏪 Bought ${item.icon} ${item.name} for ${item.value}g`);
    showToast(`Bought ${item.icon} ${item.name}!`);
    updateHUD();
    visitShop(); // Refresh shop
  }
}

// ═══ NPC DIALOGUE SYSTEM DATA ═══
const NPC_DATA = {
  "Eldergrove": {
    "Elder Maren": {
      icon: "👵",
      getGreeting: () => {
        const q = state.quests.find(x => x.id === 'maren_wolves');
        if (q) {
          if (q.done) return "done";
          if (q.progress >= q.target) return "ready_turnin";
          return "active";
        }
        return "start";
      },
      nodes: {
        "start": {
          text: "Greetings, traveler. The dark shadows creep closer, and the woods have grown dangerous. Eldergrove has always been a peaceful haven, but a pack of Shadow Wolves is now terrorizing our borders. Will you aid us?",
          options: [
            { text: "⚔️ I will cull these beasts.", nextNode: "accept" },
            { text: "💬 What is this village's history?", nextNode: "history" },
            { text: "🏃 I cannot help right now.", nextNode: "close" }
          ]
        },
        "history": {
          text: "Eldergrove was founded centuries ago under the protective canopy of the Great Oak. Our people study the ancient magic of nature. But as the dark forces grow, the balance is shifting...",
          options: [
            { text: "⚔️ I'll help you with the wolves then.", nextNode: "accept" },
            { text: "🏃 Interesting. Farewell.", nextNode: "close" }
          ]
        },
        "accept": {
          text: "May the spirits guide your blade! Slay 3 Shadow Wolves in the forest or darkwood and return to me.",
          options: [
            { text: "👍 I will return victorious.", nextNode: "close", action: () => acceptNPCQuest('maren_wolves') }
          ]
        },
        "active": {
          text: "The wolves still howl in the darkwoods. Have you slain 3 of them yet? Eldergrove is counting on you.",
          options: [
            { text: "🏃 I'm still hunting them.", nextNode: "close" }
          ]
        },
        "ready_turnin": {
          text: "Ah, the forests sound peaceful again! You have slain the wolves. Accept this lucky charm as our eternal thanks.",
          options: [
            { text: "🎁 Thank you, Elder.", nextNode: "done_node", action: () => completeNPCQuest('maren_wolves') }
          ]
        },
        "done": {
          text: "Thank you for saving us from the wolves, brave champion. Eldergrove will always remember your noble deed!",
          options: [
            { text: "💖 Happy to help. Farewell.", nextNode: "close" }
          ]
        },
        "done_node": {
          text: "The spirits of the woods whisper blessings upon you. May your luck carry you through the shadows.",
          options: [
            { text: "🏃 Farewell.", nextNode: "close" }
          ]
        }
      }
    },
    "Herbalist Tobin": {
      icon: "🌿",
      getGreeting: () => "start",
      nodes: {
        "start": {
          text: "Ah, welcome! I am Tobin, the herbalist. I distill potent cures from forest roots and glowing moss. Would you like to buy a fresh Herbal Elixir? It restores 60 HP!",
          options: [
            { text: "🧪 Buy Herbal Elixir (30g)", nextNode: "buy", isShop: true },
            { text: "💬 Do you know of any local secrets?", nextNode: "secrets" },
            { text: "🏃 Just browsing, thanks.", nextNode: "close" }
          ]
        },
        "buy": {
          text: "", // Evaluated dynamically based on purchase result
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Close", nextNode: "close" }
          ],
          onEnter: (node) => {
            if (state.player.gold >= 30) {
              state.player.gold -= 30;
              addItemToInventory('herbal_elixir');
              updateHUD();
              node.text = "Here you go! Distilled fresh this morning. Drink it to instantly recover 60 HP.";
              addLog('loot', "🏪 Bought Herbal Elixir for 30g from Herbalist Tobin.");
            } else {
              node.text = "Ah, you don't have enough gold, friend. It costs 30g to gather and brew these rare ingredients.";
            }
          }
        },
        "secrets": {
          text: "They say a mystical Moonwell lies hidden deep in the forest. If you seek it out and pray there, the holy waters will heal your wounds and grant a divine blessing.",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Farewell.", nextNode: "close" }
          ]
        }
      }
    }
  },
  "Ironhaven": {
    "Captain Voss": {
      icon: "👮",
      getGreeting: () => {
        const q = state.quests.find(x => x.id === 'voss_bandits');
        if (q) {
          if (q.done) return "done";
          if (q.progress >= q.target) return "ready_turnin";
          return "active";
        }
        return "start";
      },
      nodes: {
        "start": {
          text: "Halt! I am Captain Voss of the Ironhaven Vanguard. The roads around our city are infested with lawless bandits, harassing our trade routes. A mercenary of your caliber could restore order. Help us by slaying 3 Bandits?",
          options: [
            { text: "⚔️ I will deal with these bandits.", nextNode: "accept" },
            { text: "💬 Tell me about Ironhaven.", nextNode: "info" },
            { text: "🏃 I'm not looking for work.", nextNode: "close" }
          ]
        },
        "info": {
          text: "Ironhaven is the strongest bastion in the realm. Our grand walls have resisted sieges, and our arena trains the finest warriors. But we cannot allow simple highwaymen to choke our gates.",
          options: [
            { text: "⚔️ I'll hunt down the bandits.", nextNode: "accept" },
            { text: "🏃 Fair enough. Farewell.", nextNode: "close" }
          ]
        },
        "accept": {
          text: "Good! Seek out 3 Bandits in the plains or sandy beaches, wipe them out, and report back to me.",
          options: [
            { text: "👍 Consider it done.", nextNode: "close", action: () => acceptNPCQuest('voss_bandits') }
          ]
        },
        "active": {
          text: "The highwaymen still roam free. Slay 3 Bandits and report back!",
          options: [
            { text: "🏃 I am on it.", nextNode: "close" }
          ]
        },
        "ready_turnin": {
          text: "Magnificent! You've restored order to the trade routes. Ironhaven pays its dues — take this fine Steel Blade!",
          options: [
            { text: "⚔️ Thank you, Captain.", nextNode: "done_node", action: () => completeNPCQuest('voss_bandits') }
          ]
        },
        "done": {
          text: "The roads are safe thanks to you, champion. Stop by the arena if you ever want to test your mettle!",
          options: [
            { text: "🛡️ Will do. Farewell.", nextNode: "close" }
          ]
        },
        "done_node": {
          text: "A warrior of your skill is always welcome in Ironhaven. Keep your guard up in the dark regions.",
          options: [
            { text: "🏃 Farewell.", nextNode: "close" }
          ]
        }
      }
    },
    "Merchant Lyra": {
      icon: "💎",
      getGreeting: () => "start",
      nodes: {
        "start": {
          text: "Welcome, gorgeous! I travel far and wide trading fine jewelry. In my private collection, I have a flawless Merchant's Ruby that permanently increases Luck by 15! Want to buy it for 80g?",
          options: [
            { text: "💎 Buy Merchant's Ruby (80g)", nextNode: "buy", isShop: true },
            { text: "💬 Tell me about your travels.", nextNode: "travels" },
            { text: "🏃 Maybe another time.", nextNode: "close" }
          ]
        },
        "buy": {
          text: "",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Close", nextNode: "close" }
          ],
          onEnter: (node) => {
            if (state.player.gold >= 80) {
              state.player.gold -= 80;
              addItemToInventory('merchant_ruby');
              updateHUD();
              node.text = "A magnificent choice! This gem glows with pure fortune. Keep it in your inventory to feel its power!";
              addLog('loot', "🏪 Bought Merchant's Ruby for 80g from Merchant Lyra.");
            } else {
              node.text = "A gem of this quality isn't cheap, darling. Come back when you have 80g.";
            }
          }
        },
        "travels": {
          text: "I've sold spices in Sunspire and furs in Frostholm. The freezing north is harsh, but their Chieftain's hearth is warm if you bring them coin or help them hunt.",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Safe travels.", nextNode: "close" }
          ]
        }
      }
    }
  },
  "Sunspire": {
    "Scholar Adeem": {
      icon: "📚",
      getGreeting: () => {
        const q = state.quests.find(x => x.id === 'adeem_relic');
        if (q) {
          if (q.done) return "done";
          if (state.inventory.some(i => i.key === 'ancient_key')) return "has_key";
          return "active";
        }
        return "start";
      },
      nodes: {
        "start": {
          text: "Knowledge is the true beacon of Sunspire. I am translating ancient pre-collapse scriptures, but my research has stalled. I require an Ancient Key from the ruins to unlock the vaults. Will you help me?",
          options: [
            { text: "📜 I will find a key for you.", nextNode: "accept" },
            { text: "💬 Why the ruins?", nextNode: "ruins_info" },
            { text: "🏃 I have no interest in history.", nextNode: "close" }
          ]
        },
        "ruins_info": {
          text: "The ancient ruins hold the remnants of a great magical empire that collapsed into shadow. Their artifacts are dangerous, but their wisdom could save our realm.",
          options: [
            { text: "📜 I will seek a key.", nextNode: "accept" },
            { text: "🏃 Good luck with that. Farewell.", nextNode: "close" }
          ]
        },
        "accept": {
          text: "Wonderful! Search the ancient ruins scattered across the realm. Skeletons and phantoms guard them, but you may find an Ancient Key buried within.",
          options: [
            { text: "👍 I will search the ruins.", nextNode: "close", action: () => acceptNPCQuest('adeem_relic') }
          ]
        },
        "active": {
          text: "My research awaits. Have you found an Ancient Key in the ruins yet?",
          options: [
            { text: "🏃 I'm still searching the ruins.", nextNode: "close" }
          ]
        },
        "has_key": {
          text: "By the stars! Is that an authentic vault key? Please, hand it to me so I can translate the scrolls!",
          options: [
            { text: "🗝️ Hand over the Ancient Key.", nextNode: "complete", action: () => turnInAdeemKey() }
          ]
        },
        "complete": {
          text: "Outstanding! This matches the seal! Take this ancient Amulet of Life as a token of my boundless gratitude.",
          options: [
            { text: "📿 Thank you, Adeem.", nextNode: "done", action: () => completeNPCQuest('adeem_relic') }
          ]
        },
        "done": {
          text: "Thanks to your key, I have translated the ancient tablets! The wisdom of the past is absolutely breathtaking.",
          options: [
            { text: "🏃 Splendid. Farewell.", nextNode: "close" }
          ]
        }
      }
    },
    "Guard Nira": {
      icon: "🛡️",
      getGreeting: () => "start",
      nodes: {
        "start": {
          text: "Hold there, traveler. The desert sands are harsh, and the Sunspire guard stands vigilant. I have a spare bottle of Sunspire Elixir. It permanently increases Speed by 3 and Attack by 3! Want it for 50g?",
          options: [
            { text: "☀️ Buy Sunspire Elixir (50g)", nextNode: "buy", isShop: true },
            { text: "💬 Any tips for surviving the sands?", nextNode: "tips" },
            { text: "🏃 Move along.", nextNode: "close" }
          ]
        },
        "buy": {
          text: "",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Close", nextNode: "close" }
          ],
          onEnter: (node) => {
            if (state.player.gold >= 50) {
              state.player.gold -= 50;
              addItemToInventory('sunspire_elixir');
              updateHUD();
              node.text = "An excellent choice. This elixir is brewed under Sunspire's noon light. Drink it from your inventory for a permanent boost!";
              addLog('loot', "🏪 Bought Sunspire Elixir for 50g from Guard Nira.");
            } else {
              node.text = "You lack the coin. The Sunspire Guard does not give handouts. Come back with 50g.";
            }
          }
        },
        "tips": {
          text: "Watch the sky. Desert storms and volcanic ash storms reduce your vision and hide ambushing scorpions and mummies. Make camp or seek villages when they roll in.",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Understood. Farewell.", nextNode: "close" }
          ]
        }
      }
    }
  },
  "Frostholm": {
    "Chieftain Borg": {
      icon: "🧔",
      getGreeting: () => {
        const q = state.quests.find(x => x.id === 'borg_yeti');
        if (q) {
          if (q.done) return "done";
          if (q.progress >= q.target) return "ready_turnin";
          return "active";
        }
        return "start";
      },
      nodes: {
        "start": {
          text: "A stranger visits Frostholm! Ha! Only the strong survive these freezing winds. A massive Frost Yeti has been terrorizing our tundra hunters. Slay the beast, and I shall name you Friend of the North!",
          options: [
            { text: "⚔️ I will slay the Frost Yeti.", nextNode: "accept" },
            { text: "💬 Tell me about Frostholm.", nextNode: "about" },
            { text: "🏃 It's too cold for me.", nextNode: "close" }
          ]
        },
        "about": {
          text: "Frostholm is built on ice and blood. We do not farm; we hunt the beasts of the tundra and mountains. We respect only strength. Slay our nemesis, and you will earn our respect.",
          options: [
            { text: "⚔️ I will hunt the Yeti.", nextNode: "accept" },
            { text: "🏃 Stay warm. Farewell.", nextNode: "close" }
          ]
        },
        "accept": {
          text: "Very well! Track the Frost Yeti in the frozen tundra. Slay it, then return to my hearth for a mighty reward!",
          options: [
            { text: "👍 I go to hunt.", nextNode: "close", action: () => acceptNPCQuest('borg_yeti') }
          ]
        },
        "active": {
          text: "The tundra winds still scream with the Yeti's fury. Cut down the beast!",
          options: [
            { text: "🏃 I'm on its tracks.", nextNode: "close" }
          ]
        },
        "ready_turnin": {
          text: "By the gods of the North, you've done it! Slaying the Yeti is a feat for the sagas! Take this Ice Amulet, champion!",
          options: [
            { text: "❄️ Accept the Ice Amulet.", nextNode: "done_node", action: () => completeNPCQuest('borg_yeti') }
          ]
        },
        "done": {
          text: "Welcome back, Friend of the North! The skalds are already composing songs of your triumph over the tundra beast!",
          options: [
            { text: "🧔 For the North! Farewell.", nextNode: "close" }
          ]
        },
        "done_node": {
          text: "Let this frozen relic protect you from both blade and blizzard. The hearth of Frostholm is always open to you.",
          options: [
            { text: "🏃 Thank you, Chieftain.", nextNode: "close" }
          ]
        }
      }
    },
    "Hunter Astrid": {
      icon: "🏹",
      getGreeting: () => "start",
      nodes: {
        "start": {
          text: "The snow covers all tracks, but my arrows never miss. I have crafted a legendary Frostbound Bow. Want to buy it for 65g? It increases Attack by 7 and Speed by 3!",
          options: [
            { text: "🏹 Buy Frostbound Bow (65g)", nextNode: "buy", isShop: true },
            { text: "💬 How do you hunt in this weather?", nextNode: "hunting" },
            { text: "🏃 Just passing by.", nextNode: "close" }
          ]
        },
        "buy": {
          text: "",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Close", nextNode: "close" }
          ],
          onEnter: (node) => {
            if (state.player.gold >= 65) {
              state.player.gold -= 65;
              addItemToInventory('frostbound_bow');
              updateHUD();
              node.text = "A beautiful choice. This bow is carved from ancient ironwood and strung with Yeti sinew. Equip it and strike like winter!";
              addLog('loot', "🏪 Bought Frostbound Bow for 65g from Hunter Astrid.");
            } else {
              node.text = "No coin, no bow. Standard hunter's rule. Come back with 65g.";
            }
          }
        },
        "hunting": {
          text: "Listen to the wind. In a blizzard, stay close to mountains or take refuge in caves. The cold kills faster than any wolf.",
          options: [
            { text: "↩️ Back", nextNode: "start" },
            { text: "🏃 Wise advice. Farewell.", nextNode: "close" }
          ]
        }
      }
    }
  }
};

let currentDialogueNPC = null;
let currentDialogueTown = null;
let currentDialogueNode = null;

function acceptNPCQuest(questId) {
  let q = null;
  if (questId === 'maren_wolves') {
    q = { id: 'maren_wolves', title: '🐺 Pack Hunter', desc: 'Defeat 3 Shadow Wolves for Elder Maren.', target: 3, progress: 0, reward: { gold: 50, xp: 80, item: 'lucky_charm' }, done: false };
  } else if (questId === 'voss_bandits') {
    q = { id: 'voss_bandits', title: '⚔️ Bandit Menace', desc: 'Defeat 3 Bandits for Captain Voss.', target: 3, progress: 0, reward: { gold: 60, xp: 100, item: 'steel_sword' }, done: false };
  } else if (questId === 'adeem_relic') {
    q = { id: 'adeem_relic', title: '📚 Relic Hunt', desc: 'Bring an Ancient Key from the ruins to Scholar Adeem.', target: 1, progress: 0, reward: { gold: 100, xp: 120, item: 'amulet_life' }, done: false };
  } else if (questId === 'borg_yeti') {
    q = { id: 'borg_yeti', title: '❄️ Yeti Hunter', desc: 'Defeat the Frost Yeti in the tundra for Chieftain Borg.', target: 1, progress: 0, reward: { gold: 100, xp: 150, item: 'ice_amulet' }, done: false };
  }

  if (q && !state.quests.some(x => x.id === questId)) {
    state.quests.push(q);
    addLog('quest', `📜 Accepted Quest: ${q.title}`);
    showToast(`📜 Accepted: ${q.title}`, 'quest');
    renderQuests();
  }
}

function turnInAdeemKey() {
  const idx = state.inventory.findIndex(i => i.key === 'ancient_key');
  if (idx >= 0) {
    const item = state.inventory[idx];
    item.qty--;
    if (item.qty <= 0) state.inventory.splice(idx, 1);
    updateQuestProgress('adeem_relic', 1);
    renderInventory();
    updateHUD();
  }
}

function completeNPCQuest(questId) {
  updateQuestProgress(questId, 1);
}

function openNPCDialogue(town, npcName, nodeKey) {
  currentDialogueTown = town;
  currentDialogueNPC = npcName;
  
  const npc = NPC_DATA[town][npcName];
  if (!npc) return;
  
  if (!nodeKey) {
    nodeKey = npc.getGreeting();
  }
  currentDialogueNode = nodeKey;
  
  const node = npc.nodes[nodeKey];
  if (!node) return;
  
  if (node.onEnter) {
    node.onEnter(node);
  }
  
  document.getElementById('dialogue-portrait').textContent = npc.icon;
  document.getElementById('dialogue-speaker').textContent = npcName;
  document.getElementById('dialogue-text').textContent = node.text;
  
  const optionsEl = document.getElementById('dialogue-options');
  optionsEl.innerHTML = '';
  
  node.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'dialogue-opt-btn';
    if (opt.isShop) btn.classList.add('shop-btn');
    if (opt.nextNode === 'accept' || opt.nextNode === 'complete') btn.classList.add('quest-btn');
    
    btn.textContent = opt.text;
    btn.onclick = () => {
      if (opt.action) {
        opt.action();
      }
      
      if (opt.nextNode === 'close') {
        closeDialogue();
      } else {
        openNPCDialogue(town, npcName, opt.nextNode);
      }
    };
    optionsEl.appendChild(btn);
  });
  
  document.getElementById('dialogue-overlay').classList.add('active');
}

function closeDialogue() {
  document.getElementById('dialogue-overlay').classList.remove('active');
  currentDialogueNPC = null;
  currentDialogueTown = null;
  currentDialogueNode = null;
  updateLocationPanel();
}

function talkToLocals() {
  const tile = state.map[state.playerPos.row][state.playerPos.col];
  const loc = tile.location;
  if (!loc) return;

  const townNPCs = NPC_DATA[loc.name];
  if (townNPCs) {
    // Show NPC selection inside dialogue overlay
    document.getElementById('dialogue-portrait').textContent = '🏘️';
    document.getElementById('dialogue-speaker').textContent = loc.name;
    document.getElementById('dialogue-text').textContent = `You stand in the town of ${loc.name}. Who would you like to speak to?`;
    
    const optionsEl = document.getElementById('dialogue-options');
    optionsEl.innerHTML = '';
    
    Object.keys(townNPCs).forEach(npcName => {
      const npc = townNPCs[npcName];
      const btn = document.createElement('button');
      btn.className = 'dialogue-opt-btn';
      btn.textContent = `${npc.icon} Talk to ${npcName}`;
      btn.onclick = () => openNPCDialogue(loc.name, npcName);
      optionsEl.appendChild(btn);
    });
    
    const backBtn = document.createElement('button');
    backBtn.className = 'dialogue-opt-btn';
    backBtn.textContent = '↩️ Leave';
    backBtn.onclick = () => closeDialogue();
    optionsEl.appendChild(backBtn);
    
    document.getElementById('dialogue-overlay').classList.add('active');
  } else {
    // Fallback to randomized local dialogue
    const dialogues = [
      { text: 'An old man whispers: "Beware the Dark Woods... the Treants have gone mad."', effect: null },
      { text: '"I heard there\'s a hidden treasure on the eastern beaches!"', effect: null },
      { text: 'A merchant slips you a coin. "For your troubles."', effect: { gold: 10 } },
      { text: '"The Shadow Dragon dwells in the volcanic fortress. Only the strongest can face it."', effect: null },
      { text: 'A healer tends to your wounds. "Take care out there."', effect: { hp: 20 } },
      { text: '"The shrines grant blessings to those who pray. Seek them in the wilds."', effect: null },
      { text: 'A child offers you a lucky charm.', effect: { luck: 2 } },
      { text: '"The ruins hold secrets of the ancient civilization. And monsters..."', effect: null },
      { text: 'A guard shares some rations with you.', effect: { hp: 15, gold: 5 } },
    ];

    const d = dialogues[Math.floor(Math.random() * dialogues.length)];
    addLog('explore', `💬 ${d.text}`);

    if (d.effect) {
      if (d.effect.gold) {
        state.player.gold += d.effect.gold;
        showToast(`+${d.effect.gold} 💰`);
      }
      if (d.effect.hp) {
        state.player.hp = Math.min(state.player.maxHp, state.player.hp + d.effect.hp);
        showToast(`+${d.effect.hp} ❤️`);
      }
      if (d.effect.luck) {
        state.player.luck += d.effect.luck;
        showToast(`+${d.effect.luck} 🍀`);
      }
      updateHUD();
    }
  }
}

function enterArena() {
  const enemies = Object.entries(ENEMIES).filter(([, e]) => !e.boss);
  const [, enemy] = enemies[Math.floor(Math.random() * enemies.length)];
  const scaled = { ...enemy };
  const lvl = state.player.level;
  scaled.hp = Math.floor(enemy.hp * (1 + (lvl - 1) * 0.2));
  scaled.atk = Math.floor(enemy.atk * (1 + (lvl - 1) * 0.12));
  scaled.def = Math.floor(enemy.def * (1 + (lvl - 1) * 0.1));
  scaled.xp = Math.floor(enemy.xp * 1.5);
  scaled.gold = Math.floor(enemy.gold * 2);

  addLog('combat', `⚔️ Arena match: ${scaled.icon} ${scaled.name}!`);
  startCombat(scaled);
}

function exploreDungeon() {
  // Multiple encounters + loot
  addLog('explore', `🔦 Entering the dungeon...`);

  const enemy = getRandomEnemy('ruins');
  if (enemy) {
    enemy.hp = Math.floor(enemy.hp * 1.3);
    enemy.xp = Math.floor(enemy.xp * 1.5);
    enemy.gold = Math.floor(enemy.gold * 1.5);
    startCombat(enemy);
  }
}

function prayAtShrine() {
  const blessings = [
    { text: 'The light fills you with vigor!', stat: 'maxHp', val: 10 },
    { text: 'Ancient power flows through your arms!', stat: 'atk', val: 2 },
    { text: 'A divine shield surrounds you!', stat: 'def', val: 2 },
    { text: 'Your reflexes sharpen!', stat: 'spd', val: 2 },
    { text: 'Fortune smiles upon you!', stat: 'luck', val: 5 },
  ];

  const b = blessings[Math.floor(Math.random() * blessings.length)];
  state.player[b.stat] += b.val;
  if (b.stat === 'maxHp') state.player.hp += b.val;

  addLog('heal', `🙏 ${b.text} +${b.val} ${b.stat.toUpperCase()}`);
  showToast(`🙏 Blessed! +${b.val} ${b.stat.toUpperCase()}`, 'quest');

  // Shrine can only be used once per visit
  const tile = state.map[state.playerPos.row][state.playerPos.col];
  if (tile.location) {
    tile.location.actions = tile.location.actions.filter(a => a !== 'pray');
    tile.location.actions.push('rest');
    tile.location.desc = 'The shrine\'s energy has been absorbed. It may recover in time.';
  }

  updateHUD();
  updateLocationPanel();
}

function studyMagic() {
  const cost = 25;
  if (state.player.gold < cost) {
    showToast(`❌ Need ${cost}g to study magic.`);
    return;
  }
  state.player.gold -= cost;
  const gains = [
    { stat: 'atk', val: 3, text: '📚 Learned offensive spell! +3 ATK' },
    { stat: 'luck', val: 5, text: '📚 Learned fortune spell! +5 Luck' },
    { stat: 'spd', val: 3, text: '📚 Learned haste spell! +3 SPD' },
  ];
  const g = gains[Math.floor(Math.random() * gains.length)];
  state.player[g.stat] += g.val;
  addLog('explore', g.text);
  showToast(g.text, 'quest');
  updateHUD();
}

function bossFight() {
  if (state.player.level < 5) {
    showToast('❌ You need to be at least Level 5!');
    return;
  }
  const dragon = { ...ENEMIES.dragon };
  const lvl = state.player.level;
  dragon.hp = Math.floor(dragon.hp * (1 + (lvl - 5) * 0.1));
  dragon.atk = Math.floor(dragon.atk * (1 + (lvl - 5) * 0.05));
  addLog('danger', `🐉 You challenge the Shadow Dragon!`);
  startCombat(dragon);
}

function enterPortal() {
  // Random teleport to unexplored area
  const walkableTiles = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      if (BIOMES[state.map[r][c].biome].walkable && hexDistance(state.playerPos.col, state.playerPos.row, c, r) > 5) {
        walkableTiles.push({ col: c, row: r });
      }
    }
  }

  if (walkableTiles.length > 0) {
    const dest = walkableTiles[Math.floor(Math.random() * walkableTiles.length)];
    state.playerPos = dest;
    revealAround(dest.col, dest.row, 2);
    addLog('explore', `🌀 The portal teleports you to a distant land!`);
    showToast(`🌀 Teleported!`, 'quest');
    centerOnPlayer();
    updateHUD();
    updateLocationPanel();
  }
}

function openTreasure() {
  const tile = state.map[state.playerPos.row][state.playerPos.col];
  const loot = LOOT_TABLES.dungeon;
  const itemKey = loot[Math.floor(Math.random() * loot.length)];
  const item = ITEMS[itemKey];
  const goldBonus = 20 + Math.floor(Math.random() * 40);

  addItemToInventory(itemKey);
  state.groundLootFound = (state.groundLootFound || 0) + 1;
  state.player.gold += goldBonus;

  addLog('loot', `💎 Treasure found! ${item.icon} ${item.name} and ${goldBonus}g!`);
  showToast(`💎 ${item.icon} ${item.name} + ${goldBonus}g!`, 'loot');

  // Remove treasure after opening
  if (tile.location) {
    tile.location.actions = [];
    tile.location.desc = 'An empty treasure chest. Nothing left here.';
    tile.location.name = 'Empty Chest';
  }

  updateHUD();
  updateLocationPanel();
}

function searchWilderness() {
  const roll = Math.random();
  if (roll < 0.3) {
    // Found loot
    const tile = state.map[state.playerPos.row][state.playerPos.col];
    const lootTable = LOOT_TABLES[tile.biome] || LOOT_TABLES.common;
    const itemKey = lootTable[Math.floor(Math.random() * lootTable.length)];
    const item = ITEMS[itemKey];
    state.groundLootFound = (state.groundLootFound || 0) + 1;
    addItemToInventory(itemKey);
    addLog('loot', `🔍 Found ${item.icon} ${item.name}!`);
    showToast(`Found ${item.icon} ${item.name}!`, 'loot');
  } else if (roll < 0.5) {
    // Found gold
    const gold = 5 + Math.floor(Math.random() * 15);
    state.player.gold += gold;
    addLog('loot', `🔍 Found ${gold}g hidden in the grass!`);
    showToast(`+${gold}g!`);
  } else if (roll < 0.7) {
    // Enemy encounter
    const tile = state.map[state.playerPos.row][state.playerPos.col];
    const enemy = getRandomEnemy(tile.biome);
    if (enemy) {
      addLog('combat', `🔍 Your search disturbs a ${enemy.name}!`);
      startCombat(enemy);
    }
  } else {
    addLog('explore', `🔍 Nothing of interest found here.`);
    showToast(`Nothing found...`);
  }

  state.movesLeft = Math.max(0, state.movesLeft - 1);
  updateHUD();
  updateTurnIndicator();
}

// ═══ QUEST SYSTEM ═══
function updateQuestProgress(questId, amount) {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest || quest.done) return;

  quest.progress = Math.min(quest.target, quest.progress + amount);

  if (quest.progress >= quest.target) {
    quest.done = true;
    addLog('quest', `📜 Quest Complete: ${quest.title}!`);
    showToast(`📜 Quest Complete: ${quest.title}!`, 'quest');

    // Award rewards
    if (quest.reward.gold) state.player.gold += quest.reward.gold;
    if (quest.reward.xp) {
      state.player.xp += quest.reward.xp;
      checkLevelUp();
    }
    if (quest.reward.item) addItemToInventory(quest.reward.item);
    checkAchievements();
  }
}

function renderQuests() {
  const list = document.getElementById('quest-list');
  list.innerHTML = '';

  if (state.quests.length === 0) {
    list.innerHTML = '<div class="empty-state">No quests available.</div>';
    return;
  }

  state.quests.forEach(q => {
    const card = document.createElement('div');
    card.className = `quest-card ${q.done ? 'completed' : ''}`;
    card.innerHTML = `
      <div class="quest-title">${q.done ? '✅' : '📜'} ${q.title}</div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-progress">
        ${q.progress}/${q.target}
        <div class="progress-bar"><div class="progress-fill" style="width:${(q.progress / q.target * 100)}%"></div></div>
      </div>
    `;
    list.appendChild(card);
  });
}

// ═══ STATS PANEL ═══
function loadAchievements() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to load achievements:', e);
    return {};
  }
}

function saveAchievements() {
  try {
    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(state.achievements || {}));
  } catch (e) {
    console.warn('Failed to save achievements:', e);
  }
}

function checkAchievements() {
  if (!state.achievements) state.achievements = loadAchievements();

  const newlyUnlocked = [];
  ACHIEVEMENT_DEFS.forEach(def => {
    const unlocked = Object.prototype.hasOwnProperty.call(state.achievements, def.id);
    if (!unlocked && def.check()) {
      state.achievements[def.id] = state.turn || 1;
      newlyUnlocked.push(def);
    }
  });

  if (newlyUnlocked.length === 0) return;

  saveAchievements();
  newlyUnlocked.forEach(showAchievementToast);

  const panel = document.getElementById('panel-achievements');
  if (panel && panel.classList.contains('active')) renderAchievements();
}

function renderAchievements() {
  const list = document.getElementById('achievements-list');
  if (!list) return;

  list.innerHTML = '';
  ACHIEVEMENT_DEFS.forEach(def => {
    const unlocked = Object.prototype.hasOwnProperty.call(state.achievements || {}, def.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="achievement-card-icon">${def.icon}</div>
      <div class="achievement-card-details">
        <div class="achievement-card-title">${def.title}</div>
        <div class="achievement-card-desc">${def.desc}</div>
        <div class="achievement-card-turn">${unlocked ? `Unlocked on Turn ${state.achievements[def.id]}` : 'Locked'}</div>
      </div>
    `;
    list.appendChild(card);
  });
}

const achievementToastQueue = [];
let achievementToastActive = false;
let achievementToastTimeout;

function showAchievementToast(achievement) {
  achievementToastQueue.push(achievement);
  if (achievementToastActive) return;
  playNextAchievementToast();
}

function playNextAchievementToast() {
  const achievement = achievementToastQueue.shift();
  if (!achievement) {
    achievementToastActive = false;
    return;
  }

  achievementToastActive = true;
  const toast = document.getElementById('achievement-toast');
  if (!toast) {
    achievementToastActive = false;
    return;
  }

  document.getElementById('ach-toast-icon').textContent = achievement.icon;
  document.getElementById('ach-toast-title').textContent = achievement.title;
  document.getElementById('ach-toast-desc').textContent = achievement.desc;

  clearTimeout(achievementToastTimeout);
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');

  achievementToastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(playNextAchievementToast, 450);
  }, 3200);
}

function renderStats() {
  const p = state.player;
  if (!p) return;
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = `
    <div class="stat-card"><span class="stat-icon">⚔️</span><div><div class="stat-label">Attack</div></div><span class="stat-value">${p.atk + getEquipBonus('atk')}</span></div>
    <div class="stat-card"><span class="stat-icon">🛡️</span><div><div class="stat-label">Defense</div></div><span class="stat-value">${p.def + getEquipBonus('def')}</span></div>
    <div class="stat-card"><span class="stat-icon">💨</span><div><div class="stat-label">Speed</div></div><span class="stat-value">${p.spd}</span></div>
    <div class="stat-card"><span class="stat-icon">🍀</span><div><div class="stat-label">Luck</div></div><span class="stat-value">${p.luck}</span></div>
    <div class="stat-card"><span class="stat-icon">💀</span><div><div class="stat-label">Kills</div></div><span class="stat-value">${state.kills}</span></div>
    <div class="stat-card"><span class="stat-icon">🗺️</span><div><div class="stat-label">Explored</div></div><span class="stat-value">${state.explored} tiles</span></div>
    <div class="stat-card"><span class="stat-icon">📅</span><div><div class="stat-label">Turn</div></div><span class="stat-value">${state.turn}</span></div>
  `;
}

// ═══ HUD ═══
function updateHUD() {
  const p = state.player;
  if (!p) return;

  document.getElementById('hud-avatar').textContent = p.class.icon;
  document.getElementById('hud-name').textContent = p.name;
  document.getElementById('hud-class').textContent = `${p.class.name} · Lv.${p.level}`;

  const hpPct = p.hp / p.maxHp * 100;
  document.getElementById('hud-hp-fill').style.width = hpPct + '%';
  if (hpPct <= 25) {
    document.getElementById('hud-hp-fill').classList.add('low');
  } else {
    document.getElementById('hud-hp-fill').classList.remove('low');
  }
  document.getElementById('hud-hp-text').textContent = `${p.hp}/${p.maxHp}`;

  const xpPct = p.xp / p.xpNeeded * 100;
  document.getElementById('hud-xp-fill').style.width = xpPct + '%';
  document.getElementById('hud-xp-text').textContent = `${p.xp}/${p.xpNeeded}`;

  document.getElementById('hud-gold').textContent = p.gold;
  document.getElementById('hud-explored').textContent = state.explored;
  document.getElementById('hud-kills').textContent = state.kills;
  checkAchievements();
}

// ═══ PANEL SWITCHING ═══
function switchPanel(panel) {
  document.querySelectorAll('.panel-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'));

  document.getElementById(`ptab-${panel}`).classList.add('active');
  document.getElementById(`panel-${panel}`).classList.add('active');

  if (panel === 'inventory') renderInventory();
  if (panel === 'stats') renderStats();
  if (panel === 'quests') renderQuests();
  if (panel === 'achievements') renderAchievements();
}

// ═══ EVENT LOG ═══
function addLog(type, text) {
  const entry = { type, text, turn: state.turn };
  state.eventLog.unshift(entry);
  if (state.eventLog.length > 50) state.eventLog.pop();

  const log = document.getElementById('event-log');
  const el = document.createElement('div');
  el.className = `log-entry ${type}`;
  el.innerHTML = `<div class="log-turn">Turn ${state.turn}</div>${text}`;
  log.insertBefore(el, log.firstChild);

  // Keep only last 30 entries in DOM
  while (log.children.length > 30) {
    log.removeChild(log.lastChild);
  }
}

// ═══ TOAST ═══
let toastTimeout;
function showToast(text, cls = '') {
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.className = `toast ${cls} show`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ═══ DEATH / VICTORY ═══
function playerDeath() {
  SoundEngine.playDefeat();
  state.screen = 'dead';
  document.getElementById('combat-overlay').classList.remove('active');
  document.getElementById('death-overlay').classList.add('active');
  document.getElementById('death-stats').innerHTML = `
    <div>💀 Fallen at Level ${state.player.level}</div>
    <div>⚔️ Enemies Defeated: ${state.kills}</div>
    <div>🗺️ Tiles Explored: ${state.explored}</div>
    <div>📅 Survived ${state.turn} Turns</div>
    <div>💰 Gold Earned: ${state.player.gold}</div>
  `;
}

function showVictory() {
  SoundEngine.playVictory();
  state.screen = 'victory';
  state.bossDefeated = true;
  checkAchievements();
  document.getElementById('victory-overlay').classList.add('active');
  document.getElementById('victory-stats').innerHTML = `
    <div>🏆 Conquered at Level ${state.player.level}</div>
    <div>⚔️ Enemies Defeated: ${state.kills}</div>
    <div>🗺️ Tiles Explored: ${state.explored}</div>
    <div>📅 Completed in ${state.turn} Turns</div>
    <div>📜 Quests Done: ${state.quests.filter(q => q.done).length}/${state.quests.length}</div>
  `;
}

function restartGame() {
  state.screen = 'title';
  selectedClass = null;
  selectedItemIdx = -1;

  document.getElementById('death-overlay').classList.remove('active');
  document.getElementById('victory-overlay').classList.remove('active');
  document.getElementById('combat-overlay').classList.remove('active');
  document.getElementById('game-wrapper').classList.remove('active');
  document.getElementById('char-creation').classList.remove('active');
  document.getElementById('title-screen').classList.remove('hidden');

  document.querySelectorAll('.class-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('class-preview').className = 'class-stats-preview';
  document.getElementById('btn-begin').disabled = true;
  document.getElementById('hero-name-input').value = '';

  // Reset local storage
  localStorage.removeItem('realm_save');
  document.getElementById('btn-continue').style.display = 'none';
}

// ═══ SAVE / LOAD ═══
function saveGame() {
  const saveData = {
    player: state.player,
    map: state.map,
    revealed: state.revealed,
    playerPos: state.playerPos,
    inventory: state.inventory,
    equipped: state.equipped,
    quests: state.quests,
    turn: state.turn,
    kills: state.kills,
    explored: state.explored,
    bossDefeated: state.bossDefeated,
    potionUsed: state.potionUsed,
    flees: state.flees,
    groundLootFound: state.groundLootFound,
    eventLog: state.eventLog.slice(0, 20),
  };
  localStorage.setItem('realm_save', JSON.stringify(saveData));
  saveAchievements();
  showToast('💾 Game Saved!');
}

function checkSaveGame() {
  if (localStorage.getItem('realm_save')) {
    document.getElementById('btn-continue').style.display = 'block';
  }
}

function continueGame() {
  const raw = localStorage.getItem('realm_save');
  if (!raw) return;

  try {
    const save = JSON.parse(raw);
    state.player = save.player;
    state.map = save.map;
    state.revealed = save.revealed;
    state.playerPos = save.playerPos;
    state.inventory = save.inventory;
    state.equipped = save.equipped;
    state.quests = save.quests;
    state.turn = save.turn;
    state.kills = save.kills;
    state.explored = save.explored;
    state.bossDefeated = save.bossDefeated || false;
    state.potionUsed = save.potionUsed || false;
    state.flees = save.flees || 0;
    state.groundLootFound = save.groundLootFound || 0;
    state.achievements = loadAchievements();
    state.eventLog = save.eventLog || [];
    state.movesLeft = MOVES_PER_TURN;
    state.screen = 'playing';
    state.combat = null;

    // Restore class object reference
    const cls = CLASSES.find(c => c.id === state.player.class.id);
    if (cls) state.player.class = cls;

    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('game-wrapper').classList.add('active');
    resizeCanvases();
    centerOnPlayer();
    updateHUD();
    updateLocationPanel();
    updateTurnIndicator();
    addLog('explore', `📜 Journey resumed. Welcome back, ${state.player.name}!`);
    showToast(`📜 Welcome back, ${state.player.name}!`);
  } catch (e) {
    console.error('Failed to load save:', e);
    showToast('❌ Save corrupted.');
    localStorage.removeItem('realm_save');
  }
}

// ═══ UTILITIES ═══
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r},${g},${b})`;
}

// ═══ SOUND ENGINE (WEB AUDIO API) ═══
function makeDistortionCurve(amount) {
  const k = typeof amount === 'number' ? amount : 50;
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

const SoundEngine = {
  ctx: null,
  muted: false,

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn("Web Audio API not supported in this browser.", e);
    }
  },

  resumeCtx() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  toggleMute() {
    this.resumeCtx();
    this.muted = !this.muted;
    const btn = document.getElementById('btn-mute');
    if (btn) {
      btn.textContent = this.muted ? '🔇' : '🔊';
      btn.title = this.muted ? 'Unmute Sound' : 'Mute Sound';
    }
  },

  createNoiseBufferNode() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    return source;
  },

  playHit() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Main oscillator (sawtooth with frequency glide)
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    // Distortion
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(15);
    shaper.oversample = '4x';

    // Volume envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.15);

    // Procedural noise burst for attack thump
    const noise = this.createNoiseBufferNode();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(300, t);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.08);

    if (noise) {
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.08);
    }

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  },

  playCrit() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // Main punchy oscillator (sawtooth at 400Hz gliding to 80Hz)
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);

    // Stronger distortion
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = makeDistortionCurve(45);
    shaper.oversample = '4x';

    // Metallic ring overtones (frequency modulation / additive harmonics)
    const ring1 = this.ctx.createOscillator();
    ring1.type = 'sine';
    ring1.frequency.setValueAtTime(1050, t);
    
    const ring2 = this.ctx.createOscillator();
    ring2.type = 'sine';
    ring2.frequency.setValueAtTime(1680, t);

    // Main envelope
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.2);

    // Ring envelope
    const ringGain = this.ctx.createGain();
    ringGain.gain.setValueAtTime(0.18, t);
    ringGain.gain.linearRampToValueAtTime(0.001, t + 0.15);

    // Loud noise burst
    const noise = this.createNoiseBufferNode();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(900, t);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.12);

    if (noise) {
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(t);
      noise.stop(t + 0.12);
    }

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(this.ctx.destination);

    ring1.connect(ringGain);
    ring2.connect(ringGain);
    ringGain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
    ring1.start(t);
    ring1.stop(t + 0.15);
    ring2.start(t);
    ring2.stop(t + 0.15);
  },

  playHeal() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25]; // C5, E5

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.18;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      
      // Bubbling frequency glide upward
      osc.frequency.exponentialRampToValueAtTime(freq * 1.06, noteTime + 0.2);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  },

  playLevelUp() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 293.66, 329.63, 392.00, 523.25]; // C4 D4 E4 G4 C5
    const duration = 0.12;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.1;

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + duration);
    });
  },

  playVictory() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4 E4 G4 C5 E5 G5
    const durations = [0.12, 0.12, 0.12, 0.12, 0.12, 0.50];
    const offsets = [0, 0.12, 0.24, 0.36, 0.48, 0.60];

    notes.forEach((freq, idx) => {
      const noteTime = t + offsets[idx];
      const dur = durations[idx];

      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.16, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + dur);
    });
  },

  playDefeat() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [196.00, 155.56, 130.81]; // G3, Eb3, C3 (Somber descending minor)

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.25;

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, noteTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.5 - idx * 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.5);
    });
  },

  playStep() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, t);
    osc.frequency.linearRampToValueAtTime(50, t + 0.05);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.06, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  },

  playFlee() {
    if (this.muted) return;
    this.resumeCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.4);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.4);
  }
};

window.addEventListener('click', () => SoundEngine.resumeCtx(), { once: true });
window.addEventListener('touchstart', () => SoundEngine.resumeCtx(), { once: true });

