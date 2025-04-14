const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');
const resetScoreButton = document.getElementById('reset-score');
const modeSelect = document.getElementById('mode');
const difficultySelect = document.getElementById('difficulty');
const difficultyContainer = document.getElementById('difficulty-container');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');

let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let isVsComputer = true;
let difficulty = 'easy';
let scores = { X: 0, O: 0 };

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function startGame() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('win');
    cell.removeEventListener('click', handleClick);
    cell.addEventListener('click', handleClick, { once: true });
  });

  gameBoard = ['', '', '', '', '', '', '', '', ''];
  gameActive = true;
  currentPlayer = 'X';
  isVsComputer = modeSelect.value === 'computer';
  difficulty = difficultySelect.value;
  difficultyContainer.style.display = isVsComputer ? 'block' : 'none';
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function resetScore() {
  scores.X = 0;
  scores.O = 0;
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
}

function handleClick(e) {
  const index = e.target.getAttribute('data-index');

  if (!gameActive || gameBoard[index] !== '') return;

  makeMove(index, currentPlayer);

  if (!gameActive || !isVsComputer) return;

  setTimeout(() => {
    computerMove();
  }, 500);
}

function makeMove(index, player) {
  gameBoard[index] = player;
  cells[index].textContent = player;

  if (checkWin(player)) {
    statusText.textContent = `🎉 Player ${player} wins! 🎉`;
    highlightWinningCells(player);
    updateScore(player);
    gameActive = false;
    return;
  }

  if (gameBoard.every(cell => cell !== '')) {
    statusText.textContent = "🤝 It's a draw! Well played!";
    gameActive = false;
    return;
  }

  currentPlayer = player === 'X' ? 'O' : 'X';
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

function updateScore(player) {
  scores[player]++;
  scoreX.textContent = scores.X;
  scoreO.textContent = scores.O;
  const scoreElement = player === 'X' ? scoreX : scoreO;
  scoreElement.parentElement.classList.add('updated');
  setTimeout(() => scoreElement.parentElement.classList.remove('updated'), 500);
}

function computerMove() {
  if (!gameActive) return;

  let move;
  if (difficulty === 'hard') {
    move = getBestMove();
  } else {
    const emptyIndices = gameBoard
      .map((val, idx) => (val === '' ? idx : null))
      .filter(idx => idx !== null);
    move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (move !== undefined) {
    makeMove(move, 'O');
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < gameBoard.length; i++) {
    if (gameBoard[i] === '') {
      gameBoard[i] = 'O';
      let score = minimax(gameBoard, 0, false);
      gameBoard[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(board, depth, isMaximizing) {
  if (checkWin('O')) return 10 - depth;
  if (checkWin('X')) return depth - 10;
  if (board.every(cell => cell !== '')) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === '') {
        board[i] = 'X';
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function checkWin(player) {
  return winningCombos.some(combo => {
    return combo.every(index => gameBoard[index] === player);
  });
}

function highlightWinningCells(player) {
  winningCombos.forEach(combo => {
    if (combo.every(index => gameBoard[index] === player)) {
      combo.forEach(index => {
        cells[index].classList.add('win');
      });
    }
  });
}

resetButton.addEventListener('click', startGame);
resetScoreButton.addEventListener('click', resetScore);
modeSelect.addEventListener('change', startGame);
difficultySelect.addEventListener('change', startGame);
startGame();