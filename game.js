const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// 加載圖片
const dinoImg = new Image();
dinoImg.src = 'dino.png';

const obstacleImg = new Image();
obstacleImg.src = 'obstacle.png';

const starImg = new Image();
starImg.src = 'star.png';

const backgroundImg = new Image();
backgroundImg.src = 'background.png';

let dino = {
    x: 50,
    y: canvas.height - 60,
    width: 100,
    height: 100,
    dy: 0,
    jumpHeight: -18,
    gravity: 0.6,
    grounded: false,
    invincible: false,
};

let obstacles = [];
let score = 0;
let gameSpeed = 5;
let gameOver = false;
let backgroundX = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let energy = 100;
let isSprinting = false;

let lastTime = 0;
let obstacleTimer = 0;
let starTimer = 0;

function update(currentTime) {
    if (gameOver) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 移動背景
    backgroundX -= gameSpeed / 2;
    if (backgroundX <= -canvas.width) backgroundX = 0;
    ctx.drawImage(backgroundImg, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImg, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    // 更新恐龍位置
    dino.dy += dino.gravity;
    dino.y += dino.dy;

    if (dino.y + dino.height >= canvas.height) {
        dino.y = canvas.height - dino.height;
        dino.dy = 0;
        dino.grounded = true;
    }

    ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);

    // 更新障礙物
    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= gameSpeed * (isSprinting ? 1.5 : 1);

        if (obstacle.type === 'star') {
            ctx.drawImage(starImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
            ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }

        if (dino.invincible) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        } else if (
            dino.x < obstacle.x + obstacle.width &&
            dino.x + dino.width > obstacle.x &&
            dino.y < obstacle.y + obstacle.height &&
            dino.y + dino.height > obstacle.y
        ) {
            if (obstacle.type === 'star') {
                specialMechanism();
                return false;
            } else {
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    document.getElementById('gameOver').style.display = 'block';
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                    }
                    document.getElementById('score').innerHTML = `Score: ${score} | High Score: ${highScore}`;
                    return false;
                } else {
                    dino.invincible = true;
                    setTimeout(() => dino.invincible = false, 2000);
                    return false;
                }
            }
        }

        if (obstacle.x + obstacle.width < 0) {
            score++;
            return false;
        }

        return true;
    });

    // 生成新障礙物
    obstacleTimer += deltaTime;
    if (obstacleTimer > 2000 / (gameSpeed / 5)) {
        createObstacle();
        obstacleTimer = 0;
    }

    // 生成新星星
    starTimer += deltaTime;
    if (starTimer > 10000) {
        createStar();
        starTimer = 0;
    }

    score++;
    document.getElementById('score').innerHTML = `Score: ${score} | High Score: ${highScore} | Lives: ${lives}`;

    // 增加難度
    gameSpeed = 5 + Math.floor(score / 500) * 0.5;

    // 更新能量條
    if (isSprinting) {
        energy = Math.max(0, energy - 1);
        if (energy === 0) isSprinting = false;
    } else {
        energy = Math.min(100, energy + 0.2);
    }
    
    drawEnergyBar();

    requestAnimationFrame(update);
}

function jump() {
    if (dino.grounded) {
        dino.dy = dino.jumpHeight;
        dino.grounded = false;
    }
}

function sprint() {
    if (energy > 0) {
        isSprinting = true;
    }
}

function stopSprint() {
    isSprinting = false;
}

document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        jump();
    } else if (event.code === "ShiftLeft") {
        sprint();
    }
});

document.addEventListener("keyup", function (event) {
    if (event.code === "ShiftLeft") {
        stopSprint();
    }
});

document.addEventListener("touchstart", function () {
    jump();
});

function createObstacle() {
    let obstacleType = Math.random() < 0.3 ? 'flying' : 'ground';
    let obstacle = {
        x: canvas.width,
        y: obstacleType === 'flying' ? canvas.height - 150 - Math.random() * 100 : canvas.height - 50 - Math.random() * 50,
        width: 100,
        height: 50 + Math.random() * 30,
        type: 'obstacle',
        obstacleType: obstacleType
    };
    obstacles.push(obstacle);
}

function createStar() {
    let star = {
        x: canvas.width,
        y: Math.random() * (canvas.height - 100),
        width: 40,
        height: 40,
        type: 'star'
    };
    obstacles.push(star);
}

function drawEnergyBar() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 20);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.fillRect(10, 10, energy * 2, 20);
}

function specialMechanism() {
    dino.invincible = true;
    setTimeout(() => dino.invincible = false, 5000);
}

function restartGame() {
    dino.y = canvas.height - 60;
    dino.dy = 0;
    dino.grounded = false;
    dino.invincible = false;
    obstacles = [];
    score = 0;
    gameSpeed = 5;
    gameOver = false;
    obstacleTimer = 0;
    starTimer = 0;
    lives = 3;
    energy = 100;
    isSprinting = false;
    document.getElementById('gameOver').style.display = 'none';
    requestAnimationFrame(update);
}

// 在加載所有圖片後開始遊戲
Promise.all([
    new Promise(resolve => dinoImg.onload = resolve),
    new Promise(resolve => obstacleImg.onload = resolve),
    new Promise(resolve => starImg.onload = resolve),
    new Promise(resolve => backgroundImg.onload = resolve)
]).then(() => {
    console.log("All images loaded");
    requestAnimationFrame(update);
}).catch(error => {
    console.error("Error loading images:", error);
});
