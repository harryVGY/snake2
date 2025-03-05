// main.js - Huvudfilen som knyter samman spelet

// Variabel för att hålla koll på om spelet är pausat
let isPaused = false;

// Initierar spelkontrollen när sidan laddats
document.addEventListener('DOMContentLoaded', () => {
    // Om canvasContext inte är initierat än, gör det här
    if (!ctx) {
        console.error("Canvas context not available!");
        return;
    }

    // Event listener för start/reset-knapp - startar alltid ett nytt spel
    document.getElementById('startBtn').addEventListener('click', () => {
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
        // Only allow pausing if the game is running
        if (gameInterval || isPaused) {
            togglePause();
        }
    });

    // Event listener för tangenttryckningar
    document.addEventListener('keydown', changeDirection);

    // Inaktivera pausknappen i början
    document.getElementById('pauseBtn').disabled = true;

    // Visa startskärmen
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake Game', canvasWidth/2, canvasHeight/3);
    ctx.font = '16px Arial';
    ctx.fillText('Press Start to begin', canvasWidth/2, canvasHeight/2);
    ctx.fillText('Use arrow keys or WASD to control', canvasWidth/2, canvasHeight/2 + 30);
});