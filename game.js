const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const images = {
    dino: './dino.png',
    obstacle: './obstacle.png',
    star: './star.png',
    background: './background.png'
};

const loadedImages = {};
const constants = {
    GRAVITY: 0.6,
    JUMP_HEIGHT: -18,
    INITIAL_GAME_SPEED: 5,
    FRAME_TIME: 16.67
};

let dino = {
    x: 50,
    y: canvas.height - 80,
    width: 80,
    height: 80,
    dy: 0,
    grounded: false,
    invincible: false,
    jumpCount: 0, // 用于跟踪跳跃次数
};

let obstacles = [];
let score = 0;
let gameSpeed = constants.INITIAL_GAME_SPEED;
let gameOver = false;
let backgroundX = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
let energy = 100;
let isSprinting = false;

let lastTime = 0;
let obstacleTimer = 0;
let starTimer = 0;
let playerName = "";

function preloadImages() {
    const promises = Object.entries(images).map(([key, src]) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                loadedImages[key] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = src + '?v=' + Date.now();
        });
    });
    return Promise.all(promises);
}

function startGame() {
    playerName = document.getElementById('playerName').value || "Player";
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'block';
    resetGame();
    requestAnimationFrame(update);
}

function resetGame() {
    dino.y = canvas.height - 80;
    dino.dy = 0;
    dino.grounded = false;
    dino.invincible = false;
    dino.jumpCount = 0;
    obstacles = [];
    score = 0;
    gameSpeed = constants.INITIAL_GAME_SPEED;
    gameOver = false;
    obstacleTimer = 0;
    starTimer = 0;
    lives = 3;
    energy = 100;
    isSprinting = false;
    lastTime = 0;
    updateScoreDisplay();
}

function updateScoreDisplay() {
    document.getElementById('score').innerHTML = `Score: ${score} | High Score: ${highScore} | Lives: ${lives}`;
}

function jump() {
    if (dino.grounded || dino.jumpCount < 2) {
        dino.dy = constants.JUMP_HEIGHT;
        dino.grounded = false;
        dino.jumpCount++;
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
        width: 60,
        height: 60,
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
    ctx.fillRect(canvas.width - 210, 10, 200, 20);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
    ctx.fillRect(canvas.width - 210, 10, energy * 2, 20);
}

function specialMechanism() {
    dino.invincible = true;
    setTimeout(() => dino.invincible = false, 5000);
}

function restartGame() {
    resetGame();
    document.getElementById('gameOver').style.display = 'none';
    requestAnimationFrame(update);
}

function update(currentTime) {
    if (gameOver) return;

    const deltaTime = (currentTime - lastTime) / constants.FRAME_TIME;
    lastTime = currentTime;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    backgroundX -= gameSpeed / 2 * deltaTime;
    if (backgroundX <= -canvas.width) backgroundX = 0;
    ctx.drawImage(loadedImages.background, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImages.background, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    dino.dy += constants.GRAVITY * deltaTime;
    dino.y += dino.dy * deltaTime;

    if (dino.y + dino.height >= canvas.height) {
        dino.y = canvas.height - dino.height;
        dino.dy = 0;
        dino.grounded = true;
        dino.jumpCount = 0;
    }

    ctx.drawImage(loadedImages.dino, dino.x, dino.y, dino.width, dino.height);

    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= gameSpeed * (isSprinting ? 1.5 : 1) * deltaTime;

        if (obstacle.type === 'star') {
            ctx.drawImage(loadedImages.star, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
            ctx.drawImage(loadedImages.obstacle, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
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
                    updateScoreDisplay();
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

    obstacleTimer += deltaTime;
    if (obstacleTimer > 120 / (gameSpeed / constants.INITIAL_GAME_SPEED)) {
        createObstacle();
        obstacleTimer = 0;
    }

    starTimer += deltaTime;
    if (starTimer > 600) {
        createStar();
        starTimer = 0;
    }

    score++;
    updateScoreDisplay();

    gameSpeed = constants.INITIAL_GAME_SPEED + Math.floor(score / 500) * 0.5;

    if (isSprinting) {
        energy = Math.max(0, energy - 1 * deltaTime);
        if (energy === 0) isSprinting = false;
    } else {
        energy = Math.min(100, energy + 0.2 * deltaTime);
    }

    drawEnergyBar();

    requestAnimationFrame(update);
}

preloadImages().then(() => {
    document.getElementById('startScreen').style.display = 'block';
}).catch(err => {
    console.error("Failed to preload images:", err);
});
