'use strict';

// ── DOM refs ──
const boardEl       = document.getElementById('board');
const turnInfo      = document.getElementById('turn-info');
const btnReserve    = document.getElementById('btn-reserve');
const overlay       = document.getElementById('overlay');
const overlayTitle  = document.getElementById('overlay-title');
const overlayMsg    = document.getElementById('overlay-msg');
const panelRed      = document.getElementById('panel-red');
const panelBlue     = document.getElementById('panel-blue');
const youBadgeRed   = document.getElementById('you-badge-red');
const youBadgeBlue  = document.getElementById('you-badge-blue');
const reserveRed    = document.getElementById('reserve-red');
const reserveBlue   = document.getElementById('reserve-blue');
const capturedRed   = document.getElementById('captured-red');
const capturedBlue  = document.getElementById('captured-blue');

// ── Constants ──
const CORNERS = new Set([
  '0,0','0,1','1,0',
  '0,6','0,7','1,7',
  '6,0','7,0','7,1',
  '6,7','7,6','7,7'
]);
const INIT = 18;

// ── State ──
let socket      = null;
let myColor     = null;
let gameState   = null;
let selected    = null;
let validMoves  = [];
let placeMode   = false;

// ── Coordinate remapping ──
function toServer(r, c) {
  if (myColor !== 'blue') return { row: r, col: c };
  return { row: 7 - r, col: 7 - c };
}
function toVisual(r, c) {
  if (myColor !== 'blue') return { row: r, col: c };
  return { row: 7 - r, col: 7 - c };
}

// ── Helpers ──
function isValid(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8 && !CORNERS.has(r + ',' + c);
}

function stackAt(r, c) {
  return gameState && gameState.board[r] && gameState.board[r][c];
}

function movesFrom(r, c, h) {
  var out = [];
  var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (var d = 1; d <= h; d++) {
    for (var i = 0; i < dirs.length; i++) {
      var nr = r + dirs[i][0] * d;
      var nc = c + dirs[i][1] * d;
      if (isValid(nr, nc)) out.push({ row: nr, col: nc, distance: d });
    }
  }
  return out;
}

// ── Board init ──
function buildBoard() {
  boardEl.innerHTML = '';
  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      var sv = toServer(r, c);
      if (CORNERS.has(sv.row + ',' + sv.col)) {
        cell.classList.add('corner');
      } else {
        cell.addEventListener('click', (function (rr, cc) {
          return function () { onCell(rr, cc); };
        })(r, c));
      }
      boardEl.appendChild(cell);
    }
  }
}

// ── Render ──
function render() {
  if (!gameState) return;

  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      var v = toVisual(r, c);
      var el = document.querySelector('.cell[data-row="' + v.row + '"][data-col="' + v.col + '"]');
      if (!el || el.classList.contains('corner')) continue;

      el.innerHTML = '';
      el.classList.remove('selected', 'valid-move', 'full', 'split');

      var stack = gameState.board[r][c];
      if (!stack || !Array.isArray(stack) || stack.length === 0) continue;

      for (var i = 0; i < stack.length; i++) {
        var p = document.createElement('div');
        p.className = 'piece ' + stack[i];
        p.style.setProperty('--stack-pos', i);
        el.appendChild(p);
      }

      if (stack.length > 1) {
        var b = document.createElement('div');
        b.className = 'height-badge';
        b.textContent = stack.length;
        el.appendChild(b);
      }
    }
  }

  if (selected) {
    var sel = document.querySelector('.cell[data-row="' + selected.row + '"][data-col="' + selected.col + '"]');
    if (sel) sel.classList.add('selected');
    showMoves();
  }
}

