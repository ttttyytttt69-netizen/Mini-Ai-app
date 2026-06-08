const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const startBtn = document.getElementById('startBtn');

const gridSize = 20; 
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 0, y: 0 };
let dx = gridSize; 
let dy = 0;        
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

let gameInterval;
let isPaused = false;
let isGameOver = false;
let gameStarted = false;

highScoreEl.textContent = highScore;

function initGame() {
    snake = [
        { x: gridSize * 5, y: gridSize * 5 },
        { x: gridSize * 4, y: gridSize * 5 },
        { x: gridSize * 3, y: gridSize * 5 }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreEl.textContent = score;
    isGameOver = false;
    isPaused = false;
    gameStarted = true;
    
    overlay.classList.add('hidden');
    spawnFood();
    
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 90); 
}

function spawnFood() {
    food.x = Math.floor(Math.random() * tileCount) * gridSize;
    food.y = Math.floor(Math.random() * tileCount) * gridSize;

    snake.forEach(part => {
        const hasCollision = part.x === food.x && part.y === food.y;
        if (hasCollision) spawnFood();
    });
}

function update() {
    if (isPaused || isGameOver) return;

    clearCanvas();
    moveSnake();
    checkCollision();
    drawFood();
    drawSnake();
}

function clearCanvas() {
    ctx.fillStyle = '#0d0b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ปรับปรุงการวาดตัวงูให้มีมิติและส่วนโค้งมนมน
function drawSnake() {
    snake.forEach((part, index) => {
        if (index === 0) {
            // หัวงูสี Neon Cyan ผิวเรืองแสง
            ctx.fillStyle = '#00ffcc';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00ffcc';
        } else {
            // ลำตัวไล่เฉดไปทางสีน้ำเงิน Cyan อ่อนลงเรื่อยๆ
            ctx.fillStyle = `rgba(0, 210, 255, ${1 - (index / snake.length) * 0.6})`;
            ctx.shadowBlur = 0; // ลดความฟุ้งที่ตัวไม่ให้แสบตาเกินไป
        }
        
        // วาดเป็นสี่เหลี่ยมมุมมน (Rounded Rect)
        const radius = index === 0 ? 6 : 4;
        ctx.beginPath();
        ctx.roundRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2, radius);
        ctx.fill();
    });
    // ล้างค่า shadow หลังวาดงูเสร็จ เพื่อไม่ให้กระทบส่วนอื่น
    ctx.shadowBlur = 0;
}

// ปรับปรุงอาหารให้เป็นผลไม้เรืองแสงสีชมพูนีออน (Neon Pink)
function drawFood() {
    ctx.fillStyle = '#ff007f';
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ff007f';
    
    ctx.beginPath();
    ctx.arc(food.x + gridSize/2, food.y + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // ล้างค่า shadow
    ctx.shadowBlur = 0;
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const hasEatenFood = snake[0].x === food.x && snake[0].y === food.y;
    if (hasEatenFood) {
        score += 10;
        scoreEl.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            highScoreEl.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        spawnFood();
    } else {
        snake.pop(); 
    }
}

function checkCollision() {
    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x >= canvas.width;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y >= canvas.height;

    if (hitLeftWall || hitRightWall || hitTopWall || hitBottomWall) {
        gameOver();
    }

    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameOver();
        }
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    overlayTitle.innerHTML = `<span id="game-over-text">GAME OVER</span><br><span style="font-size:1rem; color:#8b869c; font-family:'Orbitron'; font-weight:normal; display:block; margin-top:15px; letter-spacing:1px;">SCORE: ${score}</span>`;
    startBtn.textContent = 'TRY AGAIN';
    overlay.classList.remove('hidden');
}

function handleKeyDown(event) {
    const keyPressed = event.keyCode;
    
    const goingUp = dy === -gridSize;
    const goingDown = dy === gridSize;
    const goingRight = dx === gridSize;
    const goingLeft = dx === -gridSize;

    if ((keyPressed === 37 || keyPressed === 65) && !goingRight) { 
        dx = -gridSize; dy = 0;
    }
    if ((keyPressed === 38 || keyPressed === 87) && !goingDown) { 
        dx = 0; dy = -gridSize;
    }
    if ((keyPressed === 39 || keyPressed === 68) && !goingLeft) { 
        dx = gridSize; dy = 0;
    }
    if ((keyPressed === 40 || keyPressed === 83) && !goingUp) { 
        dx = 0; dy = gridSize;
    }

    if (keyPressed === 32 && gameStarted && !isGameOver) {
        event.preventDefault(); 
        isPaused = !isPaused;
        if (isPaused) {
            overlayTitle.textContent = 'PAUSED';
            startBtn.textContent = 'RESUME';
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }
}

window.addEventListener('keydown', handleKeyDown);
startBtn.addEventListener('click', () => {
    if (isPaused) {
        isPaused = false;
        overlay.classList.add('hidden');
    } else {
        initGame();
    }
});

clearCanvas();