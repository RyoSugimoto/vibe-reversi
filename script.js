const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const size = 8;
let currentPlayer = "black";
const cellSize = canvas.width / size;

// 盤面の初期化
const gameBoard = Array(size).fill(null).map(() => Array(size).fill(null));

// 初期配置
gameBoard[3][3] = "white";
gameBoard[3][4] = "black";
gameBoard[4][3] = "black";
gameBoard[4][4] = "white";

// 現在のターンを表示する関数
function updateCurrentPlayerDisplay() {
  const currentPlayerDisplay = document.getElementById("current-player");
  currentPlayerDisplay.textContent = `現在のターン: ${currentPlayer === "black" ? "黒" : "白"}`;
}

// スコアボードを更新
function updateScoreboard() {
  const blackCount = gameBoard.flat().filter(cell => cell === "black").length;
  const whiteCount = gameBoard.flat().filter(cell => cell === "white").length;
  document.getElementById("black-count").textContent = blackCount;
  document.getElementById("white-count").textContent = whiteCount;
}

// 有効なマスをハイライト
function highlightValidMoves() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景を暗い緑で塗りつぶす
  ctx.fillStyle = "#006400"; // Dark green color
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // グリッドを描画
  ctx.strokeStyle = "#000";
  for (let i = 0; i <= size; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, canvas.height);
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }

  // ハイライト有効なマス
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (gameBoard[row][col] === null && getFlippableDiscs(row, col, currentPlayer).length > 0) {
        ctx.fillStyle = "#32CD32"; // Light green color
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  // 石を描画
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (gameBoard[row][col]) {
        ctx.beginPath();
        ctx.arc(
          col * cellSize + cellSize / 2,
          row * cellSize + cellSize / 2,
          cellSize / 2 - 5,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = gameBoard[row][col] === "black" ? "black" : "white";
        ctx.fill();
      }
    }
  }

  updateScoreboard();
}

// 盤面を描画
function renderBoard() {
  highlightValidMoves();
}

// 石を置く処理
function handleMove(row, col) {
  if (gameBoard[row][col] !== null) return; // 既に石がある場合は無視

  const flipped = getFlippableDiscs(row, col, currentPlayer);
  if (flipped.length === 0) return; // 反転できる石がない場合は無視

  // 石を置く
  gameBoard[row][col] = currentPlayer;

  // 石を反転
  flipped.forEach(([r, c]) => {
    gameBoard[r][c] = currentPlayer;
  });

  // プレイヤー交代
  currentPlayer = currentPlayer === "black" ? "white" : "black";

  renderBoard();
  updateCurrentPlayerDisplay();
}

// 反転可能な石を取得
function getFlippableDiscs(row, col, player) {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1],
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];
  const opponent = player === "black" ? "white" : "black";
  const flippable = [];

  for (const [dx, dy] of directions) {
    let r = row + dx;
    let c = col + dy;
    const potentialFlips = [];

    while (r >= 0 && r < size && c >= 0 && c < size && gameBoard[r][c] === opponent) {
      potentialFlips.push([r, c]);
      r += dx;
      c += dy;
    }

    if (r >= 0 && r < size && c >= 0 && c < size && gameBoard[r][c] === player) {
      flippable.push(...potentialFlips);
    }
  }

  return flippable;
}

// 自動プレイ関連
let autoPlayInterval;

function startAutoPlay() {
  if (autoPlayInterval) return; // Prevent multiple intervals

  autoPlayInterval = setInterval(() => {
    const validMoves = [];
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (gameBoard[row][col] === null && getFlippableDiscs(row, col, currentPlayer).length > 0) {
          validMoves.push([row, col]);
        }
      }
    }

    if (validMoves.length === 0) {
      stopAutoPlay();
      alert("ゲーム終了: 引き分けです！");
      return;
    }

    const [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)];
    handleMove(row, col);

    // 勝利条件のチェック
    const blackCount = gameBoard.flat().filter(cell => cell === "black").length;
    const whiteCount = gameBoard.flat().filter(cell => cell === "white").length;
    if (blackCount + whiteCount === size * size || blackCount === 0 || whiteCount === 0) {
      stopAutoPlay();
      const winner = blackCount > whiteCount ? "黒" : "白";
      alert(`ゲーム終了: ${winner}の勝利です！`);
    }
  }, 1000); // Play every second
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
  autoPlayInterval = null;
}

document.getElementById("start-auto-play").addEventListener("click", startAutoPlay);
document.getElementById("stop-auto-play").addEventListener("click", stopAutoPlay);

// 初期描画
renderBoard();

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  handleMove(row, col);
});
