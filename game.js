const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dinoImg = new Image();
dinoImg.src = 'dino.png'; // 替換為恐龍圖片

const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png'; // 替換為障礙物圖片

let dino = {
  x: 50,
  y: 150,
  width: 20,
  height: 20,
  dy: 0,
  jumpHeight: -7,
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
      ctx.fillStyle = "red";
      ctx.font = "40px Arial";
      ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2);
      ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 50);
      return;
    }
  }

  score++;
  ctx.fillStyle = "black";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 20);

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

function createObstacle() {
  let obstacle = {
    x: canvas.width,
    y: canvas.height - 20 - Math.random() * 50,
    width: 20,
    height: 20 + Math.random() * 30,
  };
  obstacles.push(obstacle);
}

function createStar() {
  let star = {
    x: canvas.width,
    y: canvas.height - 40,
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

setInterval(createObstacle, 2000);
setInterval(createStar, 10000); // 每10秒創建一顆無敵星星
update();