function showMoves() {
  document.querySelectorAll('.cell.valid-move').forEach(function (c) { c.classList.remove('valid-move', 'full', 'split'); });
  if (!selected || placeMode) return;

  var sv = toServer(selected.row, selected.col);
  var s = stackAt(sv.row, sv.col);
  if (!s || !Array.isArray(s) || s.length === 0) return;

  var fullHeight = s.length;

  validMoves = movesFrom(sv.row, sv.col, fullHeight).map(function (m) {
    var v = toVisual(m.row, m.col);
    return { row: v.row, col: v.col, distance: m.distance };
  });

  validMoves.forEach(function (m) {
    var el = document.querySelector('.cell[data-row="' + m.row + '"][data-col="' + m.col + '"]');
    if (el) {
      el.classList.add('valid-move');
      el.classList.add(m.distance === fullHeight ? 'full' : 'split');
    }
  });
}

function showReserveTargets() {
  document.querySelectorAll('.cell.valid-move').forEach(function (c) { c.classList.remove('valid-move', 'full', 'split'); });
  if (!gameState) return;

  for (var r = 0; r < 8; r++) {
    for (var c = 0; c < 8; c++) {
      if (!isValid(r, c)) continue;
      var s = gameState.board[r][c];
      if (!s || !Array.isArray(s) || s.length === 0) {
        var v = toVisual(r, c);
        var el = document.querySelector('.cell[data-row="' + v.row + '"][data-col="' + v.col + '"]');
        if (el) el.classList.add('valid-move');
      }
    }
  }
}

// ── Selection ──
function sel(r, c) {
  selected = { row: r, col: c };
  var el = document.querySelector('.cell[data-row="' + r + '"][data-col="' + c + '"]');
  if (el) el.classList.add('selected');
  showMoves();
}

function desel() {
  if (selected) {
    var el = document.querySelector('.cell[data-row="' + selected.row + '"][data-col="' + selected.col + '"]');
    if (el) el.classList.remove('selected');
  }
  selected = null;
  validMoves = [];
  document.querySelectorAll('.cell.valid-move').forEach(function (c) { c.classList.remove('valid-move', 'full', 'split'); });
}

function setPlace(v) {
  placeMode = v;
  desel();
  if (v) {
    btnReserve.classList.add('active');
    btnReserve.textContent = 'Annulla';
    showReserveTargets();
  } else {
    btnReserve.classList.remove('active');
    btnReserve.textContent = 'Piazza Riserva';
  document.querySelectorAll('.cell.valid-move').forEach(function (c) { c.classList.remove('valid-move', 'full', 'split'); });
  }
}

// ── Clicks ──
function onCell(r, c) {
  if (!gameState || gameState.gameOver || !myColor) return;
  if (gameState.currentPlayer !== myColor) return;

  if (placeMode) {
    var sv = toServer(r, c);
    var s = stackAt(sv.row, sv.col);
    if (s && Array.isArray(s) && s.length > 0) return;
    socket.emit('place-reserve', { row: sv.row, col: sv.col });
    setPlace(false);
    return;
  }

  if (!selected) {
    var sv2 = toServer(r, c);
    var s2 = stackAt(sv2.row, sv2.col);
    if (!s2 || !Array.isArray(s2) || s2.length === 0) return;
    if (s2[s2.length - 1] !== myColor) return;
    if (movesFrom(sv2.row, sv2.col, s2.length).length === 0) return;
    sel(r, c);
    return;
  }

  if (selected.row === r && selected.col === c) { desel(); return; }

  if (validMoves.some(function (m) { return m.row === r && m.col === c; })) {
    var from = toServer(selected.row, selected.col);
    var to   = toServer(r, c);
    socket.emit('move', { fromRow: from.row, fromCol: from.col, toRow: to.row, toCol: to.col });
    desel();
    return;
  }

  desel();
  var sv3 = toServer(r, c);
  var s3 = stackAt(sv3.row, sv3.col);
  if (s3 && Array.isArray(s3) && s3.length > 0 && s3[s3.length - 1] === myColor) {
    if (movesFrom(sv3.row, sv3.col, s3.length).length > 0) sel(r, c);
  }
}

