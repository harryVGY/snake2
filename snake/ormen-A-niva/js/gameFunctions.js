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

// Kontrollerar om en position ligger på ormen
function isPositionOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Placerar maten på en position som inte är på ormen eller hinder
function placeFood() {
    // Clear existing food array
    food = [];
    console.log("Placing food, count:", foodCount);

    // Add the specified number of food items
    for (let i = 0; i < foodCount; i++) {
        let newX, newY;
        let validPosition = false;
        let attempts = 0;

        while (!validPosition && attempts < 100) {
            newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
            newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

            // Check if position doesn't overlap with snake, obstacles or other food
            validPosition = !isPositionOnSnake(newX, newY) &&
                            !isPositionOnObstacle(newX, newY) &&
                            !isPositionOnFood(newX, newY);

            attempts++;
        }

        if (validPosition) {
            food.push({
                x: newX,
                y: newY,
                image: randomizeFruit()
            });
        }
    }
}

// Check if a position has food on it
function isPositionOnFood(x, y) {
    return food.some(item => item.x === x && item.y === y);
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
// Draw all food items
function drawFood() {
    try {
        food.forEach(item => {
            if (item.image && item.image.complete && item.image.naturalWidth !== 0) {
                ctx.drawImage(item.image, item.x, item.y, gridSize, gridSize);
            } else {
                // Fallback to colored rectangle if image not loaded
                ctx.fillStyle = 'red';
                ctx.fillRect(item.x, item.y, gridSize, gridSize);

                // Add a border
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 1;
                ctx.strokeRect(item.x + 1, item.y + 1, gridSize - 2, gridSize - 2);
            }
        });
    } catch (error) {
        console.error("Error drawing food:", error);
    }
}

// Ritar ormen med bilder för kroppen och färg för huvud/svans
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - draw as dark green rectangle
            ctx.fillStyle = 'darkgreen';
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        }
        else if (index === snake.length - 1) {
            // Tail - draw as green rectangle
            ctx.fillStyle = 'green';
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        }
        else {
            // Body segments - use image with rotation
            drawBodySegment(segment, index);
        }
    });
}

function drawBodySegment(segment, index) {
    // Get previous and next segments to determine rotation
    const prev = snake[index - 1];
    const next = snake[index + 1];

    // If there's no previous or next (e.g. very short snake), just draw a square
    if (!prev || !next) {
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        return;
    }

    // Check if snake_body image is loaded
    if (typeof snakeBodyImage !== 'undefined' && 
        snakeBodyImage.complete && 
        snakeBodyImage.naturalWidth !== 0) 
    {
        // Save the current canvas state
        ctx.save();

        // Move to the center of the segment (so rotations pivot correctly)
        ctx.translate(segment.x + gridSize / 2, segment.y + gridSize / 2);

        let angle = 0;

        // Calculate direction vectors
        const prevToCurrent = {
            x: segment.x - prev.x,
            y: segment.y - prev.y
        };
        const currentToNext = {
            x: next.x - segment.x,
            y: next.y - segment.y
        };

        // 1) If snake is moving straight horizontally
        if (prevToCurrent.x !== 0 && currentToNext.x !== 0) {
            // Horizontal
            angle = 0; 
        }
        // 2) If snake is moving straight vertically
        else if (prevToCurrent.y !== 0 && currentToNext.y !== 0) {
            // Vertical
            angle = Math.PI / 2; 
        }
        // 3) Otherwise, the snake is turning
        else {
            // up->right OR left->down
            if ((prevToCurrent.y < 0 && currentToNext.x > 0) ||
                (prevToCurrent.x < 0 && currentToNext.y > 0)) {
                angle = 0;
            }
            // up->left OR right->down
            else if ((prevToCurrent.y < 0 && currentToNext.x < 0) ||
                     (prevToCurrent.x > 0 && currentToNext.y > 0)) {
                angle = Math.PI / 2;  // 90°
            }
            // down->right OR left->up
            else if ((prevToCurrent.y > 0 && currentToNext.x > 0) ||
                     (prevToCurrent.x < 0 && currentToNext.y < 0)) {
                angle = -Math.PI / 2; // -90°
            }
            // down->left OR right->up
            else if ((prevToCurrent.y > 0 && currentToNext.x < 0) ||
                     (prevToCurrent.x > 0 && currentToNext.y < 0)) {
                angle = Math.PI;      // 180°
            }
        }

        // Rotate the canvas for the segment
        ctx.rotate(angle);

        // Draw the body image so it fits exactly in the grid
        ctx.drawImage(
            snakeBodyImage,
            -gridSize / 2,
            -gridSize / 2,
            gridSize,
            gridSize
        );

        // Restore the canvas state
        ctx.restore();
    } else {
        // Fallback if the image isn't loaded: just draw a green square
        ctx.fillStyle = 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);

        // A small lighter square inside, for a bit of "texture"
        ctx.fillStyle = 'lightgreen';
        ctx.fillRect(
            segment.x + gridSize / 4,
            segment.y + gridSize / 4,
            gridSize / 2,
            gridSize / 2
        );
    }
}

