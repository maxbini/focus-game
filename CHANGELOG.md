# Changelog

## [0.1.7] — 2026-05-05

### Added
- **Tower preview card** below the board showing stacked pieces in side view (2D), available on any click — own turn, opponent's turn, any player's pieces
- Pieces rendered as cylinders with semi-circle dome, rotated 90° horizontally (lying down), overlapping in a row

### Changed
- Preview persists after deselection — stays visible until game state resets

## [0.1.6] — 2026-05-05

### Added
- **Tower preview**: when a stack is selected during your turn, a lateral-view card appears centered over the panels showing stacked miniature pieces with leaning offset, height, and colors — never overlaps the board

## [0.1.5] — 2026-05-05

### Changed
- Panel vertical height halved: reduced `gap`, `padding`, `line-height`, dot size, and badge margins
- Compressed vertical spacing: header, top-bar, game-area, and board-frame padding all reduced
- Removed `flex: 1` from game-area (eliminated elastic empty space between panels and board)

## [0.1.4] — 2026-04-30

### Added
- **Tower splitting**: a player can now move any number of pieces from a stack (1 to full height). Distance = pieces moved. Visible split/full indicators on valid-move cells.

### Fixed
- Cells invisible at startup: root cause was `filter: drop-shadow()` on `.board` creating a new containing block that broke CSS Grid percentage sizing in Chromium
- Cell sizing: replaced `width:72% + place-self:center + aspect-ratio` with `margin: 14%` for cross-browser compatibility

### Changed
- Removed `filter: drop-shadow()` from `.board` (grid child rendering bug)
- Valid-move indicators differentiated: `.full::after` (26%, standard pulse) for full moves, `.split::after` (18%, subtle pulse) for splits

## [0.1.3] — 2026-04-30

### Security
- Replaced `innerHTML` with `textContent` + `createElement` in turn info rendering (OWASP A03 Injection)
- Added `MAX_CONCURRENT = 200` connection limit with forceful disconnect (DoS protection)

### GDPR Compliance
- Google Fonts (`Outfit`) now self-hosted via `@fontsource/outfit` — zero third-party requests
- Added `/privacy.html` (GDPR Art. 13: data controller, legal basis Art. 6(1)(f), rights Art. 15–21, retention)
- Added `/terms.html` (service description, user conduct, limitation of liability, IP attribution)
- CSP tightened: `style-src 'self'`, `font-src 'self'` (Google Fonts domains removed)
- Footer with Privacy Policy and Terms of Service links added to main page
- Room ID removed from `joined` event payload (no longer exposed to client)

### UI
- Active-turn panel now has interior colored glow (`inset 0 0 50px` with player color at 9% opacity)

## [0.1.2] — 2026-04-30

### Security
- Added `helmet` middleware with 14 security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, COOP, CORP, etc.)
- Custom `Content-Security-Policy`: `script-src 'self'`, `style-src 'self'`, `connect-src 'self' ws: wss:`, `frame-ancestors 'none'`, `object-src 'none'`, `script-src-attr 'none'`
- Removed inline `onclick` from HTML (violates `script-src-attr 'none'`) — moved to `addEventListener` in `game.js`
- Room IDs now use `crypto.randomBytes()` instead of `Math.random()` (cryptographically secure)
- Socket.io CORS restricted to `origin: false` (same-origin only)
- Input validation guards `assertCoords()` / `assertCell()` on `move` and `place-reserve` socket events

## [0.1.1] — 2026-04-30

### Changed
- **Mondadori Physical Edition** theme: yellow mustard (`#D4AF37`) box interior, 10px white cardboard border, octagonal injection-molded black plastic board with `clip-path` + `drop-shadow` + noise texture
- Glossy pinpoint reflection on pieces via `::after` radial gradient ellipse
- Score panels: darker `#151515`, recessed `2px` border, physical controller look
- Panel fonts enlarged: titles `clamp(1.1rem, 3vw, 1.5rem)`, labels `clamp(0.9rem, 2.2vw, 1.15rem)`, counters `clamp(1.5rem, 3.5vw, 2rem)`
- Cell domes shrunk to `72%` of grid area (`place-self: center`) matching piece diameter — more visible black plastic surface between cells
- Board grid gap increased to `clamp(6px, 1.5vw, 10px)`, padding to `clamp(10px, 2vw, 16px)`
- Pieces fill `100%` of cell dome (same visual diameter as before), enhanced `drop-shadow` on hover (`0 8px 18px`) and selection (`0 12px 28px`)
- Mobile: panels stack vertically below 420px; all font sizes use `clamp()` for native responsiveness

## [0.1.0] — 2026-04-30

### Added
- Complete multiplayer Focus board game (Sid Sackson) with Node.js + Socket.io
- Automatic lobby system: first player creates room, second auto-joins
- Server-side move validation: distance = stack height, only top-color controls movement
- 5-piece stack limit with automatic overflow: own pieces → reserve, opponent's → captured
- Reserve placement mechanic: place pieces from reserve onto empty cells
- Win detection: game ends when opponent cannot make a legal move
- 180° board rotation per player — each sees their own color at the bottom (`toServer`/`toVisual` coordinate remapping)
- Disconnection handling: opponent disconnect ends game with forfeit

### UI / Design
- **Dark Plastic Premium** theme: pure black `#000000` background, semi-sphere dome cells with `radial-gradient` + `perspective` 3D effect
- Red (`#e11d48`) and Blue (`#2563eb`) 3D plastic tokens with radial gradient highlights and layered box-shadows
- Stack visualization via CSS `--stack-pos` offset + height badge
- Glassmorphism side panels with `backdrop-filter: blur()`
- White cardboard board frame (game-box aesthetic) with SVG noise texture and rounded bevel shadows
- Compact vertical-panel top bar: turn indicator + both player stats on one row above the board
- Fully responsive — works from 320px smartphones to desktop
- Font: **Outfit** (Google Fonts)

### Iterations
- v0.0.1: Initial dark theme with glass panels, flat board cells
- v0.0.2: Game-box container (yellow → dark grey) with octagonal frame and 4 interactive reserve seats
- v0.0.3: Board rotation (Blue sees pieces at bottom)
- v0.0.4: Removed game-box/octagon/reserve seats; compact horizontal top-bar for full-width board
- v0.0.5: Vertical panel layout, larger fonts, white cardboard frame

### Known Limitations
- No spectator mode
- No reconnection (room destroyed on disconnect)
- Turn indicator does not flash/timer
