// Laddar bilder för maten - använd lokala bilder eller färger som fallback
// Definiera lokala fallback-färger
const foodColors = ['red', 'yellow', 'purple', 'green'];

// Snake body image with proper error handling
const snakeBodyImage = new Image();
snakeBodyImage.src = 'images/snake_body.png';

// Add explicit error handler
snakeBodyImage.onerror = function() {
    console.log("Snake body image failed to load, will use fallback color");
};

// Add this to the file to load the snake head image
const snakeHeadImage = new Image();
snakeHeadImage.src = 'images/snake_head.jpg';
snakeHeadImage.onerror = function() {
    console.log("Snake head image failed to load, will use fallback color");
};

// Skapa en funktion för att generera bilder med fallback
function createFruitImages() {
    // Försök ladda bilder
    const appleImage = new Image();
    appleImage.src = 'images/apple.png';

    const bananaImage = new Image();
    bananaImage.src = 'images/banana.png';

    const blueberryImage = new Image();
    blueberryImage.src = 'images/blueberry.png';

    const pearImage = new Image();
    pearImage.src = 'images/pear.png';

    const images = [appleImage, bananaImage, blueberryImage, pearImage];

    // Lägg till felhantering för bilder
    images.forEach((img, index) => {
        img.onerror = function() {
            console.log(`Image ${img.src} failed to load, using color fallback`);
            // Skapa en färgad ruta istället
            const canvas = document.createElement('canvas');
            canvas.width = 20;
            canvas.height = 20;
            const tempCtx = canvas.getContext('2d');
            tempCtx.fillStyle = foodColors[index];
            tempCtx.fillRect(0, 0, 20, 20);

            // Lägg till en border
            tempCtx.strokeStyle = 'white';
            tempCtx.lineWidth = 1;
            tempCtx.strokeRect(1, 1, 18, 18);

            // Ersätt originalet med den genererade bilden
            const newImg = new Image();
            newImg.src = canvas.toDataURL();
            images[index] = newImg;
        };
    });

    return images; // Returnera bilderna
}

// Initiera bilderna
const foodImages = createFruitImages();

// Returnerar en slumpmässig fruktbild
function randomizeFruit() {
    const randomIndex = Math.floor(Math.random() * foodImages.length);
    return foodImages[randomIndex];
}