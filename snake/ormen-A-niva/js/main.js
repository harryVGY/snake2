(() => {
    // Variables for game state
    let isPaused = false;

    // Initialize game controls when the DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log("DOM Content Loaded");

        // Initialize game immediately to show map, but don't start movement
        initGame();

        // Initialize high scores when the game loads
        initHighScores();

        // Event listener for start/reset button
        document.getElementById('startBtn').addEventListener('click', () => {
            console.log("Start button clicked");
            if (gameInterval) {
                clearInterval(gameInterval);
                gameInterval = null;
            }
            document.getElementById('pauseBtn').innerText = 'Pause';
            document.getElementById('pauseBtn').disabled = false;

            // Reset score display and speed display
            score = 0;
            document.getElementById('score').innerText = 'Score: 0';
            document.getElementById('currentSpeed').textContent = '0';

            // Update settings before starting game
            updateSettingsFromUI();

            initGame();
            initializing = false;
            gameInterval = setInterval(gameLoop, gameSpeed);
            document.getElementById('startBtn').innerText = 'Reset';
        });

        // Event listener for pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (gameInterval || isPaused) {
                togglePause();
            }
        });

        // Event listener for key presses
        document.addEventListener('keydown', changeDirection);

        // Disable pause button initially
        document.getElementById('pauseBtn').disabled = true;
    });
})();

// Setup grid size slider
const gridSlider = document.getElementById('gridSizeSlider');
const gridSizeValue = document.getElementById('gridSizeValue');

if (gridSlider && gridSizeValue) {
    gridSlider.addEventListener('input', function() {
        gridSizeValue.textContent = this.value;
        updateGridSize(parseInt(this.value));
    });
}

// Initialize valid grid sizes for the slider
const validSizes = [];
for (let i = 5; i <= 50; i++) {
    if (canvasWidth % i === 0 && canvasHeight % i === 0) {
        validSizes.push(i);
    }
}

// Create a datalist for the slider to show tick marks at valid values
if (gridSlider) {
    // Set min and max to valid values
    if (validSizes.length > 0) {
        gridSlider.min = validSizes[0];
        gridSlider.max = validSizes[validSizes.length - 1];
        gridSlider.step = 1;

        // Update initial value to nearest valid size
        const initialSize = parseInt(gridSlider.value);
        const closestValidSize = validSizes.reduce((prev, curr) => {
            return (Math.abs(curr - initialSize) < Math.abs(prev - initialSize) ? curr : prev);
        });
        gridSlider.value = closestValidSize;
        gridSizeValue.textContent = closestValidSize;
        gridSize = closestValidSize;
    }
}

// Setup obstacles toggle
const obstaclesToggle = document.getElementById('obstaclesToggle');
if (obstaclesToggle) {
    obstaclesToggle.addEventListener('change', function() {
        obstaclesEnabled = this.checked;
        if (!gameInterval) {
            // If game is not running, update UI immediately
            if (obstaclesEnabled) {
                placeObstacles(10);
            } else {
                obstacles = [];
            }
            updateCanvas();
        }
    });
}

// Setup large obstacles toggle
const largeObstaclesToggle = document.getElementById('largeObstaclesToggle');
if (largeObstaclesToggle) {
    largeObstaclesToggle.addEventListener('change', function() {
        largeObstaclesEnabled = this.checked;
        if (!gameInterval) {
            // If game is not running, update UI immediately
            if (obstaclesEnabled) {
                placeObstacles(10);
            } else {
                obstacles = [];
            }
            updateCanvas();
        }
    });
    
    // Set initial value from HTML
    largeObstaclesEnabled = largeObstaclesToggle.checked;
}

// Setup fruit disappear toggle
const fruitDisappearToggle = document.getElementById('fruitDisappearToggle');
if (fruitDisappearToggle) {
    fruitDisappearToggle.addEventListener('change', function() {
        fruitDisappearEnabled = this.checked;
        console.log("Fruit disappear set to:", fruitDisappearEnabled);
    });
    
    // Set initial value from HTML
    fruitDisappearEnabled = fruitDisappearToggle.checked;
}

// Setup food count slider
const foodSlider = document.getElementById('foodCountSlider');
const foodCountValue = document.getElementById('foodCountValue');

