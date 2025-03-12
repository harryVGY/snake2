// Variabel för att hålla koll på om spelet är pausat
let isPaused = false;

// Initierar spelkontrollen när sidan laddats
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");

    // Check that everything is initialized
    if (!ctx) {
        console.error("Canvas context not available!");
        return;
    }

    // Event listener för start/reset-knapp
    document.getElementById('startBtn').addEventListener('click', () => {
        console.log("Start button clicked");
        // Oavsett om spelet körs eller är pausat, starta ett nytt spel
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }

        isPaused = false;
        document.getElementById('pauseBtn').innerText = 'Pause';
        document.getElementById('pauseBtn').disabled = false;

        // Update settings before starting game
        updateSettingsFromUI();

        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
        document.getElementById('startBtn').innerText = 'Reset';
    });

    // Event listener för paus-knapp
    document.getElementById('pauseBtn').addEventListener('click', () => {
        // Only allow pausing if the game is running
        if (gameInterval || isPaused) {
            togglePause();
        }
    });

    // Event listener för tangenttryckningar
    document.addEventListener('keydown', changeDirection);

    // Inaktivera pausknappen i början
    document.getElementById('pauseBtn').disabled = true;

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

    // Visa startskärmen
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake Game', canvasWidth/2, canvasHeight/3);
    ctx.font = '16px Arial';
    ctx.fillText('Press Start to begin', canvasWidth/2, canvasHeight/2);
    ctx.fillText('Use arrow keys or WASD to control', canvasWidth/2, canvasHeight/2 + 30);
});

// Function to update settings from UI controls
function updateSettingsFromUI() {
    // Update obstacles setting
    const obstaclesToggle = document.getElementById('obstaclesToggle');
    if (obstaclesToggle) {
        obstaclesEnabled = obstaclesToggle.checked;
    }

    // Update food count setting
    const foodSlider = document.getElementById('foodCountSlider');
    if (foodSlider) {
        foodCount = parseInt(foodSlider.value);
    }
}

// Update the existing updateGridSize function with this improved version
// Replace the whole function in main.js
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