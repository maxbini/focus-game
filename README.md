# FOCUS — Sid Sackson

> A real-time multiplayer web implementation of the classic board game **Focus** by Sid Sackson, with a physical "Mondadori edition" skeuomorphic design.

[![Live Demo](https://img.shields.io/badge/demo-live-blue)](https://focus-game-h85z.onrender.com)
[![GitHub](https://img.shields.io/badge/github-maxbini/focus--game-333)](https://github.com/maxbini/focus-game)
![Version](https://img.shields.io/badge/version-0.1.3-black)
![License](https://img.shields.io/badge/license-MIT-black)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

---

## Live Demo

**Play now:** [focus-game-h85z.onrender.com](https://focus-game-h85z.onrender.com)

Open the link on two devices (or two browser tabs) — the first player creates the lobby, the second joins automatically.

---

## Quick Start

Focus is a two-player abstract strategy game played on an 8×8 board with the four corners removed. Each player starts with 18 pieces. Pieces can be stacked (forming "towers"), and a stack moves exactly as many squares as its height. Only the player whose color is on top of a stack controls it. The goal is to capture all opponent pieces or leave them with no legal moves.

*Game designed by Sid Sackson. First published in 1963.*

---

## Quick Start

```bash
git clone https://github.com/maxbini/focus-game.git
cd focus-game
npm install
npm start
```

Open **two browser tabs** at `http://localhost:3000`. The first player creates a lobby automatically; the second joins. Red goes first.

---

## How to Play

| Action | How |
|---|---|
| **Select a stack** | Click on any cell where your color (🔴 Red / 🔵 Blue) is on top |
| **Move it** | Click a highlighted destination cell — distance must equal the stack height |
| **Place from reserve** | Click the "Piazza Riserva" button (or your reserve seat), then click an empty cell |

### Rules in Brief

- A stack of **N** pieces moves exactly **N** squares in a straight line (orthogonal).
- You can only move stacks where your color is on **top**.
- When landing on another stack, they combine. If the result exceeds **5 pieces**, excess pieces are removed from the **bottom**:
  - Your own pieces → returned to your **reserve**
  - Opponent's pieces → **captured** (permanently removed)
- On your turn, you may also place one piece from your reserve onto any empty cell.
- **You win** when your opponent cannot make a legal move.

---

## Project Structure

```
focus/
├── server.js              # Express + Socket.io server, game logic, room management
├── package.json
├── CHANGELOG.md
├── README.md
└── public/
    ├── index.html         # Main game page
    ├── style.css          # Skeuomorphic dark theme (Mondadori edition)
    ├── game.js            # Client-side: board rendering, input handling, Socket.io client
    ├── fonts.css          # Self-hosted Outfit font (5 weights)
    ├── privacy.html       # GDPR privacy policy
    └── terms.html         # Terms of service
```

### Server (`server.js`)

- **Express** — serves static files and security headers (helmet with strict CSP)
- **Socket.io** — real-time bidirectional communication, room-based game sessions
- **Lobby system** — `findOrCreateRoom()` auto-assigns players to rooms
- **Move validation** — server-authoritative: checks turn, ownership, valid destinations, 5-piece limit
- **Coordinate system** — absolute server coordinates; client handles per-player 180° rotation

### Client (`public/`)

- **`game.js`** — vanilla JavaScript: DOM rendering, click handling, coordinate remapping (`toServer`/`toVisual`), Socket.io event handlers
- **`style.css`** — 680-line CSS with custom variables, `clamp()`-based responsive sizing, CSS Grid board, semi-sphere dome cells with `radial-gradient` + `perspective`, 3D plastic pieces, SVG noise textures
- **`fonts.css`** — local fontface imports from `@fontsource/outfit` (zero external requests)

---

## Key Features

| Feature | Detail |
|---|---|
| **Lobby system** | Automatic room creation/join — no setup required |
| **Server-authoritative** | All moves validated server-side; clients cannot cheat |
| **Board rotation** | Each player sees their own color at the bottom (180° coordinate remapping) |
| **5-piece limit** | Overflow handled automatically: own → reserve, opponent's → captured |
| **Reserve mechanic** | Place pieces from reserve onto empty cells |
| **Win detection** | Game ends when opponent has no legal moves |
| **Disconnection** | Opponent disconnect triggers forfeit; room cleaned up |
| **Responsive** | Works from 320px smartphones to 4K desktop |
| **Zero cookies** | No localStorage, no tracking, no analytics |
| **Self-hosted fonts** | Outfit served locally — no Google Fonts requests |
| **GDPR compliant** | Privacy policy + terms of service included |
| **Security headers** | Helmet: CSP, HSTS, X-Frame-Options, COOP, CORP, X-Content-Type-Options |

---

## Design

The UI follows a **skeuomorphic "Mondadori Physical Edition"** aesthetic:

- **Box container**: Yellow mustard (`#D4AF37`) interior with 10px white cardboard border
- **Board**: Octagonal injection-molded black plastic with `clip-path` + `drop-shadow` + noise texture
- **Cells**: Semi-sphere raised domes (`radial-gradient` + `perspective`)
- **Pieces**: Glossy 3D plastic tokens with pinpoint highlight reflection (`::after`)
- **Panels**: Dark `#151515` physical controller look with recessed border and turn-based interior glow

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 18 |
| Server | Express 4 |
| Real-time | Socket.io 4 |
| Security | Helmet 8 |
| Fonts | `@fontsource/outfit` (self-hosted) |
| Styling | Vanilla CSS (CSS Grid, custom properties, `clamp()`, SVG noise) |
| Client | Vanilla JavaScript (zero dependencies) |

---

## Security

- **Strict CSP**: `script-src 'self'`, `script-src-attr 'none'` — no inline JavaScript
- **HSTS**: `max-age=31536000; includeSubDomains`
- **Clickjacking**: `X-Frame-Options: SAMEORIGIN`, `frame-ancestors 'none'`
- **MIME sniffing**: `X-Content-Type-Options: nosniff`
- **CORS**: Socket.io restricted to same-origin only
- **Input validation**: Integer range checks on all socket event coordinates
- **DoS protection**: Max 200 concurrent connections
- **Room IDs**: `crypto.randomBytes()` — not guessable
- **No secrets**: No API keys, no `.env` files, no credentials in frontend

Audited against **OWASP Top 10** (A01–A08) and **GDPR** (Art. 6, 13, 15–21).  
See `/privacy.html` and `/terms.html` for legal documentation.

---

## License

MIT — see source files for details.

Focus is a trademark of the Sackson estate. This is a fan implementation for recreational use.
