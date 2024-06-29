const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let dino = {
  x: 50,
  y: 150,
  width: 20,
  height: 20,
  dy: 0,
  jumpHeight: -7,
  gravity: 0.5,
  grounded: false,
};

let obstacles = [];
let score = 0;
let gameSpeed = 3;

function update() {
  // 清除畫布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 更新恐龍位置
  dino.dy += dino.gravity;
  dino.y += dino.dy;

  // 檢查是否著地
  if (dino.y + dino.height >= canvas.height) {
    dino.y = canvas.height - dino.height;
    dino.dy = 0;
    dino.grounded = true;
  }

  // 繪製恐龍
  ctx.fillStyle = "black";
  ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

  // 更新障礙物位置和繪製
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].x -= gameSpeed;
    ctx.fillStyle = "red";
    ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].width, obstacles[i].height);
  }

  // 更新分數
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
    y: canvas.height - 20,
    width: 20,
    height: 20,
  };
  obstacles.push(obstacle);
}

setInterval(createObstacle, 2000);
update();
