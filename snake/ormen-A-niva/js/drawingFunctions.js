//---------------------------------------------
// DRAWING & ANIMATION FUNCTIONS
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

function drawgrid() {
    // Create a subtle gradient background
    const gradientBg = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradientBg.addColorStop(0, '#e8f5e9');
    gradientBg.addColorStop(1, '#c8e6c9');

    // Fill the entire canvas with the gradient
    ctx.fillStyle = gradientBg;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw the checkerboard pattern with subtle colors
    for (let x = 0; x < canvasWidth; x += gridSize) {
        for (let y = 0; y < canvasHeight; y += gridSize) {
            // Only fill alternate squares for checkerboard effect
            if ((x / gridSize + y / gridSize) % 2 === 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(x, y, gridSize, gridSize);
            }
        }
    }

    // Draw grid lines with a subtle soft effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x <= canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= canvasHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }
}

function drawSnake() {
    // Create a smooth animation effect based on time for subtle movement
    const time = Date.now() / 1000;

    // Draw the snake body segments first (from tail to head)
    for (let i = snake.length - 1; i >= 0; i--) {
        const segment = snake[i];

        if (i === 0) {
            // Head segment - special rendering with gradient and eyes
            drawSnakeHead(segment, i);
        } 
        else if (i === snake.length - 1) {
            // Tail segment - special rendering as a simple blue block
            drawSimpleTail(segment);
        }
        else {
            // Body segments - with connecting appearance
            drawSnakeBodyEnhanced(segment, i, time);
        }
    }
}

// Draw a simple blue block for the tail
function drawSimpleTail(segment) {
    ctx.fillStyle = '#4169E1'; // Royal Blue for the tail
    ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    
    // Add a subtle highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(segment.x + gridSize/4, segment.y + gridSize/4, gridSize/2, gridSize/2);
}

