const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartBtn = document.getElementById('restartBtn');

const playerImg = new Image();
playerImg.src = 'https://i.postimg.cc/vZfj2rsR/Spray-Bottle.png';
const flyImg = new Image();
flyImg.src = 'https://i.postimg.cc/zfkQ8qv0/Fly.png';
const backgroundStart = new Image();
backgroundStart.src = 'https://i.postimg.cc/tgbcKsqs/Startscherm.png';
const backgroundGame = new Image();
backgroundGame.src = 'https://i.postimg.cc/VL3pF72B/Background-Game.png';

let gameStarted = false;
let gameOver = false;
let level = 1;
let score = 0;
let flies = [];
let sprayActive = false;
let sprayDuration = 0;
let keys = {};
let message = '';
let messageTimer = 0;
let flyTimer = 0;
let spawnDelay = 3000;
let transitionToLevel2 = false;
let levelTransitionTimer = 0;
let sprayHeight = 80;

const player = {
  x: 375,
  y: 500,
  width: 50,
  height: 100,
  speed: 5
};

function resetGame() {
  gameOver = false;
  gameStarted = true;
  level = 1;
  score = 0;
  flies = [];
  sprayActive = false;
  sprayDuration = 0;
  message = '';
  messageTimer = 0;
  flyTimer = 0;
  spawnDelay = 3000;
  transitionToLevel2 = false;
  levelTransitionTimer = 0;
  player.x = 375;
  restartBtn.style.display = 'none';
}

function drawStartScreen() {
  ctx.drawImage(backgroundStart, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.fillText('Klik om te starten', 300, 550);
}

function drawBackground() {
  ctx.drawImage(backgroundGame, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawFlies() {
  flies.forEach(fly => {
    ctx.drawImage(flyImg, fly.x, fly.y, fly.size, fly.size);
  });
}

function drawSpray() {
  if (sprayDuration > 0) {
    ctx.fillStyle = 'rgba(173,216,230,0.5)';
    ctx.fillRect(player.x + player.width / 2 - 5, player.y - sprayHeight, 10, sprayHeight);
    sprayDuration--;
    sprayActive = true;
  } else {
    sprayActive = false;
  }
}

function drawUI() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(200, 200, 400, 200);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over!', 320, 270);
    ctx.fillText('Score: ' + score, 330, 310);
    restartBtn.style.display = 'block';
  }

  if (message && messageTimer > 0) {
    ctx.fillStyle = 'red';
    ctx.font = 'bold 28px "Gloomie Saturday", cursive';
    ctx.fillText(message, 200, 100);
  }
}

function spawnFly() {
  const size = 40;
  const speed = level === 1 ? 1 : 3;
  const x = Math.random() * (canvas.width - size);
  flies.push({ x, y: 0, size, speed });
}

function updateFlies() {
  flies.forEach((fly, index) => {
    fly.y += fly.speed;

    const sprayBox = {
      x: player.x + player.width / 2 - 5,
      y: player.y - sprayHeight,
      width: 10,
      height: sprayHeight
    };

    if (
      sprayActive &&
      fly.x < sprayBox.x + sprayBox.width &&
      fly.x + fly.size > sprayBox.x &&
      fly.y < sprayBox.y + sprayBox.height &&
      fly.y + fly.size > sprayBox.y
    ) {
      flies.splice(index, 1);
      score++;

      if (score === 10 && level === 1 && !transitionToLevel2) {
        message = 'LEVEL 2 KOMT ERAAN!';
        messageTimer = 100;
        transitionToLevel2 = true;
        levelTransitionTimer = 100;
      } else if (score === 20) {
        gameOver = true;
      }
    } else if (fly.y > canvas.height) {
      gameOver = true;
    }
  });
}

function updatePlayer() {
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
}

function gameLoop() {
  if (!gameStarted) {
    drawStartScreen();
    requestAnimationFrame(gameLoop);
    return;
  }

  drawBackground();
  updatePlayer();
  updateFlies();
  drawPlayer();
  drawFlies();
  drawSpray();
  drawUI();

  if (!gameOver) {
    flyTimer++;
    if (flyTimer > spawnDelay / 16) {
      spawnFly();
      flyTimer = 0;
    }
  }

  if (messageTimer > 0) {
    messageTimer--;
  } else {
    message = '';
  }

  if (transitionToLevel2 && levelTransitionTimer > 0) {
    levelTransitionTimer--;
    if (levelTransitionTimer === 0) {
      level = 2;
      spawnDelay = 2000;
      transitionToLevel2 = false;
      message = 'LEVEL 2!';
      messageTimer = 100;
    }
  }

  requestAnimationFrame(gameLoop);
}

// Klik op canvas start spel
canvas.addEventListener('click', () => {
  if (!gameStarted) {
    gameStarted = true;
  }
});

// Start spel opnieuw via knop
restartBtn.addEventListener('click', () => {
  resetGame();
});

// Spray en beweging
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && sprayDuration === 0) {
    sprayDuration = 10;
  }
  keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

gameLoop();