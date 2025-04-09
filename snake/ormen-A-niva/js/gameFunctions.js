//---------------------------------------------
// GAME INITIALIZATION & CORE LOOP
//---------------------------------------------

function initGame() {
    // Hide the game over message
    document.getElementById('gameMessage').style.display = 'none';

    // Clear previous game state
    snake = [];
    moveQueue = [];
    initializing = true;

    // Set initial direction
    direction = 'right';
    nextDirection = 'right';

    // Reset speed to base value
    gameSpeed = baseGameSpeed;

    const startX = Math.floor(canvasWidth / (2 * gridSize)) * gridSize;
    const startY = Math.floor(canvasHeight / (2 * gridSize)) * gridSize;
    for (let i = 0; i < initialSnakeLength; i++) {
        snake.push({ x: startX - i * gridSize, y: startY });
    }

    // Set up board
    placeFood();
    placeObstacles(10); // Number of obstacles
    score = 0;

    // Initialize enemy snake if enabled
    if (enemyEnabled) {
        initEnemySnake();
    }

    // Draw initial state without starting movement
    updateCanvas();

    // Show transparent start overlay
    drawStartOverlay();
}

// Game's main loop
function gameLoop() {
    // Only proceed if the game is not paused
    if (!isPaused) {
        // Process any queued moves first
        processQueuedMoves();

        // Then update direction and move snake
        direction = nextDirection;
        moveSnake();

        // Rest of game logic
        if (enemyEnabled && !initializing) {
            moveEnemySnake();
        }

        updateCanvas();
    }
}

// Moves the snake in chosen direction and handles food
function moveSnake() {
    const head = { ...snake[0] };  // Copy current head

    // Move head in the chosen direction
    switch (direction) {
        case 'up': head.y -= gridSize; break;
        case 'down': head.y += gridSize; break;
        case 'left': head.x -= gridSize; break;
        case 'right': head.x += gridSize; break;
    }

    // Check collision with walls
    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
        gameOver('Hit the wall');
        return;
    }

    // Check collision with self
    if (isPositionOnSnake(head.x, head.y)) {
        gameOver('Hit yourself');
        return;
    }

    // Check collision with obstacles
    if (obstaclesEnabled && isPositionOnObstacle(head.x, head.y)) {
        gameOver('Hit an obstacle');
        return;
    }

    // Check collision with enemy snake
    if (enemyEnabled && isPositionOnEnemySnake(head.x, head.y)) {
        gameOver('Hit enemy snake');
        return;
    }

    snake.unshift(head);  // Add new head at the beginning

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

        // Increase game speed when food is eaten
        increaseSpeed();


        // Check if player has won after eating food
        if (checkWinCondition()) {
            return; // Game is over, no need to continue
        }

        // Spawn a new food item immediately after eating one
        addOneFood();
    } else {
        snake.pop(); // Remove the last segment if no food was eaten
    }
}

// Function to increase game speed when food is eaten
function increaseSpeed() {
    // Only increase speed if enabled in settings
    if (!speedIncreaseEnabled) {
        return;
    }

    // Only decrease if above minimum delay (maximum speed)
    if (gameSpeed > maxSpeed) {
        gameSpeed -= speedIncreasePerFood;

        // Don't go below the maximum speed (minimum delay)
        if (gameSpeed < maxSpeed) {
            gameSpeed = maxSpeed;
        }

        // Restart the interval with new speed
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }

    // Update speed display
    updateSpeedDisplay();

    // Add visual feedback when speed increases
    showSpeedBoost();
}

//function to show current speed in game UI
function updateSpeedDisplay() {
    const speedPercent = Math.floor(((baseGameSpeed - gameSpeed) / (baseGameSpeed - maxSpeed)) *100);
    document.getElementById('currentSpeed').textContent = `${speedPercent}`;
}

// Visual effect when speed increases
function showSpeedBoost() {
    const speedElement = document.getElementById('currentSpeed');

    // Remove the class if it's already there
    speedElement.classList.remove('speed-boost');

    // Force a reflow before adding the class again
    void speedElement.offsetWidth;

    // Add the animation class
    speedElement.classList.add('speed-boost');

    // No need for setTimeout as the animation will complete on its own
    // The animation is defined to return to the original state
}