// Draw enhanced snake head with gradient and details
function drawSnakeHead(segment, index) {
    ctx.save();

    // Move to center of the segment for rotation
    ctx.translate(segment.x + gridSize/2, segment.y + gridSize/2);

    // Determine angle based on direction
    let angle = 0;
    switch (direction) {
        case 'up': angle = -Math.PI/2; break;
        case 'down': angle = Math.PI/2; break;
        case 'left': angle = Math.PI; break;
        case 'right': angle = 0; break;
    }

    // Apply rotation
    ctx.rotate(angle);

    // Check if we have a head image
    if (typeof snakeHeadImage !== 'undefined' &&
        snakeHeadImage.complete &&
        snakeHeadImage.naturalWidth !== 0) {

        // Add shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw the head image
        ctx.drawImage(
            snakeHeadImage,
            -gridSize/2,
            -gridSize/2,
            gridSize,
            gridSize
        );
    } else {
        // Fallback to a gradient-based head
        const headGradient = ctx.createRadialGradient(
            0, 0, gridSize * 0.1,
            0, 0, gridSize * 0.7
        );
        headGradient.addColorStop(0, '#1b5e20'); // Dark green center
        headGradient.addColorStop(1, '#388e3c'); // Medium green edge

        // Draw head shape
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        // Draw a rounded rectangle for the head
        ctx.roundRect(-gridSize/2, -gridSize/2, gridSize, gridSize, 4);
        ctx.fill();

        // Add eyes
        const eyeSize = gridSize / 6;
        const eyeOffset = gridSize / 4;

        // Left eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-eyeOffset, -eyeOffset, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeOffset, -eyeOffset, eyeSize/2, 0, Math.PI * 2);
        ctx.fill();

        // Add a small tongue
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.moveTo(gridSize/2, 0);
        ctx.lineTo(gridSize/2 + gridSize/5, -gridSize/10);
        ctx.lineTo(gridSize/2 + gridSize/5, gridSize/10);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

// Draw enhanced snake body with connecting segments
function drawSnakeBodyEnhanced(segment, index, time) {
    ctx.save();

    // Get previous and next segments to determine the correct orientation
    const prev = snake[index - 1];  // Segment closer to head
    const next = snake[index + 1];  // Segment closer to tail

    // If snake_body image is available and properly loaded
    if (typeof snakeBodyImage !== 'undefined' &&
        snakeBodyImage.complete &&
        snakeBodyImage.naturalWidth !== 0) {

        // Center on the segment
        ctx.translate(segment.x + gridSize/2, segment.y + gridSize/2);

        // Determine angle based on adjacent segments
        let angle = determineSegmentAngle(prev, segment, next);
        ctx.rotate(angle);

        // Add shadow for 3D effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw body image
        ctx.drawImage(
            snakeBodyImage,
            -gridSize/2,
            -gridSize/2,
            gridSize,
            gridSize
        );
    } else {
        // Fallback to stylized segments with gradient
        // Calculate a position-dependent color variation for natural look
        const hueShift = (index * 3) % 20;

        // Create a gradient for the body segment
        const bodyGradient = ctx.createLinearGradient(
            segment.x,
            segment.y,
            segment.x + gridSize,
            segment.y + gridSize
        );
        bodyGradient.addColorStop(0, `hsl(${120 + hueShift}, 70%, 35%)`);
        bodyGradient.addColorStop(1, `hsl(${120 + hueShift}, 70%, 40%)`);

        // Add shadow for 3D effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        // Draw the body segment
        ctx.fillStyle = bodyGradient;

        // Determine the body segment connections
        const segmentType = getSegmentType(prev, segment, next);
        if (segmentType === 'turn') {
            // For turning segments, draw a rounded shape
            ctx.beginPath();
            // Find direction of turn to draw appropriate corner
            const turnDirection = determineTurnDirection(prev, segment, next);
            drawBodyTurn(segment, turnDirection);
        } else {
            // For straight segments, draw a rectangle
            ctx.fillRect(segment.x + 1, segment.y + 1, gridSize - 2, gridSize - 2);

            // Add a lighter stripe down the middle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';

            // Determine if segment is vertical or horizontal
            if (prev && next) {
                if (prev.x === next.x) { // Vertical
                    ctx.fillRect(segment.x + gridSize/3, segment.y, gridSize/3, gridSize);
                } else { // Horizontal
                    ctx.fillRect(segment.x, segment.y + gridSize/3, gridSize, gridSize/3);
                }
            }
        }
    }

    ctx.restore();
}

// Helper to determine angle for body segments
function determineSegmentAngle(prev, current, next) {
    if (!prev || !next) return 0;

    // For straight segments
    if (prev.x === next.x) {
        return Math.PI/2; // Vertical
    } else if (prev.y === next.y) {
        return 0; // Horizontal
    }

    // For turns
    if ((prev.x < current.x && next.y < current.y) ||
        (prev.y < current.y && next.x > current.x)) {
        return 0; // Turn right-down or down-right
    } else if ((prev.x > current.x && next.y < current.y) ||
               (prev.y < current.y && next.x < current.x)) {
        return Math.PI/2; // Turn left-down or down-left
    } else if ((prev.x < current.x && next.y > current.y) ||
               (prev.y > current.y && next.x > current.x)) {
        return -Math.PI/2; // Turn right-up or up-right
    } else {
        return Math.PI; // Turn left-up or up-left
    }
}

// Determine the direction of turn for body segments
function determineTurnDirection(prev, current, next) {
    // Calculate the vectors
    const v1 = {
        x: current.x - prev.x,
        y: current.y - prev.y
    };
    const v2 = {
        x: next.x - current.x,
        y: next.y - current.y
    };

    // For each axis, determine if we're turning clockwise or counter-clockwise
    if (v1.x > 0 && v2.y < 0) return 'right-up';
    if (v1.x > 0 && v2.y > 0) return 'right-down';
    if (v1.x < 0 && v2.y < 0) return 'left-up';
    if (v1.x < 0 && v2.y > 0) return 'left-down';
    if (v1.y > 0 && v2.x > 0) return 'down-right';
    if (v1.y > 0 && v2.x < 0) return 'down-left';
    if (v1.y < 0 && v2.x > 0) return 'up-right';
    if (v1.y < 0 && v2.x < 0) return 'up-left';

    return 'straight'; // Default if no turn
}

// Draw a body turn with appropriate corner shape
function drawBodyTurn(segment, turnDirection) {
    const radius = gridSize/3;

    // Start at top-left of the grid cell
    switch(turnDirection) {
        case 'right-down':
        case 'down-right':
            // Corner is in the top-left
            ctx.fillRect(segment.x + radius, segment.y, gridSize - radius, gridSize);
            ctx.fillRect(segment.x, segment.y + radius, radius, gridSize - radius);
            ctx.beginPath();
            ctx.arc(segment.x + radius, segment.y + radius, radius, Math.PI, 1.5 * Math.PI);
            ctx.fill();
            break;

        case 'right-up':
        case 'up-right':
            // Corner is in the bottom-left
            ctx.fillRect(segment.x + radius, segment.y, gridSize - radius, gridSize);
            ctx.fillRect(segment.x, segment.y, radius, gridSize - radius);
            ctx.beginPath();
            ctx.arc(segment.x + radius, segment.y + gridSize - radius, radius, 0.5 * Math.PI, Math.PI);
            ctx.fill();
            break;

        case 'left-down':
        case 'down-left':
            // Corner is in the top-right
            ctx.fillRect(segment.x, segment.y, gridSize - radius, gridSize);
            ctx.fillRect(segment.x + gridSize - radius, segment.y + radius, radius, gridSize - radius);
            ctx.beginPath();
            ctx.arc(segment.x + gridSize - radius, segment.y + radius, radius, 1.5 * Math.PI, 2 * Math.PI);
            ctx.fill();
            break;

        case 'left-up':
        case 'up-left':
            // Corner is in the bottom-right
            ctx.fillRect(segment.x, segment.y, gridSize - radius, gridSize);
            ctx.fillRect(segment.x + gridSize - radius, segment.y, radius, gridSize - radius);
            ctx.beginPath();
            ctx.arc(segment.x + gridSize - radius, segment.y + gridSize - radius, radius, 0, 0.5 * Math.PI);
            ctx.fill();
            break;

        default:
            // Fallback to simple rectangle for straight segments
            ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    }
}

// Enhanced food drawing function with optimized performance
function drawFood() {
    try {
        if (food.length === 0) {
            // Ensure we always have at least some food
            console.warn("No food to draw, adding emergency food");
            addOneFood();
            return; // Return early since we just added food
        }

        // Update global animation time once per frame - more efficient
        animationTime = Date.now();
        
        // Calculate a single global pulse value to use for all food items
        // This is more efficient than calculating it for each item
        const globalPulse = Math.sin(animationTime / ANIMATION_PULSE_SPEED) * 0.1 + 0.95;

        // Remove any existing food timers from previous frame to prevent DOM overload
        const existingTimers = document.querySelectorAll('.food-timer, .food-timer-ring');
        existingTimers.forEach(timer => timer.remove());

        // Process each food item
        food.forEach(item => {
            // Skip drawing if the food is disappearing and animation complete
            if (item.isFading && item.fadeStart + fruitFadeTime < animationTime) {
                return;
            }

            // Calculate fade opacity if food is disappearing
            let opacity = 1;
            if (item.isFading) {
                opacity = 1 - ((animationTime - item.fadeStart) / fruitFadeTime);
                if (opacity < 0) opacity = 0;
            }

            // Save the canvas state for transformations
            ctx.save();

            // Apply scale animation - use pre-calculated global pulse instead of per-item
            ctx.translate(item.x + gridSize/2, item.y + gridSize/2);
            
            // Calculate time remaining if fruit disappear is enabled
            if (fruitDisappearEnabled && !item.isFading && item.createdAt) {
                const elapsedTime = animationTime - item.createdAt;
                const timeRemaining = fruitDisappearTime - elapsedTime;
                
                // Only show timer and special effects when less than 3 seconds remain
                if (timeRemaining < 3000 && timeRemaining > 0) {
                    // Faster pulse as time runs out
                    const warningPulse = Math.sin(animationTime / (100 + timeRemaining/30)) * 0.15 + 0.95;
                    ctx.scale(warningPulse, warningPulse);
                    
                    // Only create DOM timer element when time is running out
                    // This greatly reduces the number of DOM operations
                    createFoodTimer(item, Math.ceil(timeRemaining / 1000));
                } else {
                    // Normal pulsing
                    ctx.scale(globalPulse, globalPulse);
                }
            } else {
                // Normal pulsing
                ctx.scale(globalPulse, globalPulse);
            }
            
            // Apply fade effect if food is disappearing
            if (item.isFading) {
                ctx.globalAlpha = opacity;
            }

            if (item.image && item.image.complete && item.image.naturalWidth !== 0) {
                // Draw shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                // Draw the food image
                ctx.drawImage(
                    item.image,
                    -gridSize/2,
                    -gridSize/2,
                    gridSize,
                    gridSize
                );

                // Add a subtle highlight - for non-fading items only to improve performance
                if (!item.isFading) {
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = -2;
                    ctx.shadowOffsetY = -2;
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(-gridSize/2, -gridSize/2, gridSize, gridSize);
                }
            } else {
                // Improved fallback with reusable gradients
                if (!item.gradient) {
                    item.gradient = ctx.createRadialGradient(0, 0, gridSize*0.1, 0, 0, gridSize*0.7);
                    item.gradient.addColorStop(0, '#ff6b6b');
                    item.gradient.addColorStop(1, '#c92a2a');
                }

                // Draw a circular shape with shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;

                ctx.fillStyle = item.gradient;
                ctx.beginPath();
                ctx.arc(0, 0, gridSize/2 * 0.8, 0, Math.PI * 2);
                ctx.fill();

                // Simple stem at the top
                ctx.shadowColor = 'transparent';
                ctx.fillStyle = '#2e7d32';
                ctx.fillRect(-gridSize/10, -gridSize/2 * 0.8, gridSize/5, gridSize/6);

                // Add highlight only for non-fading items
                if (!item.isFading) {
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.beginPath();
                    ctx.arc(-gridSize/6, -gridSize/6, gridSize/4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Restore the canvas state
            ctx.restore();
        });
    } catch (error) {
        console.error("Error drawing food:", error);
    }
}

// Create a visual timer for food that's about to disappear
function createFoodTimer(item, secondsRemaining) {
    // Calculate the canvas position relative to viewport
    const canvasRect = canvas.getBoundingClientRect();
    
    // Get the absolute position for the timer
    const timerX = canvasRect.left + item.x + gridSize/2 - 15; // centered
    const timerY = canvasRect.top + item.y + gridSize/2 - 15;  // centered
    
    // Create the timer ring (visual progress indicator)
    const timerRing = document.createElement('div');
    timerRing.className = 'food-timer-ring';
    timerRing.style.left = timerX + 'px';
    timerRing.style.top = timerY + 'px';
    
    // Calculate progress for the conic gradient
    const elapsedTime = animationTime - item.createdAt;
    const progress = (elapsedTime / fruitDisappearTime) * 100;
    timerRing.style.setProperty('--progress', progress + '%');
    
    // Create the timer counter
    const timer = document.createElement('div');
    timer.className = 'food-timer';
    timer.style.left = (timerX + 3) + 'px';
    timer.style.top = (timerY + 3) + 'px';
    timer.textContent = secondsRemaining;
    
    // Set color based on urgency
    if (secondsRemaining <= 1) {
        timer.style.backgroundColor = 'rgba(244, 67, 54, 0.8)'; // Red for urgent
    } else if (secondsRemaining <= 2) {
        timer.style.backgroundColor = 'rgba(255, 152, 0, 0.8)'; // Orange for warning
    } else {
        timer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Default black
    }
    
    // Add to the DOM
    document.body.appendChild(timerRing);
    document.body.appendChild(timer);
}

// Enhanced obstacle drawing with better textures and 3D effect
function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Create wood-like gradient
        const gradient = ctx.createLinearGradient(
            obstacle.x,
            obstacle.y,
            obstacle.x + gridSize,
            obstacle.y + gridSize
        );
        gradient.addColorStop(0, '#8B4513');  // SaddleBrown
        gradient.addColorStop(0.4, '#A0522D'); // Sienna
        gradient.addColorStop(0.6, '#A0522D'); // Sienna
        gradient.addColorStop(1, '#8B4513');  // SaddleBrown

        // Apply shadow for 3D effect
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Draw main obstacle square with gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.x, obstacle.y, gridSize, gridSize);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw wood grain texture
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;

        // Horizontal grain lines
        const lineCount = 3;
        const lineSpacing = gridSize / (lineCount + 1);

        for (let i = 1; i <= lineCount; i++) {
            const y = obstacle.y + i * lineSpacing;

            // Add wavy effect to the grain lines
            ctx.beginPath();
            ctx.moveTo(obstacle.x, y);

            // Create wave pattern
            for (let x = 0; x <= gridSize; x += 5) {
                const wave = Math.sin(x / 5 + i) * 2;
                ctx.lineTo(obstacle.x + x, y + wave);
            }

            ctx.stroke();
        }

        // Add highlight at the top for 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y);
        ctx.lineTo(obstacle.x + gridSize, obstacle.y);
        ctx.lineTo(obstacle.x + gridSize - 3, obstacle.y + 3);
        ctx.lineTo(obstacle.x + 3, obstacle.y + 3);
        ctx.closePath();
        ctx.fill();

        // Add dark edge at bottom for 3D effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + gridSize);
        ctx.lineTo(obstacle.x + gridSize, obstacle.y + gridSize);
        ctx.lineTo(obstacle.x + gridSize - 3, obstacle.y + gridSize - 3);
        ctx.lineTo(obstacle.x + 3, obstacle.y + gridSize - 3);
        ctx.closePath();
        ctx.fill();
    });
}

// Enhanced enemy snake drawing with better appearance
function drawEnemySnake() {
    if (!enemyEnabled) return;

    // Create animation effect based on time
    const time = Date.now() / 1000;
    const pulseFactor = Math.sin(time * 2) * 0.05 + 0.95; // Subtle pulse effect

    // Draw the enemy snake body segments first (from tail to head)
    for (let i = enemySnake.length - 1; i >= 0; i--) {
        const segment = enemySnake[i];

        if (i === 0) {
            // Head segment - special rendering
            drawEnemyHead(segment);
        } else {
            // Body segments
            drawEnemyBody(segment, i, time, pulseFactor);
        }
    }
}

// Draw enhanced enemy head with details
function drawEnemyHead(segment) {
    ctx.save();

    // Center and rotation
    ctx.translate(segment.x + gridSize/2, segment.y + gridSize/2);

    // Determine rotation angle based on direction
    let angle = 0;
    switch (enemyDirection) {
        case 'up': angle = -Math.PI/2; break;
        case 'down': angle = Math.PI/2; break;
        case 'left': angle = Math.PI; break;
        case 'right': angle = 0; break;
    }
    ctx.rotate(angle);

    // Shadow for 3D effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Main head shape - gradient
    const headGradient = ctx.createLinearGradient(
        -gridSize/2, -gridSize/2,
        gridSize/2, gridSize/2
    );
    headGradient.addColorStop(0, '#d32f2f'); // Lighter red
    headGradient.addColorStop(1, '#b71c1c'); // Darker red

    ctx.fillStyle = headGradient;
    ctx.beginPath();
    // Draw rounded rectangle for head shape
    ctx.roundRect(-gridSize/2, -gridSize/2, gridSize, gridSize, 3);
    ctx.fill();

    // Reset shadow for details
    ctx.shadowColor = 'transparent';

    // Add threatening eyes
    const eyeSize = gridSize / 5;
    const eyeOffset = gridSize / 4;

    // Left eye
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.ellipse(
        -eyeOffset,
        -eyeOffset,
        eyeSize,
        eyeSize / 2,
        -Math.PI/4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(
        eyeOffset,
        -eyeOffset,
        eyeSize,
        eyeSize / 2,
        Math.PI/4,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Angry eyebrows
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Left eyebrow
    ctx.beginPath();
    ctx.moveTo(-eyeOffset - eyeSize, -eyeOffset - eyeSize/2);
    ctx.lineTo(-eyeOffset + eyeSize/2, -eyeOffset + eyeSize/2);
    ctx.stroke();

    // Right eyebrow
    ctx.beginPath();
    ctx.moveTo(eyeOffset + eyeSize, -eyeOffset - eyeSize/2);
    ctx.lineTo(eyeOffset - eyeSize/2, -eyeOffset + eyeSize/2);
    ctx.stroke();

    // Pupils - slits for snake look
    ctx.fillStyle = 'black';

    // Left pupil
    ctx.beginPath();
    ctx.ellipse(
        -eyeOffset,
        -eyeOffset,
        eyeSize/4,
        eyeSize/2,
        Math.PI/2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Right pupil
    ctx.beginPath();
    ctx.ellipse(
        eyeOffset,
        -eyeOffset,
        eyeSize/4,
        eyeSize/2,
        Math.PI/2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Add forked tongue
    ctx.fillStyle = '#d50000';
    ctx.beginPath();
    ctx.moveTo(gridSize/2, 0);
    ctx.lineTo(gridSize/2 + gridSize/3, -gridSize/6);
    ctx.lineTo(gridSize/2 + gridSize/2, 0);
    ctx.lineTo(gridSize/2 + gridSize/3, gridSize/6);
    ctx.lineTo(gridSize/2, 0);
    ctx.fill();

    ctx.restore();
}

// Draw enemy body segments with scales pattern
function drawEnemyBody(segment, index, time, pulseFactor) {
    // Apply a subtle pulse to make enemy look more alive
    const pulseX = segment.x + (1 - pulseFactor) * gridSize/2;
    const pulseY = segment.y + (1 - pulseFactor) * gridSize/2;
    const pulseSize = gridSize * pulseFactor;

    // Create a gradient with position-dependent color variation
    // This creates a subtle pattern along the body
    const hueShift = (index * 2) % 10; // Small hue variation to add detail

    // Create a gradient based on the segment index
    const bodyGradient = ctx.createLinearGradient(
        pulseX,
        pulseY,
        pulseX + pulseSize,
        pulseY + pulseSize
    );
    bodyGradient.addColorStop(0, `hsl(${0 + hueShift}, 90%, 45%)`); // Darker red
    bodyGradient.addColorStop(1, `hsl(${0 + hueShift}, 90%, 35%)`); // Even darker red

    // Shadow for 3D effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Draw the main body segment
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(pulseX, pulseY, pulseSize, pulseSize);

    // Add scales pattern
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';

    // Scales pattern based on the segment position in the snake
    const isEven = index % 2 === 0;
    const scaleOffset = isEven ? 0 : gridSize/6;

    // Draw horizontal pattern of darker "scales"
    for (let y = pulseY + scaleOffset; y < pulseY + pulseSize; y += gridSize/3) {
        ctx.beginPath();
        ctx.ellipse(
            pulseX + pulseSize/2,
            y,
            pulseSize/2.5,
            pulseSize/6,
            0,
            0,
            Math.PI
        );
        ctx.fill();
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Visual indicator for move queue
function showMoveQueueIndicator() {
    const queueStatus = document.getElementById('moveQueueStatus');
    if (!queueStatus) return;
    
    // Clear existing dots
    queueStatus.innerHTML = '';
    
    // Create dots based on queue length (max 3)
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'move-queue-dot' + (i < moveQueue.length ? ' active' : '');
        queueStatus.appendChild(dot);
    }
    
    // If queue has items, add a temporary highlight effect
    if (moveQueue.length > 0) {
        queueStatus.classList.add('highlight');
        setTimeout(() => {
            queueStatus.classList.remove('highlight');
        }, 300);
    }
}