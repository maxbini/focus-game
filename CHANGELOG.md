# Changelog

## [0.1.0] — 2026-04-29

### Added
- Focus multiplayer board game (Sid Sackson) with Node.js + Socket.io
- Auto-lobby: first player creates room, second joins automatically
- 8×8 grid with 12 corner squares removed (52 playable cells)
- 18 pieces per player, initial placement on 3 home rows
- Piece movement: stack moves exactly `height` squares in 4 orthogonal directions
- Stack limit: max 5 pieces; excess pieces from bottom → reserve (own) or captured (opponent)
- Reserve mechanic: place a reserve piece on any empty square via button
- Win condition: opponent has no legal moves
- Server-side move validation and game-over detection

### UI/UX
- Dark Plastic Premium theme (`#000000` background)
- Semi-sphere board cells with `radial-gradient` dome effect and 3D perspective
- 3D plastic tokens (red `#e11d48` / blue `#2563eb`) with radial gradients and box shadows
- Stack visualization: vertical offset via `--stack-pos` CSS variable + height badge
- Glassmorphism panels with `backdrop-filter` and turn glow effect
- White cardboard frame (`#f2efe9` → `#d1cbc0`) with matte noise texture
- Board rotation: Blue player sees their pieces at the bottom (180° coordinate remap)
- Compact top bar: turn-info above, Red/Blue stat panels side by side
- Responsive: mobile-first with breakpoints at 600px and 370px
- Font: Outfit (Google Fonts)

### Changed
- Board layout iterated from 3-column (panel-board-panel) to compact top bar + full-width board
- Reserve seats removed (interactive vani) → replaced by single reserve button
- P1/P2 indicator squares removed → dot + text turn indicator
- Octagonal `clip-path` board frame replaced by rectangular cardboard frame
- Yellow box (`#ffcc33`) replaced by dark grey (`#1c1c24`) then removed entirely
- Panel count reduced from vertical digital displays to compact inline stats

### Fixed
- Coordinate remapping property names (`{r,c}` → `{row,col}`) fixing move emission for Blue player

### Technical
- Stack: Express 4.18, Socket.io 4.7, vanilla JS client
- CSS Grid board, Flexbox layout, CSS custom properties for theming
- SVG noise filter texture on cardboard frame
- `toServer()` / `toVisual()` symmetric coordinate mapping for player orientation
