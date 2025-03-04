// Hämtar canvas-elementet och dess kontext för ritning
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Grundläggande spelinställningar
const gridSize = 20;                 // Storlek på rutnätet
const canvasWidth = canvas.width;    // Canvas bredd
const canvasHeight = canvas.height;  // Canvas höjd

// Spelvariabler
let snake = [];                      // Array som håller ormens delar
let initialSnakeLength = 3;          // Startlängd på ormen
let direction = 'right';             // Startrikting
let nextDirection = direction;       // Nästa riktning (för att undvika 180° svängar)
let food = { x: 0, y: 0 };           // Matens position
let score = 0;                       // Poängräknare
let gameSpeed = 70;                  // Hastighet i millisekunder
let gameInterval = null;             // Interval för spelloop

// Laddar bild för maten
const foodImage = new Image();
foodImage.src = "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwebstockreview.net%2Fimages%2Fclipart-apple-teacher-18.png&f=1&nofb=1&ipt=bfca2954465fd19367e55222130aa12477bdfb6a8e057184fe10728b96b11685&ipo=images";

// Initierar spelet med startposition och inställningar
function initGame() {
    snake = [];
    const startX = Math.floor(canvasWidth / (2 * gridSize)) * gridSize;  // Centrerar ormen horisontellt
    const startY = Math.floor(canvasHeight / (2 * gridSize)) * gridSize; // Centrerar ormen vertikalt
    for (let i = 0; i < initialSnakeLength; i++) {
        snake.push({ x: startX - i * gridSize, y: startY });  // Skapar ormens kropp
    }
    placeFood();  // Placerar första maten
    score = 0;    // Nollställer poäng
    updateCanvas();
}

// Placerar maten på en slumpmässig position
function placeFood() {
    food.x = Math.floor(Math.random() * (canvasWidth / gridSize)) * gridSize;
    food.y = Math.floor(Math.random() * (canvasHeight / gridSize)) * gridSize;
}

// Rensar och uppdaterar canvas
function updateCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawSnake();
    drawFood();
}

// Ritar ormen där huvudet är mörkgrönt och kroppen grön
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? 'darkgreen' : 'green';
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

// Ritar maten med bild eller röd fyrkant om bilden inte är laddad
function drawFood() {
    if (foodImage.complete) {
        ctx.drawImage(foodImage, food.x, food.y, gridSize, gridSize);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x, food.y, gridSize, gridSize);
        foodImage.onload = function() {
            updateCanvas();
        };
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
    
    snake.unshift(head);  // Lägger till nytt huvud i början
    
    // Om ormen äter mat: öka poäng och placera ny mat
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();  // Tar bort svansen om ingen mat äts
    }
}

// Spelets huvudloop
function gameLoop() {
    direction = nextDirection;  // Uppdaterar riktning
    moveSnake();
    updateCanvas();
}

// Event listener för start/paus-knapp
document.getElementById('startBtn').addEventListener('click', () => {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
        document.getElementById('startBtn').innerText = 'Start';
    } else {
        initGame();
        gameInterval = setInterval(gameLoop, gameSpeed);
        document.getElementById('startBtn').innerText = 'Pause';
    }
});

// Event listener för tangenttryckningar
document.addEventListener('keydown', changeDirection);