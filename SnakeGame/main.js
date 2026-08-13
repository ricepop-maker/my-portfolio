const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const overlay = document.getElementById('overlay');
const overlayMessage = document.getElementById('overlayMessage');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const difficultySelect = document.getElementById('difficulty');

const GRID_SIZE = 20;
const CELL_SIZE = canvas.width / GRID_SIZE;
const LEVEL_UP_SCORE = 50;
const LEVEL_SPEEDUP_MS = 10;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let level = 1;
let tickMs = 150;
let highScore = Number(localStorage.getItem('snakeHighScore')) || 0;
let loopId = null;
let gameActive = false;
let isPaused = false;

highScoreEl.textContent = highScore;

function startInterval(ms) {
  if (loopId) clearInterval(loopId);
  loopId = setInterval(tick, ms);
}

function resetState() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  tickMs = Number(difficultySelect.value);
  scoreEl.textContent = score;
  levelEl.textContent = level;
  placeFood();
}

function placeFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y));
  food = position;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 먹이 그리기
  ctx.fillStyle = '#e74c3c';
  ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

  // 뱀 그리기
  ctx.fillStyle = '#667eea';
  snake.forEach((segment) => {
    ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
  });
}

function updateLevel() {
  const newLevel = Math.floor(score / LEVEL_UP_SCORE) + 1;

  if (newLevel > level) {
    level = newLevel;
    tickMs = Math.max(20, tickMs - LEVEL_SPEEDUP_MS);
    levelEl.textContent = level;
    startInterval(tickMs);
  }
}

function tick() {
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall = head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
  const hitSelf = snake.some((segment) => segment.x === head.x && segment.y === head.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    placeFood();
    updateLevel();
  } else {
    snake.pop();
  }

  draw();
}

function startGame() {
  resetState();
  overlay.classList.add('hidden');
  gameActive = true;
  isPaused = false;
  difficultySelect.disabled = true;
  pauseBtn.disabled = false;
  pauseBtn.textContent = '일시정지';
  draw();
  startInterval(tickMs);
}

function gameOver() {
  clearInterval(loopId);
  loopId = null;
  gameActive = false;
  isPaused = false;
  difficultySelect.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = '일시정지';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('snakeHighScore', String(highScore));
    highScoreEl.textContent = highScore;
  }

  overlayMessage.textContent = `게임 오버 (점수: ${score})`;
  startBtn.textContent = '다시 시작';
  overlay.classList.remove('hidden');
}

function togglePause() {
  if (!gameActive) return;

  if (isPaused) {
    isPaused = false;
    pauseBtn.textContent = '일시정지';
    startInterval(tickMs);
  } else {
    isPaused = true;
    pauseBtn.textContent = '재개';
    clearInterval(loopId);
    loopId = null;
  }
}

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);

document.addEventListener('keydown', (event) => {
  if (!loopId) return;

  switch (event.key) {
    case 'ArrowUp':
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      event.preventDefault();
      break;
    case 'ArrowDown':
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      event.preventDefault();
      break;
    case 'ArrowLeft':
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      event.preventDefault();
      break;
    case 'ArrowRight':
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      event.preventDefault();
      break;
  }
});
