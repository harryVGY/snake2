// Canvas and game area settings
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gridSize = 25; // Variable that can be changed
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Game variables
let snake = [];
let initialSnakeLength = 3;
let direction = 'right';
let nextDirection = direction;
let food = []; // Array to support multiple food items
let score = 0;
let baseGameSpeed = 200; // Base speed value - higher is slower
let maxSpeed = 50;       // Maximum speed (minimum delay)
let gameSpeed = baseGameSpeed; // Current speed
let gameInterval = null;
let obstacles = []; // Array for all obstacles
let moveQueue = []; // Queue for fast moves
let initializing = true; // Flag to track if game is in initialization state
let isPaused = false; // Track pause state

// FOOD-RELATED CONSTANTS
let foodCount = 5;             // Amount of food on the board at once
let fruitDisappearEnabled = true;  // Whether fruits disappear after a while
let fruitDisappearTime = 7_000;     // Time in ms before a fruit starts to disappear
const fruitFadeTime = 500;           // Time for fade-out animation in ms

// ANIMATION-RELATED CONSTANTS
let animationTime = 0;          // Global animation time tracker
const ANIMATION_PULSE_SPEED = 300; // Controls speed of pulsing animation

// GAME MODIFIERS/SETTINGS
let obstaclesEnabled = true;   // Enable/disable obstacles
let largeObstaclesEnabled = true; // Use clustered obstacles
let speedIncreaseEnabled = true; // Enable speed increase on food collection
const speedIncreasePerFood = 5;    // How much delay to reduce per food
let enemyEnabled = false;       // Enable/disable enemy snake

// Enemy snake settings
let enemySnake = [];
let enemyDirection = 'left';
let enemySpeed = 8;
let enemyMoveCounter = 0;
let enemyLength = 3; // Initial enemy length

// Highscore system
let highScores = []; // Array to store high scores
const MAX_HIGH_SCORES = 5; // Number of high scores to keep
const HIGH_SCORES_KEY = 'snakeHighScores'; // Local storage key for high scores