if (foodSlider && foodCountValue) {
    foodSlider.addEventListener('input', function() {
        foodCountValue.textContent = this.value;
        foodCount = parseInt(this.value);
        if (!gameInterval) {
            // If game is not running, update UI immediately
            placeFood();
            updateCanvas();
        }
    });
}

// Setup speed slider
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

if (speedSlider && speedValue) {
    speedSlider.addEventListener('input', function() {
        speedValue.textContent = this.value;
        updateGameSpeed(parseInt(this.value));
        
        updateSpeedDisplay();
    });
}

// Setup speed increase toggle
const speedIncreaseToggle = document.getElementById('speedIncreaseToggle');
if (speedIncreaseToggle) {
    speedIncreaseToggle.addEventListener('change', function() {
        speedIncreaseEnabled = this.checked;
    });
    
    // Set initial value from HTML
    speedIncreaseEnabled = speedIncreaseToggle.checked;
}

// Setup enemy toggle
const enemyToggle = document.getElementById('enemyToggle');
if (enemyToggle) {
    enemyToggle.addEventListener('change', function() {
        enemyEnabled = this.checked;
        
        if (!gameInterval) {
            // If game is not running, update UI immediately
            if (enemyEnabled) {
                initEnemySnake();
            } else {
                enemySnake = [];
            }
            updateCanvas();
        }
    });
    
    // Set initial value from HTML
    enemyEnabled = enemyToggle.checked;
}

// Function to update settings from UI controls
function updateSettingsFromUI() {
    // Update obstacles setting
    const obstaclesToggle = document.getElementById('obstaclesToggle');
    if (obstaclesToggle) {
        obstaclesEnabled = obstaclesToggle.checked;
    }

    // Update large obstacles setting
    const largeObstaclesToggle = document.getElementById('largeObstaclesToggle');
    if (largeObstaclesToggle) {
        largeObstaclesEnabled = largeObstaclesToggle.checked;
    }

    // Update food count setting
    const foodSlider = document.getElementById('foodCountSlider');
    if (foodSlider) {
        foodCount = parseInt(foodSlider.value);
    }

    // Update fruit disappear setting
    const fruitDisappearToggle = document.getElementById('fruitDisappearToggle');
    if (fruitDisappearToggle) {
        fruitDisappearEnabled = fruitDisappearToggle.checked;
    }

    // Update speed increase setting
    const speedIncreaseToggle = document.getElementById('speedIncreaseToggle');
    if (speedIncreaseToggle) {
        speedIncreaseEnabled = speedIncreaseToggle.checked;
    }
    
    // Update enemy setting
    const enemyToggle = document.getElementById('enemyToggle');
    if (enemyToggle) {
        enemyEnabled = enemyToggle.checked;
    }
    
    // Reset the game speed to base value when starting a new game
    gameSpeed = baseGameSpeed;
    
    // Reset speed display to 0
    document.getElementById('currentSpeed').textContent = '0';
}

function updateGridSize(newSize) {
    // Ensure grid size evenly divides canvas dimensions
    if (canvasWidth % newSize !== 0 || canvasHeight % newSize !== 0) {
        // Find nearest valid size that divides evenly
        let validSizes = [];
        for (let i = 1; i <= 50; i++) {
            if (canvasWidth % i === 0 && canvasHeight % i === 0) {
                validSizes.push(i);
            }
        }

        // Find closest valid size
        let closestSize = validSizes.reduce((prev, curr) => {
            return (Math.abs(curr - newSize) < Math.abs(prev - newSize) ? curr : prev);
        });

        // Update the slider to the valid value
        document.getElementById('gridSizeSlider').value = closestSize;
        document.getElementById('gridSizeValue').textContent = closestSize;
        newSize = closestSize;
    }

    gridSize = newSize;

    // If game is running, reset it with new grid size
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;

        // Reset game with new grid size
        isPaused = false;
        document.getElementById('pauseBtn').innerText = 'Pause';
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('startBtn').innerText = 'Reset';

        // Update settings before starting game
        updateSettingsFromUI();

        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

function updateGameSpeed(value) {
    // Convert slider value (1-10) to actual game speed
    // 1 = slow (400ms), 10 = fast (100ms)
    baseGameSpeed = 500 - (value * 40);

    // Only update the active game speed if game is running and not in initial state
    if (gameInterval && !initializing) {
        gameSpeed = baseGameSpeed;
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}