//---------------------------------------------
// INPUT & CONTROL
//---------------------------------------------

// Handles key presses to change direction
function changeDirection(event) {
    event.preventDefault();

    // Start the game on first input if initializing
    if (initializing) {
        initializing = false;
        // Start game now
        if (!gameInterval) {
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
        // Remove start overlay
        updateCanvas();
    }

    let newDirection;
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            newDirection = 'up';
            if (direction !== 'down' &&
                (moveQueue.length === 0 || moveQueue[moveQueue.length-1] !== 'down')) {
                queueMove(newDirection);
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            newDirection = 'down';
            if (direction !== 'up' &&
                (moveQueue.length === 0 || moveQueue[moveQueue.length-1] !== 'up')) {
                queueMove(newDirection);
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newDirection = 'left';
            if (direction !== 'right' &&
                (moveQueue.length === 0 || moveQueue[moveQueue.length-1] !== 'right')) {
                queueMove(newDirection);
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newDirection = 'right';
            if (direction !== 'left' &&
                (moveQueue.length === 0 || moveQueue[moveQueue.length-1] !== 'left')) {
                queueMove(newDirection);
            }
            break;
        case ' ':
            if (gameInterval || isPaused) {
                togglePause();
            }
            break;
        case 'Escape':
            if (typeof isPaused !== 'undefined') {
                togglePause();
            }
            break;
    }

    // Play turn sound
    gameSounds.turn.play();
}

// Update the move queue system with a cleaner implementation
const MAX_QUEUE_SIZE = 3; // Limit queue to last 3 moves

// Add move to the queue (for fast moves)
//buggy ahhh
function queueMove(dir) {
    // Don't allow 180-degree turns (moving directly back)
    if ((dir === 'up' && direction === 'down') ||
        (dir === 'down' && direction === 'up') ||
        (dir === 'left' && direction === 'right') ||
        (dir === 'right' && direction === 'left')) {
        return;
    }

    // Don't queue the same move twice in a row
    if (moveQueue.length > 0 && moveQueue[moveQueue.length-1] === dir) {
        return;
    }

    // If nextDirection is already set to this, don't queue it
    if (moveQueue.length === 0 && nextDirection === dir) {
        return;
    }

    // Add to queue, but limit queue size
    moveQueue.push(dir);
    if (moveQueue.length > MAX_QUEUE_SIZE) {
        moveQueue.shift(); // Remove oldest move if queue gets too long
    }

    // Visual feedback for move queue
    showMoveQueueIndicator();

    console.log("Move queue:", moveQueue);
}

// Process moves from the queue in gameLoop
function processQueuedMoves() {
    if (moveQueue.length > 0 && !initializing) {
        const nextMove = moveQueue[0]; // Peek at the next move

        // Only process the move if it's valid from current position
        if ((nextMove === 'up' && direction !== 'down') ||
            (nextMove === 'down' && direction !== 'up') ||
            (nextMove === 'left' && direction !== 'right') ||
            (nextMove === 'right' && direction !== 'left')) {

            nextDirection = moveQueue.shift(); // Remove and use this move
        } else {
            // This move is now invalid, so remove it
            moveQueue.shift();
        }
    }
}

// Function to handle pausing and resuming the game
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

//---------------------------------------------
// COLLISION DETECTION
//---------------------------------------------

// checks if the position is on the snake
function isPositionOnSnake(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

// Check if a position has food on it
function isPositionOnFood(x, y) {
    return food.some(item => item.x === x && item.y === y);
}

// Kontrollerar om en position ligger på ett hinder
function isPositionOnObstacle(x, y) {
    return obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
}

//---------------------------------------------
// FOOD MANAGEMENT
//---------------------------------------------

// Fix the placeFood function to ensure food is always added in accessible locations
function placeFood() {
    // Clear existing food array
    food = [];
    console.log("Placing food, count:", foodCount);

    // Add the specified number of food items
    let placedCount = 0;
    let maxAttempts = 200; // Avoid infinite loops
    let attempts = 0;

    // Try to place food with the accessibility check
    while (placedCount < foodCount && attempts < maxAttempts) {
        let newX, newY;
        let validPosition = false;
        let posAttempts = 0;

        while (!validPosition && posAttempts < 50) {
            newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
            newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

            // Check if position is valid and accessible
            validPosition = !isPositionOnSnake(newX, newY) &&
                            !isPositionOnObstacle(newX, newY) &&
                            !isPositionOnFood(newX, newY) &&
                            hasEnoughOpenNeighbors(newX, newY, 2);

            posAttempts++;
        }

        if (validPosition) {
            const fruitImg = randomizeFruit();
            food.push({
                x: newX,
                y: newY,
                image: fruitImg
            });
            placedCount++;
        }

        attempts++;
    }

    console.log(`Successfully placed ${placedCount} food items`);

    // Emergency fallback if no food was placed
    if (food.length === 0) {
        console.warn("Failed to place food normally, using emergency placement with accessibility check");
        emergencyFoodPlacementWithAccess();
    }
}

// Function to add just one food item with accessibility check
function addOneFood() {
    let newX, newY;
    let validPosition = false;
    let attempts = 0;

    while (!validPosition && attempts < 100) {
        newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
        newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

        // Check if position doesn't overlap with snake, obstacles or other food
        validPosition = !isPositionOnSnake(newX, newY) &&
                        !isPositionOnObstacle(newX, newY) &&
                        !isPositionOnFood(newX, newY) &&
                        hasEnoughOpenNeighbors(newX, newY, 2); // New check for accessible spaces

        attempts++;
    }

    if (validPosition) {
        food.push({
            x: newX,
            y: newY,
            image: randomizeFruit()
        });
        return true;
    }
    return false;
}

// Helper function to check if a position has enough open neighboring spaces
function hasEnoughOpenNeighbors(x, y, minOpenSpaces) {
    // Define the four adjacent positions (up, right, down, left)
    const neighbors = [
        { x: x, y: y - gridSize }, // up
        { x: x + gridSize, y: y }, // right
        { x: x, y: y + gridSize }, // down
        { x: x - gridSize, y: y }  // left
    ];
    
    // Count how many neighbors are open (not walls, obstacles, or occupied by snake)
    let openCount = 0;
    
    for (const neighbor of neighbors) {
        // Check if position is valid (within canvas and not occupied)
        if (neighbor.x >= 0 && neighbor.x < canvasWidth && 
            neighbor.y >= 0 && neighbor.y < canvasHeight && 
            !isPositionOnObstacle(neighbor.x, neighbor.y) && 
            !isPositionOnSnake(neighbor.x, neighbor.y)) {
            openCount++;
        }
    }
    
    // Return true if there are at least minOpenSpaces open neighbors
    return openCount >= minOpenSpaces;
}

// Updated emergency food placement to ensure accessibility
function emergencyFoodPlacementWithAccess() {
    // Try each position on the board
    for (let x = 0; x < canvasWidth; x += gridSize) {
        for (let y = 0; y < canvasHeight; y += gridSize) {
            if (!isPositionOnObstacle(x, y) && 
                !isPositionOnSnake(x, y) &&
                hasEnoughOpenNeighbors(x, y, 2)) {
                
                food.push({
                    x: x,
                    y: y,
                    image: randomizeFruit()
                });
                return; // Just need one piece of food
            }
        }
    }
    
    // Last resort: place food anywhere that's not an obstacle or snake
    // This is only used if no position with 2+ open neighbors exists
    for (let x = 0; x < canvasWidth; x += gridSize) {
        for (let y = 0; y < canvasHeight; y += gridSize) {
            if (!isPositionOnObstacle(x, y) && !isPositionOnSnake(x, y)) {
                food.push({
                    x: x,
                    y: y,
                    image: randomizeFruit()
                });
                return;
            }
        }
    }
}

//---------------------------------------------
// OBSTACLE MANAGEMENT
//---------------------------------------------

// Place obstacles on the board
function placeObstacles(count = 10) {
    // Clear existing obstacles
    obstacles = [];

    // Skip obstacle placement if disabled
    if (!obstaclesEnabled) {
        return;
    }

    // Define safety zone in front of the snake
    const safeZoneSize = 3;
    const safePositions = [];
    const head = snake[0];

    // Add positions in front of snake to safe zone
    for (let i = 1; i <= safeZoneSize; i++) {
        // Safe positions directly in front and diagonally
        safePositions.push({ x: head.x + (i * gridSize), y: head.y });
        safePositions.push({ x: head.x + (i * gridSize), y: head.y - (i * gridSize) });
        safePositions.push({ x: head.x + (i * gridSize), y: head.y + (i * gridSize) });
    }

    if (largeObstaclesEnabled) {
        // Place 5 clusters of 4 obstacles each
        placeLargeObstacles(5, 4, safePositions);
    } else {
        // Place individual obstacles
        placeIndividualObstacles(count, safePositions);
    }
}

// Function to place individual obstacles
function placeIndividualObstacles(count, safePositions) {
    for (let i = 0; i < count; i++) {
        let newX, newY;
        let validPosition = false;
        let attempts = 0;

        while (!validPosition && attempts < (canvasWidth * canvasHeight)/gridSize) {
            newX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
            newY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

            // Check if position is valid
            validPosition = !isPositionOnSnake(newX, newY) &&
                           !isPositionOnFood(newX, newY) &&
                           !isPositionOnObstacle(newX, newY) &&
                           !safePositions.some(pos => pos.x === newX && pos.y === newY);

            attempts++;
        }

        if (validPosition) {
            obstacles.push({ x: newX, y: newY });
        }
    }
}

// Function to place clusters of obstacles
function placeLargeObstacles(clusterCount, obstaclesPerCluster, safePositions) {
    for (let c = 0; c < clusterCount; c++) {
        // Try to find a valid position for the cluster
        let clusterX, clusterY;
        let validClusterPosition = false;
        let clusterAttempts = 0;

        while (!validClusterPosition && clusterAttempts < 100) {
            clusterX = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
            clusterY = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

            // Check if center position is valid
            validClusterPosition = !isPositionOnSnake(clusterX, clusterY) &&
                                  !isPositionOnFood(clusterX, clusterY) &&
                                  !isPositionOnObstacle(clusterX, clusterY) &&
                                  !safePositions.some(pos => pos.x === clusterX && pos.y === clusterY);

            clusterAttempts++;
        }

        if (validClusterPosition) {
            // Add the center obstacle
            obstacles.push({ x: clusterX, y: clusterY });

            // Add surrounding obstacles to form a cluster
            const clusterPositions = [
                { x: clusterX + gridSize, y: clusterY },
                { x: clusterX - gridSize, y: clusterY },
                { x: clusterX, y: clusterY + gridSize },
                { x: clusterX, y: clusterY - gridSize },
                { x: clusterX + gridSize, y: clusterY + gridSize },
                { x: clusterX - gridSize, y: clusterY - gridSize },
                { x: clusterX + gridSize, y: clusterY - gridSize },
                { x: clusterX - gridSize, y: clusterY + gridSize }
            ];

            // Shuffle the positions for random selection
            shuffleArray(clusterPositions);

            // Try to add obstacles from the shuffled positions
            let obstaclesAdded = 1; // We've already added the center

            for (let i = 0; i < clusterPositions.length && obstaclesAdded < obstaclesPerCluster; i++) {
                const pos = clusterPositions[i];

                // Check if position is valid and on the board
                if (pos.x >= 0 && pos.x < canvasWidth &&
                    pos.y >= 0 && pos.y < canvasHeight &&
                    !isPositionOnSnake(pos.x, pos.y) &&
                    !isPositionOnFood(pos.x, pos.y) &&
                    !isPositionOnObstacle(pos.x, pos.y) &&
                    !safePositions.some(safePos => safePos.x === pos.x && safePos.y === pos.y)) {

                    obstacles.push({ x: pos.x, y: pos.y });
                    obstaclesAdded++;
                }
            }
        }
    }
}

// Utility function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

//---------------------------------------------
// RENDERING
//---------------------------------------------

// Updates the canvas with current game state
function updateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawgrid();
    drawObstacles();

    // Draw enemy before player so player appears on top
    if (enemyEnabled) {
        drawEnemySnake();
    }

    drawSnake();
    drawFood();
    document.getElementById('score').innerText = `Score: ${score}`;
}

// Draw transparent start overlay with instructions
function drawStartOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake Game', canvasWidth/2, canvasHeight/3);
    ctx.font = '16px Arial';
    ctx.fillText('Press any direction key to start', canvasWidth/2, canvasHeight/2);
    ctx.fillText('Use arrow keys or WASD to control', canvasWidth/2, canvasHeight/2 + 30);
    ctx.fillText('Space to pause/resume', canvasWidth/2, canvasHeight/2 + 60);
}

// Draw pause message
function drawPauseOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Paused', canvasWidth / 2, canvasHeight / 2);
}

// Replace the drawgrid function with this checkered background version
function drawgrid() {
    // colors for checkered pattern
    const color1 = '#E6E6FA'; // Lavender
    const color2 = '#cccce2'; // MediumPurple

    // Draw the checkered background
    for (let x = 0; x < canvasWidth; x += gridSize) {
        for (let y = 0; y < canvasHeight; y += gridSize) {
            // Alternate colors based on position
            ctx.fillStyle = (x/gridSize + y/gridSize) % 2 === 0 ? color1 : color2;
            ctx.fillRect(x, y, gridSize, gridSize);
        }
    }

    // Optional: Draw grid lines for better visibility
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';  // Transparent white
    for (let i = 0; i < canvasWidth; i += gridSize) {
        ctx.fillRect(i, 0, 1, canvasHeight);
    }
    for (let i = 0; i < canvasHeight; i += gridSize) {
        ctx.fillRect(0, i, canvasWidth, 1);
    }
}

// Ritar ormen med bilder för kroppen och färg för huvud/svans
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - draw with image if available
            if (typeof snakeHeadImage !== 'undefined' &&
                snakeHeadImage.complete &&
                snakeHeadImage.naturalWidth !== 0) {

                ctx.save();
                ctx.translate(segment.x + gridSize / 2, segment.y + gridSize / 2);

                // Rotate head based on direction
                let angle = 0;
                switch (direction) {
                    case 'up': angle = -Math.PI/2; break;
                    case 'down': angle = Math.PI/2; break;
                    case 'left': angle = Math.PI; break;
                    case 'right': angle = 0; break;
                }

                ctx.rotate(angle);
                ctx.drawImage(
                    snakeHeadImage,
                    -gridSize / 2,
                    -gridSize / 2,
                    gridSize,
                    gridSize
                );
                ctx.restore();
            } else {
                // Fallback to colored square
                ctx.fillStyle = 'darkgreen';
                ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
            }
        }
        else if (index === snake.length - 1) {
            // Tail - draw as green rectangle
            ctx.fillStyle = 'green';
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
        }
        else {
            // Body segments
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
        ctx.save();

        // Move to the center of the segment (so rotations are correctly)
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

// Update the food drawing function
function drawFood() {
    try {
        // Debug - show how many food items we're drawing
        console.log("Drawing food items:", food.length);

        if (food.length === 0) {
            // Ensure we always have at least some food
            console.warn("No food to draw, adding emergency food");
            addOneFood();
        }

        food.forEach(item => {
            if (item.image && item.image.complete && item.image.naturalWidth !== 0) {
                ctx.drawImage(item.image, item.x, item.y, gridSize, gridSize);
            } else {
                // Improved fallback - more noticeable food item
                ctx.fillStyle = 'red';
                ctx.fillRect(item.x, item.y, gridSize, gridSize);

                // Add a yellow center dot
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(
                    item.x + gridSize/2,
                    item.y + gridSize/2,
                    gridSize/4,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        });
    } catch (error) {
        console.error("Error drawing food:", error);
    }
}

//draw obstacles on the canvas, one grid big.
function drawObstacles() {
    ctx.fillStyle = '#8B4513'; // Brun färg för hinder
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);

        //draw texture
        ctx.strokeStyle = '#663300';
        ctx.lineWidth = 1;
        ctx.strokeRect(obstacle.x, obstacle.y, gridSize, gridSize);

        //draw texture
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

//---------------------------------------------
// GAME STATE HANDLERS
//---------------------------------------------

// Function to check if player has won by filling the entire board
function checkWinCondition() {
    // Calculate total number of tiles on the board
    const totalTiles = (canvasWidth / gridSize) * (canvasHeight / gridSize);

    // If snake length equals total tiles minus obstacles, player has won!
    const availableTiles = totalTiles - obstacles.length;
    if (snake.length >= availableTiles) {
        winGame();
        return true;
    }
    return false;
}

// Function to handle win state
function winGame() {
    clearInterval(gameInterval);
    gameInterval = null;

    const messageDiv = document.getElementById('gameMessage');
    // you get the whole snake as points( by default that is 3 more then if you used score)
    messageDiv.innerHTML = `
        <h2 style="color: gold;">YOU WIN!</h2>
        <p>Congratulations! You filled the entire board!</p>
        <p>Final Score: ${snake.length}</p>
        <p>Click Start to play again</p>
    `;
    // Show the message div
    messageDiv.style.display = 'block';

    // Play win sound
    gameSounds.win.play();

    // Update button states
    document.getElementById('startBtn').innerText = 'Start';
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').innerText = 'Pause';

    // Reset pause state
    if (typeof isPaused !== 'undefined') {
        isPaused = false;
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
        <p>Click Reset to play again</p>
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

//---------------------------------------------
// UTILITY FUNCTIONS
//---------------------------------------------

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

//---------------------------------------------
// ENEMY SNAKE MANAGEMENT
//---------------------------------------------

// Initialize the enemy snake
function initEnemySnake() {
    enemySnake = [];

    // Place enemy in the opposite corner from player
    const startX = Math.floor(canvasWidth / gridSize) * gridSize - gridSize;
    const startY = Math.floor(canvasHeight / gridSize) * gridSize - gridSize;

    // Create enemy snake body
    for (let i = 0; i < enemyLength; i++) {
        enemySnake.push({ x: startX - i * gridSize, y: startY });
    }

    // Reset enemy direction
    enemyDirection = 'left';
}

// Draw the enemy snake (red color)
function drawEnemySnake() {
    if (!enemyEnabled) return;

    enemySnake.forEach((segment, index) => {
        // Use red for enemy snake head, lighter red for body
        ctx.fillStyle = index === 0 ? '#8B0000' : '#FF4500';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);

        // Add texture/pattern to make it distinct from player
        if (index === 0) {
            // Draw eyes for head
            ctx.fillStyle = 'white';

            // Position eyes based on direction
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            const eyeSize = gridSize / 5;
            const eyeOffset = gridSize / 3;

            switch(enemyDirection) {
                case 'up':
                    leftEyeX = segment.x + eyeOffset;
                    leftEyeY = segment.y + eyeOffset;
                    rightEyeX = segment.x + gridSize - eyeOffset - eyeSize;
                    rightEyeY = segment.y + eyeOffset;
                    break;
                case 'down':
                    leftEyeX = segment.x + eyeOffset;
                    leftEyeY = segment.y + gridSize - eyeOffset - eyeSize;
                    rightEyeX = segment.x + gridSize - eyeOffset - eyeSize;
                    rightEyeY = segment.y + gridSize - eyeOffset - eyeSize;
                    break;
                case 'left':
                    leftEyeX = segment.x + eyeOffset;
                    leftEyeY = segment.y + eyeOffset;
                    rightEyeX = segment.x + eyeOffset;
                    rightEyeY = segment.y + gridSize - eyeOffset - eyeSize;
                    break;
                case 'right':
                    leftEyeX = segment.x + gridSize - eyeOffset - eyeSize;
                    leftEyeY = segment.y + eyeOffset;
                    rightEyeX = segment.x + gridSize - eyeOffset - eyeSize;
                    rightEyeY = segment.y + gridSize - eyeOffset - eyeSize;
                    break;
            }

            ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
            ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        }
    });
}

// Move the enemy snake to chase the player
function moveEnemySnake() {
    if (!enemyEnabled || enemySnake.length === 0) return;

    // Only move the enemy every enemySpeed frames
    enemyMoveCounter++;
    if (enemyMoveCounter < enemySpeed) return;
    enemyMoveCounter = 0;

    // Get the current head
    const head = { ...enemySnake[0] };

    // Find direction to move towards player
    const playerHead = snake[0];

    // Decide direction based on player position - simple pathfinding
    let newDirection = decideEnemyDirection(head, playerHead);

    // Update head position based on direction
    switch (newDirection) {
        case 'up': head.y -= gridSize; break;
        case 'down': head.y += gridSize; break;
        case 'left': head.x -= gridSize; break;
        case 'right': head.x += gridSize; break;
    }

    // Check for collisions with walls
    if (head.x < 0 || head.x >= canvasWidth || head.y < 0 || head.y >= canvasHeight) {
        // If hitting wall, reposition enemy snake to a safe location
        repositionEnemySnake();
        return;
    }

    // Check for collisions with obstacles
    if (obstaclesEnabled && isPositionOnObstacle(head.x, head.y)) {
        // Try to find a new direction that doesn't hit an obstacle
        const validDirections = findValidDirections(enemySnake[0]);
        if (validDirections.length > 0) {
            // Choose a random valid direction
            newDirection = validDirections[Math.floor(Math.random() * validDirections.length)];

            // Recalculate head position
            head.x = enemySnake[0].x;
            head.y = enemySnake[0].y;

            switch (newDirection) {
                case 'up': head.y -= gridSize; break;
                case 'down': head.y += gridSize; break;
                case 'left': head.x -= gridSize; break;
                case 'right': head.x += gridSize; break;
            }
        } else {
            // If no valid directions, reposition enemy snake
            repositionEnemySnake();
            return;
        }
    }

    // Check for collision with self
    if (isPositionOnEnemySnake(head.x, head.y)) {
        // If collision with self, reposition enemy snake
        repositionEnemySnake();
        return;
    }

    // Check for collision with player's snake - THIS IS THE KEY CHANGE
    if (isPositionOnSnake(head.x, head.y)) {
        // End the game if enemy collides with player
        gameOver('Player caught by enemy snake');
        return;
    }

    // Update enemy direction
    enemyDirection = newDirection;

    // Add new head
    enemySnake.unshift(head);

    // Check if enemy can eat food
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
        // Remove eaten food and add new one
        food.splice(foodIndex, 1);
        addOneFood();
    } else {
        // Remove tail if no food eaten
        enemySnake.pop();
    }
}

// Find a direction for the enemy to move towards the player
function decideEnemyDirection(enemyHead, playerHead) {
    // Calculate the difference between enemy and player positions
    const dx = playerHead.x - enemyHead.x;
    const dy = playerHead.y - enemyHead.y;

    // Determine if horizontal or vertical movement has priority
    // (alternate between prioritizing x and y for more natural movement)
    const prioritizeX = Math.random() > 0.3;

    let newDirection;

    if (prioritizeX) {
        // Try to move horizontally first
        if (dx > 0 && enemyDirection !== 'left') {
            newDirection = 'right';
        } else if (dx < 0 && enemyDirection !== 'right') {
            newDirection = 'left';
        } else if (dy > 0 && enemyDirection !== 'up') {
            newDirection = 'down';
        } else if (dy < 0 && enemyDirection !== 'down') {
            newDirection = 'up';
        } else {
            // Keep current direction as fallback
            newDirection = enemyDirection;
        }
    } else {
        // Try to move vertically first
        if (dy > 0 && enemyDirection !== 'up') {
            newDirection = 'down';
        } else if (dy < 0 && enemyDirection !== 'down') {
            newDirection = 'up';
        } else if (dx > 0 && enemyDirection !== 'left') {
            newDirection = 'right';
        } else if (dx < 0 && enemyDirection !== 'right') {
            newDirection = 'left';
        } else {
            // Keep current direction as fallback
            newDirection = enemyDirection;
        }
    }

    return newDirection;
}

// Find valid directions (no obstacles, walls or self)
function findValidDirections(head) {
    const directions = ['up', 'down', 'left', 'right'];
    const validDirections = [];

    for (const dir of directions) {
        // Skip the opposite of current direction
        if ((dir === 'up' && enemyDirection === 'down') ||
            (dir === 'down' && enemyDirection === 'up') ||
            (dir === 'left' && enemyDirection === 'right') ||
            (dir === 'right' && enemyDirection === 'left')) {
            continue;
        }

        // Calculate new position
        let newX = head.x;
        let newY = head.y;

        switch (dir) {
            case 'up': newY -= gridSize; break;
            case 'down': newY += gridSize; break;
            case 'left': newX -= gridSize; break;
            case 'right': newX += gridSize; break;
        }

        // Check if position is valid
        if (newX >= 0 && newX < canvasWidth &&
            newY >= 0 && newY < canvasHeight &&
            !isPositionOnObstacle(newX, newY) &&
            !isPositionOnEnemySnake(newX, newY) &&
            !isPositionOnSnake(newX, newY)) {
            validDirections.push(dir);
        }
    }

    return validDirections;
}

// Check if position is on enemy snake
function isPositionOnEnemySnake(x, y) {
    return enemySnake.some(segment => segment.x === x && segment.y === y);
}

// Reposition enemy snake to a safe location
function repositionEnemySnake() {
    // Try to find a safe position for the enemy snake
    let safeSpot = findSafeSpotForEnemy();

    if (safeSpot) {
        // Create new enemy snake at safe position
        enemySnake = [];
        for (let i = 0; i < enemyLength; i++) {
            enemySnake.push({
                x: safeSpot.x - (i * (safeSpot.direction === 'right' ? -gridSize : gridSize)),
                y: safeSpot.y - (i * (safeSpot.direction === 'down' ? -gridSize : gridSize))
            });
        }
        enemyDirection = safeSpot.direction;
    } else {
        // If no safe spot found, disable enemy snake temporarily
        enemySnake = [];
        // Will be re-enabled on next game loop
    }
}

// Find a safe spot for the enemy snake
function findSafeSpotForEnemy() {
    // Try to find a position that's not near the player
    const safeDistance = 5 * gridSize; // Stay at least 5 grid cells away
    const playerHead = snake[0];

    // Try up to 50 random positions
    for (let attempts = 0; attempts < 50; attempts++) {
        const x = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;

        // Calculate distance to player
        const distToPlayer = Math.abs(x - playerHead.x) + Math.abs(y - playerHead.y);

        // Check if position is safe
        if (distToPlayer >= safeDistance &&
            !isPositionOnSnake(x, y) &&
            !isPositionOnObstacle(x, y) &&
            !isPositionOnFood(x, y)) {

            // Determine a safe direction for the enemy snake
            const directions = ['up', 'down', 'left', 'right'];
            for (const dir of directions) {
                let validDirection = true;

                // Check if we can place the whole enemy snake in this direction
                for (let i = 1; i < enemyLength; i++) {
                    let checkX = x;
                    let checkY = y;

                    switch (dir) {
                        case 'up': checkY += i * gridSize; break;
                        case 'down': checkY -= i * gridSize; break;
                        case 'left': checkX += i * gridSize; break;
                        case 'right': checkX -= i * gridSize; break;
                    }

                    // Check if position is valid
                    if (checkX < 0 || checkX >= canvasWidth ||
                        checkY < 0 || checkY >= canvasHeight ||
                        isPositionOnObstacle(checkX, checkY) ||
                        isPositionOnSnake(checkX, checkY)) {
                        validDirection = false;
                        break;
                    }
                }

                if (validDirection) {
                    return { x, y, direction: dir };
                }
            }
        }
    }

    return null;
}