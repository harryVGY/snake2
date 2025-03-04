// Spelinitiering
function initGame() {
    // Hide the game over message
    document.getElementById('gameMessage').style.display = 'none';
    
    snake = [];
    // Återställ riktningsvariablerna till startläge
    // för att fixa bugg där du dör direkt om du startar om spelet
    // utan att refresha sidan.
    direction = 'right';
    nextDirection = 'right';

    const startX = Math.floor(canvasWidth / (2 * gridSize)) * gridSize;
    const startY = Math.floor(canvasHeight / (2 * gridSize)) * gridSize;
    for (let i = 0; i < initialSnakeLength; i++) {
        snake.push({ x: startX - i * gridSize, y: startY });
    }
    placeFood();
    score = 0;
    updateCanvas();
}

// Kontrollerar om en position ligger på ormen
function isPositionOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Placerar maten på en position som inte är på ormen
function placeFood() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
        newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;
    } while (isPositionOnSnake(newX, newY));

    food.x = newX;
    food.y = newY;
    food.image = randomizeFruit();
}

// Uppdaterar canvas med aktuell spelstatus
function updateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawSnake();
    drawFood();
    document.getElementById('score').innerText = `Score: ${score}`;
}

// Ritar ormen med mörkgrönt huvud och grön kropp
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'darkgreen' : 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

// Ritar maten med bild eller en röd fallback-fyrkant
function drawFood() {
    try {
        if (food.image && food.image.complete && food.image.naturalWidth !== 0) {
            ctx.drawImage(food.image, food.x, food.y, gridSize, gridSize);
        } else {
            // Lägg till en border
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(food.x + 2, food.y + 2, gridSize - 4, gridSize - 4);
        }
    } catch (error) {
        console.error("Error drawing food:", error);
    }
}

// Hanterar tangenttryckningar för att ändra riktning
function changeDirection(event) {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'left') nextDirection = 'right';
            break;
    }
}


// Flyttar ormen och kontrollerar kollisioner
function moveSnake() {
    const head = { ...snake[0] };
    switch (direction) {
        case 'up':
            head.y -= gridSize;
            break;
        case 'down':
            head.y += gridSize;
            break;
        case 'left':
            head.x -= gridSize;
            break;
        case 'right':
            head.x += gridSize;
            break;
    }

    // Kontrollera kollision med kanterna
    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
        let deathReason = 'Hit the wall';
        gameOver(deathReason);
        return;
    }

// Kontrollera kollision med sig själv (börja på index 1 för att undvika huvudet)
for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
        let deathReason = 'Hit yourself';
        gameOver(deathReason);
        return;
    }
}

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
}
// Hanterar Game Over
function gameOver(reason = '') {
    clearInterval(gameInterval);
    gameInterval = null;

    // Get the message div
    const messageDiv = document.getElementById('gameMessage');
    
    // Create the HTML content for the game over message
    messageDiv.innerHTML = `
        <h2>Game Over</h2>
        <p>Final Score: ${score}</p>
        ${reason ? `<p>Reason: ${reason}</p>` : ''}
        <p>Click Start to play again</p>
    `;
    
    // Show the message div
    messageDiv.style.display = 'block';
    
    // Update button states
    document.getElementById('startBtn').innerText = 'Start';
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').innerText = 'Pause';

    // Reset pause state
    if (typeof isPaused !== 'undefined') {
        isPaused = false;
    }
}


// Spelets huvudloop
function gameLoop() {
    direction = nextDirection;
    moveSnake();
    updateCanvas();
}