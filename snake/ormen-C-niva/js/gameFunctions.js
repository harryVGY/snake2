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
    placeObstacles(10); // Placera 10 hinder på banan
    score = 0;
    updateCanvas();
}

// Returnerar en slumpmässig fruktbild
function randomizeFruit() {
    const randomIndex = Math.floor(Math.random() * foodImages.length);
    return foodImages[randomIndex];
}
// Kontrollerar om en position ligger på ormen
function isPositionOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Placerar maten på en position som inte är på ormen eller hinder
function placeFood() {
    let newX, newY;
    do {
        newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
        newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;
    } while (isPositionOnSnake(newX, newY) || isPositionOnObstacle(newX, newY));

    food.x = newX;
    food.y = newY;
    food.image = randomizeFruit();
}

// Uppdaterar canvas med aktuell spelstatus
function updateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawgrid();
    drawObstacles(); // Lägg till denna rad för att rita hindren
    drawSnake();
    drawFood();
    document.getElementById('score').innerText = `Score: ${score}`;
}

// Ritar ormen med mörkgrönt huvud och grön kropp
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'darkgreen': 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

function drawgrid() {
    ctx.fillStyle = 'lightgray';
    for (let i = 0; i < canvasWidth; i += gridSize) {
        ctx.fillRect(i, 0, 1, canvasHeight);
    }
    for (let i = 0; i < canvasHeight; i += gridSize) {
        ctx.fillRect(0, i, canvasWidth, 1);
    }
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


// Add this function to handle pausing and resuming the game
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').innerText = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        // Pause the game
        clearInterval(gameInterval);
        gameInterval = null;

        // Draw pause overlay
        drawPauseOverlay();
    } else {
        // Resume the game
        if (!gameInterval) {
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }
}

// paus meddelande
function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', canvasWidth / 2, canvasHeight / 2);
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
        case 'Escape':
            if (typeof isPaused !== 'undefined') {
                togglePause();
            }
            break;
    }
}
// Hanterar Game Over
function gameOver(reason = '') {
    clearInterval(gameInterval);
    gameInterval = null;

    const messageDiv = document.getElementById('gameMessage');

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

// Flyttar ormen i vald riktning och hanterar mat
function moveSnake() {
    const head = { ...snake[0] };  // Kopierar nuvarande huvud

    // Flyttar huvudet i vald riktning
    switch (direction) {
        case 'up': head.y -= gridSize; break;
        case 'down': head.y += gridSize; break;
        case 'left': head.x -= gridSize; break;
        case 'right': head.x += gridSize; break;
    }

    // Kontrollera kollision med väggar
    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
        gameOver('Hit the wall');
        return;
    }

    // Kontrollera kollision med sig själv
    if (isPositionOnSnake(head.x, head.y)) {
        gameOver('Hit yourself');
        return;
    }

    // Kontrollera kollision med hinder
    if (isPositionOnObstacle(head.x, head.y)) {
        gameOver('Hit an obstacle');
        return;
    }

    snake.unshift(head);  // Lägger till nytt huvud i början

    // Om ormen äter mat: öka poäng och placera ny mat
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();  // Tar bort svansen om ingen mat äts
    }
}
// Kontrollerar om en position ligger på ett hinder
function isPositionOnObstacle(x, y) {
    return obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
}

// Placerar hinder på banan (ej på ormen, maten eller andra hinder)
function placeObstacles(count = 10) {
    // Rensa befintliga hinder
    obstacles = [];

    // Placera nya hinder
    for (let i = 0; i < count; i++) {
        let newX, newY;
        let validPosition = false;

        // Försök hitta en giltig position
        let attempts = 0;
        while (!validPosition && attempts < 100) {
            newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
            newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

            // Kontrollera om positionen är giltig (inte på ormen, maten eller annat hinder)
            validPosition = !isPositionOnSnake(newX, newY) &&
                            !(food.x === newX && food.y === newY) &&
                            !isPositionOnObstacle(newX, newY);

            attempts++;
        }

        if (validPosition) {
            // Lägg till nytt hinder
            obstacles.push({ x: newX, y: newY });
        }
    }
}

// Rita hindren på spelplanen
function drawObstacles() {
    ctx.fillStyle = '#8B4513'; // Brun färg för hinder
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);

        // Lägg till en textur på hindren
        ctx.strokeStyle = '#663300';
        ctx.lineWidth = 1;
        ctx.strokeRect(obstacle.x, obstacle.y, gridSize, gridSize);

        // Rita några linjer för att simulera trätextur
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y);
        ctx.lineTo(obstacle.x + gridSize, obstacle.y + gridSize);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(obstacle.x + gridSize, obstacle.y);
        ctx.lineTo(obstacle.x, obstacle.y + gridSize);
        ctx.stroke();
    });
}


// Spelets huvudloop
function gameLoop() {
    direction = nextDirection;
    moveSnake();
    updateCanvas();
}