// Add this helper function for determining segment type
function getSegmentType(prev, current, next) {
    if (!prev || !next) return 'straight';

    const dx1 = current.x - prev.x;
    const dy1 = current.y - prev.y;
    const dx2 = next.x - current.x;
    const dy2 = next.y - current.y;

    // If direction changes, it's a turn
    if ((dx1 !== 0 && dy2 !== 0) || (dy1 !== 0 && dx2 !== 0)) {
        return 'turn';
    }

    return 'straight';
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
    if (obstaclesEnabled && isPositionOnObstacle(head.x, head.y)) {
        gameOver('Hit an obstacle');
        return;
    }

    snake.unshift(head);  // Lägger till nytt huvud i början

    // Check if snake head is on any food item
    let foodEaten = false;
    let foodIndex = -1;

    for (let i = 0; i < food.length; i++) {
        if (head.x === food[i].x && head.y === food[i].y) {
            foodEaten = true;
            foodIndex = i;
            break;
        }
    }

    if (foodEaten) {
        // Remove the eaten food
        food.splice(foodIndex, 1);
        score++;

        // If all food is eaten, place new food
        if (food.length === 0) {
            placeFood();
        }
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

    // Skip obstacle placement if disabled
    if (!obstaclesEnabled) {
        return;
    }

    // Define a safety zone in front of the snake
    const safeZoneSize = 3; // Number of grid cells to keep clear
    const safePositions = [];

    // Get snake head position
    const head = snake[0];

    // Add positions in front of the snake to safe zone
    // Initial direction is 'right', so protect spaces to the right
    for (let i = 1; i <= safeZoneSize; i++) {
        // Safe position directly in front
        safePositions.push({
            x: head.x + (i * gridSize),
            y: head.y
        });
        
        // Safe position above
        safePositions.push({
            x: head.x + (i * gridSize),
            y: head.y - (i * gridSize)
        });
        
        // Safe position below
        safePositions.push({
            x: head.x + (i * gridSize),
            y: head.y + (i * gridSize)
        });
    }

    // Placera nya hinder
    for (let i = 0; i < count; i++) {
        let newX, newY;
        let validPosition = false;

        // Försök hitta en giltig position
        let attempts = 0;
        while (!validPosition && attempts < (canvasWidth * canvasHeight)/gridSize) {
            newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
            newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

            // Kontrollera om positionen är giltig (inte på ormen, maten, annat hinder eller säkerhetszonen)
            validPosition = !isPositionOnSnake(newX, newY) &&
                            !isPositionOnFood(newX, newY) &&
                            !isPositionOnObstacle(newX, newY) &&
                            !safePositions.some(pos => pos.x === newX && pos.y === newY);

            attempts++;
        }

        if (validPosition) {
            // Lägg till nytt hinder
            obstacles.push({ x: newX, y: newY });
        }
    }
}
// Draw grid lines
function drawgrid() {
    ctx.fillStyle = 'lightgray';
    for (let i = 0; i < canvasWidth; i += gridSize) {
        ctx.fillRect(i, 0, 1, canvasHeight);
    }
    for (let i = 0; i < canvasHeight; i += gridSize) {
        ctx.fillRect(0, i, canvasWidth, 1);
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
    // Only proceed if the game is not paused
    if (!isPaused) {
        direction = nextDirection;
        moveSnake();
        updateCanvas();
    }
}