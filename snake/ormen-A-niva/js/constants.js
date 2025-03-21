// Canvas and game area settings
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gridSize = 25; // Now a variable that can be changed
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
let gameSpeed = baseGameSpeed; // Current speed
let gameInterval = null;
let obstacles = []; // Array for all obstacles
let moveQueue = []; // Queue for fast moves
let initializing = true; // Flag to track if game is in initialization state

// Game settings
let obstaclesEnabled = true;
let foodCount = 1;
let speedIncreasePerFood = 5; // Speed increase per food item eaten
let maxSpeed = 50; // Maximum speed (minimum delay)