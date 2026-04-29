'use strict';

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const INITIAL_PIECES = 18;

const CORNERS = new Set([
  '0,0', '0,1', '1,0',
  '0,6', '0,7', '1,7',
  '6,0', '7,0', '7,1',
  '6,7', '7,6', '7,7'
]);

function range(s, e) {
  return Array.from({ length: e - s + 1 }, (_, i) => s + i);
}

function isValidSquare(r, c) {
  return r >= 0 && r < 8 && c >= 0 && c < 8 && !CORNERS.has(`${r},${c}`);
}

function createBoard() {
  const board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => []));

  for (const key of CORNERS) {
    const [r, c] = key.split(',').map(Number);
    board[r][c] = undefined;
  }

  const bluePositions = [
    ...range(2, 5).map(c => [0, c]),
    ...range(1, 6).map(c => [1, c]),
    ...range(0, 7).map(c => [2, c])
  ];
  for (const [r, c] of bluePositions) {
    board[r][c] = ['blue'];
  }

  const redPositions = [
    ...range(2, 5).map(c => [7, c]),
    ...range(1, 6).map(c => [6, c]),
    ...range(0, 7).map(c => [5, c])
  ];
  for (const [r, c] of redPositions) {
    board[r][c] = ['red'];
  }

  return board;
}

function getValidMoves(board, r, c) {
  const stack = board[r] && board[r][c];
  if (!stack || !Array.isArray(stack) || stack.length === 0) return [];

  const h = stack.length;
  const dirs = [[-h, 0], [h, 0], [0, -h], [0, h]];
  const moves = [];

  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (isValidSquare(nr, nc)) {
      moves.push({ row: nr, col: nc });
    }
  }

  return moves;
}

function canPlayerMove(board, reserves, color) {
  if (reserves[color] > 0) {
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++)
        if (isValidSquare(r, c) && board[r][c] && Array.isArray(board[r][c]) && board[r][c].length === 0)
          return true;
  }

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const stack = board[r][c];
      if (stack && Array.isArray(stack) && stack.length > 0 && stack[stack.length - 1] === color) {
        if (getValidMoves(board, r, c).length > 0) return true;
      }
    }
  }

  return false;
}

function countPieces(board, color) {
  let n = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const s = board[r][c];
      if (s && Array.isArray(s))
        for (const p of s)
          if (p === color) n++;
    }
  return n;
}

function executeMove(board, fr, fc, tr, tc, player, reserves) {
  const moving = board[fr][fc];
  const dest = board[tr][tc];

  board[fr][fc] = [];

  const combined = (dest && Array.isArray(dest) ? [...dest] : []).concat(moving);

  while (combined.length > 5) {
    const removed = combined.shift();
    if (removed === player) reserves[player]++;
  }

  board[tr][tc] = combined;
}

function getGameState(game) {
  return {
    board: game.board,
    currentPlayer: game.currentPlayer,
    reserves: { ...game.reserves },
    remaining: {
      red: countPieces(game.board, 'red') + game.reserves.red,
      blue: countPieces(game.board, 'blue') + game.reserves.blue
    },
    gameOver: game.gameOver,
    winner: game.winner
  };
}

const rooms = {};

function findOrCreateRoom() {
  for (const [id, room] of Object.entries(rooms)) {
    if (room.players.length === 1 && !room.game) return id;
  }
  const id = Math.random().toString(36).substring(2, 8);
  rooms[id] = { id, players: [], game: null };
  return id;
}

function createGame() {
  return {
    board: createBoard(),
    currentPlayer: 'red',
    reserves: { red: 0, blue: 0 },
    gameOver: false,
    winner: null
  };
}

io.on('connection', (socket) => {
  console.log(`+ ${socket.id}`);

  let roomId = null;
  let color = null;

  socket.on('join', () => {
    roomId = findOrCreateRoom();
    const room = rooms[roomId];

    if (room.players.length === 0) {
      color = 'red';
    } else {
      color = 'blue';
    }

    room.players.push({ id: socket.id, color });
    socket.join(roomId);

    socket.emit('joined', { room: roomId, color });

    if (room.players.length === 2) {
      room.game = createGame();
      io.to(roomId).emit('game-state', getGameState(room.game));
    }

    if (room.players.length === 1) {
      socket.emit('waiting');
    }
  });

  socket.on('move', (data) => {
    if (!roomId || !rooms[roomId] || !rooms[roomId].game) return;
    const game = rooms[roomId].game;
    if (game.gameOver || game.currentPlayer !== color) {
      socket.emit('error', { message: 'Mossa non consentita' });
      return;
    }

    const { fromRow: fr, fromCol: fc, toRow: tr, toCol: tc } = data;
    const stack = game.board[fr] && game.board[fr][fc];

    if (!stack || !Array.isArray(stack) || stack.length === 0) {
      socket.emit('error', { message: 'Cella di partenza vuota' });
      return;
    }
    if (stack[stack.length - 1] !== color) {
      socket.emit('error', { message: 'Non controlli questa pila' });
      return;
    }

    const valid = getValidMoves(game.board, fr, fc);
    if (!valid.some(m => m.row === tr && m.col === tc)) {
      socket.emit('error', { message: 'Destinazione non valida' });
      return;
    }

    executeMove(game.board, fr, fc, tr, tc, color, game.reserves);

    const opponent = color === 'red' ? 'blue' : 'red';
    game.currentPlayer = opponent;

    if (!canPlayerMove(game.board, game.reserves, opponent)) {
      game.gameOver = true;
      game.winner = color;
    }

    io.to(roomId).emit('game-state', getGameState(game));
  });

  socket.on('place-reserve', (data) => {
    if (!roomId || !rooms[roomId] || !rooms[roomId].game) return;
    const game = rooms[roomId].game;
    if (game.gameOver || game.currentPlayer !== color) {
      socket.emit('error', { message: 'Non è il tuo turno' });
      return;
    }
    if (game.reserves[color] <= 0) {
      socket.emit('error', { message: 'Nessun pezzo in riserva' });
      return;
    }

    const { row: r, col: c } = data;
    if (!isValidSquare(r, c)) {
      socket.emit('error', { message: 'Posizione non valida' });
      return;
    }

    const dest = game.board[r][c];
    if (dest && Array.isArray(dest) && dest.length > 0) {
      socket.emit('error', { message: 'La cella non è vuota' });
      return;
    }

    game.board[r][c] = [color];
    game.reserves[color]--;

    const opponent = color === 'red' ? 'blue' : 'red';
    game.currentPlayer = opponent;

    if (!canPlayerMove(game.board, game.reserves, opponent)) {
      game.gameOver = true;
      game.winner = color;
    }

    io.to(roomId).emit('game-state', getGameState(game));
  });

  socket.on('disconnect', () => {
    console.log(`- ${socket.id}`);
    if (roomId && rooms[roomId]) {
      const other = rooms[roomId].players.find(p => p.id !== socket.id);
      if (other) {
        io.to(other.id).emit('opponent-disconnected');
      }
      delete rooms[roomId];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Focus server on :${PORT}`);
});
