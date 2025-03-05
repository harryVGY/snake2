// Canvas och spelytans inställningar
// inte bara konstanter, utan även variabler och listor. 
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 25;
// antalet rutor på en rad är canvasens bredd delat med rutstorleken
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Spelvariabler
let snake = [];
let initialSnakeLength = 3;
let direction = 'right';
let nextDirection = direction;
let food = { x: 0, y: 0, image: null };
let score = 0;
let gameSpeed = 100; // uppdateringar per sekund, högre är långsammare
let gameInterval = null;
let obstacles = []; // Array för att hålla alla hinder