// ── Reserve button ──
btnReserve.addEventListener('click', function () {
  if (!gameState || gameState.gameOver) return;
  if (gameState.currentPlayer !== myColor) return;
  if (!gameState.reserves || gameState.reserves[myColor] <= 0) return;
  setPlace(!placeMode);
});

// ── Update UI ──
function refresh() {
  if (!gameState) return;
  render();

  if (gameState.reserves) {
    reserveRed.textContent  = String(gameState.reserves.red  || 0);
    reserveBlue.textContent = String(gameState.reserves.blue || 0);
  }
  if (gameState.remaining) {
    capturedRed.textContent  = String(INIT - (gameState.remaining.blue || 0));
    capturedBlue.textContent = String(INIT - (gameState.remaining.red  || 0));
  }

  if (gameState.gameOver) {
    var w = gameState.winner === myColor ? 'Hai vinto!' : 'Hai perso!';
    var col = gameState.winner === 'red' ? 'ROSSO' : 'BLU';

    turnInfo.replaceChildren();
    var dotEl = document.createElement('span');
    dotEl.className = 'dot ' + gameState.winner;
    turnInfo.appendChild(dotEl);
    turnInfo.appendChild(document.createTextNode(w + ' (' + col + ')'));

    btnReserve.disabled = true;
    desel();
    showOverlay(w, w === 'Hai vinto!' ? 'Complimenti, hai sconfitto il tuo avversario!' : 'Il tuo avversario ha avuto la meglio. Riprova!');
    return;
  }

  var cur = gameState.currentPlayer;
  var cn  = cur === 'red' ? 'ROSSO' : 'BLU';
  var isMine = cur === myColor;

  turnInfo.replaceChildren();
  var dotEl2 = document.createElement('span');
  dotEl2.className = 'dot ' + cur;
  turnInfo.appendChild(dotEl2);
  turnInfo.appendChild(document.createTextNode('Turno: ' + cn));
  if (isMine) {
    turnInfo.appendChild(document.createTextNode(' '));
    var btag = document.createElement('b');
    btag.textContent = '(TU)';
    turnInfo.appendChild(btag);
  }

  var hasRes = gameState.reserves && gameState.reserves[myColor] > 0;
  btnReserve.disabled = !isMine || !hasRes;

  if (!isMine) {
    setPlace(false);
    desel();
  }

  panelRed.classList.toggle('is-you', myColor === 'red');
  panelBlue.classList.toggle('is-you', myColor === 'blue');
  panelRed.classList.toggle('is-turn', cur === 'red');
  panelBlue.classList.toggle('is-turn', cur === 'blue');
  youBadgeRed.style.opacity  = myColor === 'red'  ? '1' : '0';
  youBadgeBlue.style.opacity = myColor === 'blue' ? '1' : '0';
}

// ── Overlay ──
function showOverlay(title, msg) {
  overlayTitle.textContent = title;
  overlayMsg.textContent = msg;
  overlay.classList.remove('hidden');
}

document.getElementById('overlay-btn').addEventListener('click', function () {
  location.reload();
});

// ── Socket ──
function connect() {
  socket = io();

  socket.on('connect', function () {
    socket.emit('join');
  });

  socket.on('joined', function (data) {
    myColor = data.color;
    buildBoard();
  });

  socket.on('waiting', function () {
    turnInfo.textContent = 'In attesa di un avversario\u2026';
  });

  socket.on('game-state', function (state) {
    gameState = state;
    overlay.classList.add('hidden');
    desel();
    setPlace(false);
    refresh();
  });

  socket.on('error', function () {
    desel();
    setPlace(false);
  });

  socket.on('opponent-disconnected', function () {
    showOverlay('Avversario Disconnesso', 'Il tuo avversario ha abbandonato la partita.');
    gameState = null;
    myColor = null;
    desel();
    setPlace(false);
  });

  socket.on('disconnect', function () {
    turnInfo.textContent = 'Disconnesso dal server. Ricarica la pagina.';
  });
}

// ── Boot ──
connect();
