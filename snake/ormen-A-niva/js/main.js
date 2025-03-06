// main.js - Huvudfilen som knyter samman spelet

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

    // Event listener för start/reset-knapp - startar alltid ett nytt spel
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

        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
        document.getElementById('startBtn').innerText = 'Reset';
    });

    // Event listener för paus-knapp
    document.getElementById('pauseBtn').addEventListener('click', () => {
        // Existing code...
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
        
        // Only allow changing grid size when game is not running
        gridSlider.addEventListener('change', function() {
            if (!gameInterval) {
                // Redraw start screen code...
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

// Function to update grid size
function updateGridSize(newSize) {
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
        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}