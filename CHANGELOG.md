# Changelog

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
