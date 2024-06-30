const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dinoImg = new Image();
dinoImg.src = 'dino.png'; // 替換為恐龍圖片

const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png'; // 替換為障礙物圖片

let dino = {
  x: 50,
  y: 150,
  width: 400, // 增加寬度
  height: 400, // 增加高度
  dy: 0,
  jumpHeight: -12, // 增加跳躍高度
  gravity: 0.5,
  grounded: false,
  invincible: false,
};

let obstacles = [];
let score = 0;
let gameSpeed = 3;
let gameOver = false;

function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  dino.dy += dino.gravity;
  dino.y += dino.dy;

  if (dino.y + dino.height >= canvas.height) {
    dino.y = canvas.height - dino.height;
    dino.dy = 0;
    dino.grounded = true;
  }

  ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= gameSpeed;
    ctx.drawImage(obstacleImg, obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);

    if (dino.invincible) continue;

    if (
      dino.x < obstacles[i].x + obstacles[i].width &&
      dino.x + dino.width > obstacles[i].x &&
      dino.y < obstacles[i].y + obstacles[i].height &&
      dino.y + dino.height > obstacles[i].y
    ) {
      gameOver = true;
      document.getElementById('gameOver').style.display = 'block';
      document.getElementById('score').innerHTML = `Score: ${score}`;
      return;
    }
  }

  score++;
  document.getElementById('score').innerHTML = `Score: ${score}`;

  requestAnimationFrame(update);
}

function jump() {
  if (dino.grounded) {
    dino.dy = dino.jumpHeight;
    dino.grounded = false;
  }
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    jump();
  }
});

document.addEventListener("touchstart", function () {
  jump();
});

function createObstacle() {
  let obstacle = {
    x: canvas.width,
    y: canvas.height - 40 - Math.random() * 50, // 增加障礙物高度
    width: 400,
    height: 400 + Math.random() * 30,
  };
  obstacles.push(obstacle);
}

function createStar() {
  let star = {
    x: canvas.width,
    y: canvas.height - 60,
    width: 20,
    height: 20,
    type: 'star'
  };
  obstacles.push(star);
}

function specialMechanism() {
  dino.invincible = true;
  setTimeout(() => dino.invincible = false, 5000);
}

function restartGame() {
  dino.y = 150;
  dino.dy = 0;
  dino.grounded = false;
  obstacles = [];
  score = 0;
  gameOver = false;
  document.getElementById('gameOver').style.display = 'none';
  update();
}

setInterval(createObstacle, 2000);
setInterval(createStar, 10000); // 每10秒創建一顆無敵星星
update();
