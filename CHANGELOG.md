# Changelog

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
