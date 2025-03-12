// Canvas och spelytans inställningar
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gridSize = 25; // Now a variable that can be changed
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Spelvariabler
let snake = [];
let initialSnakeLength = 3;
let direction = 'right';
let nextDirection = direction;
let food = [{ x: 0, y: 0, image: null }]; // Changed to array to support multiple food items
let score = 0;
let gameSpeed = 200; // uppdateringar per sekund, högre är långsammare
let gameInterval = null;
let obstacles = []; // Array för att hålla alla hinder

// Game settings
let obstaclesEnabled = true;
let foodCount = 1;