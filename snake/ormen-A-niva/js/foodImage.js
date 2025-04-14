// Image loading for food
const foodColors = ['red', 'yellow', 'purple', 'green'];

// Snake body image
const snakeBodyImage = new Image();
snakeBodyImage.src = 'images/snake_body.png';

// Error handler
snakeBodyImage.onerror = function() {
    console.log("Snake body image failed to load, will use fallback color");
};

// Snake head image
const snakeHeadImage = new Image();
snakeHeadImage.src = 'images/snake_head.jpg';
snakeHeadImage.onerror = function() {
    console.log("Snake head image failed to load, will use fallback color");
};

// image fruit function with fallback
function createFruitImages() {
    const appleImage = new Image();
    appleImage.src = 'images/apple.png';

    const bananaImage = new Image();
    bananaImage.src = 'images/banana.png';

    const blueberryImage = new Image();
    blueberryImage.src = 'images/blueberry.png';

    const pearImage = new Image();
    pearImage.src = 'images/pear.png';

    const images = [appleImage, bananaImage, blueberryImage, pearImage];

    // Error handling
    images.forEach((img, index) => {
        img.onerror = function() {
            console.log(`Image ${img.src} failed to load, using color fallback`);
            // Create a colored square as a fallback
            const canvas = document.createElement('canvas');
            canvas.width = 20;
            canvas.height = 20;
            const tempCtx = canvas.getContext('2d');
            tempCtx.fillStyle = foodColors[index];
            tempCtx.fillRect(0, 0, 20, 20);
            tempCtx.strokeStyle = 'white';
            tempCtx.lineWidth = 1;
            tempCtx.strokeRect(1, 1, 18, 18);

            // Replace the image with the colored square
            const newImg = new Image();
            newImg.src = canvas.toDataURL();
            images[index] = newImg;
        };
    });

    return images;
}

const foodImages = createFruitImages();

// Function to get a random fruit image
function randomizeFruit() {
    const randomIndex = Math.floor(Math.random() * foodImages.length);
    return foodImages[randomIndex];
}