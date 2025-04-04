import { app, TextureArray, numberOfRows, numberOfColumns, cellSize } from './Config.js';

async function initImageSection() {
    try {
        // Create a container for the image section
        const imageContainer = new PIXI.Container();
        imageContainer.x = 310;  // Position from left
        imageContainer.y = 0;    // Position from top
        imageContainer.eventMode = 'static';

        // Load the background
        const backgroundTexture = await PIXI.Assets.load('assets/bg_blue.png');
        const backgroundImage = new PIXI.Sprite(backgroundTexture);
        backgroundImage.width = 650;
        backgroundImage.height = 540;
        imageContainer.addChild(backgroundImage);

        // Create a container for the grid
        const gridContainer = new PIXI.Container();
        gridContainer.x = 0;
        gridContainer.y = 0;

        // Store sprites in a 2D array for easy access
        const spriteGrid = Array(numberOfRows).fill().map(() => Array(numberOfColumns).fill(null));

        // Create grid from loaded textures
        for (let row = 0; row < numberOfRows; row++) {
            for (let col = 0; col < numberOfColumns; col++) {
                const cellSprite = TextureArray[0][row][col];
                if (cellSprite) {
                    // Initially hide the sprite
                    cellSprite.visible = false;                 
                    gridContainer.addChild(cellSprite);
                    spriteGrid[row][col] = cellSprite;
                } else {
                    console.warn(`Missing texture at position [0][${row}][${col}]`);
                }
            }
        }

        // Create selection rectangle
        const selectionRect = new PIXI.Graphics();
        selectionRect.alpha = 0.5;
        gridContainer.addChild(selectionRect);

        // Variables to track selection
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        // Make grid container interactive
        gridContainer.eventMode = 'static';
        gridContainer.hitArea = new PIXI.Rectangle(0, 0, numberOfColumns * cellSize, numberOfRows * cellSize);

        // Mouse down event
        gridContainer.on('pointerdown', (event) => {
            isDragging = true;
            const pos = event.getLocalPosition(gridContainer);
            startX = pos.x;
            startY = pos.y;
            endX = startX;
            endY = startY;
            
            // Snap to grid
            startX = Math.floor(startX / cellSize) * cellSize;
            startY = Math.floor(startY / cellSize) * cellSize;
            
            // Clear previous selection
            selectionRect.clear();
        });

        // Mouse move event
        gridContainer.on('pointermove', (event) => {
            if (isDragging) {
                const pos = event.getLocalPosition(gridContainer);
                endX = pos.x;
                endY = pos.y;
                
                // Snap to grid
                endX = Math.floor(endX / cellSize) * cellSize + cellSize;
                endY = Math.floor(endY / cellSize) * cellSize + cellSize;
                
                // Draw selection rectangle
                selectionRect.clear();
                selectionRect.beginFill(0x00FF00, 0.2);  // Semi-transparent green
                selectionRect.lineStyle(2, 0x00FF00);    // Green border
                
                const x = Math.min(startX, endX);
                const y = Math.min(startY, endY);
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);
                
                selectionRect.drawRect(x, y, width, height);
                selectionRect.endFill();
            }
        });

        // Mouse up event
        gridContainer.on('pointerup', () => {
            isDragging = false;
            selectionRect.clear();
            
            // Calculate selected cells
            const startCol = Math.floor(Math.min(startX, endX) / cellSize);
            const startRow = Math.floor(Math.min(startY, endY) / cellSize);
            const endCol = Math.floor(Math.max(startX, endX) / cellSize);
            const endRow = Math.floor(Math.max(startY, endY) / cellSize);
            
            // Show and color sprites in the selection area
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                    if (row >= 0 && row < numberOfRows && col >= 0 && col < numberOfColumns) {
                        const sprite = spriteGrid[row][col];
                        if (sprite) {
                            sprite.visible = true;
                            //sprite.tint = Math.random() * 0xFFFFFF; // Random color for each sprite
                        }
                    }
                }
            }

            console.log('Revealed area:', {
                startRow,
                startCol,
                endRow,
                endCol,
                width: endCol - startCol,
                height: endRow - startRow
            });
        });

        // Mouse out event
        gridContainer.on('pointerupoutside', () => {
            isDragging = false;
        });

        // Add grid container to image container
        imageContainer.addChild(gridContainer);
        
        // Add the container to the stage
        app.stage.addChild(imageContainer);

    } catch (error) {
        console.error('Error initializing image section:', error);
    }
}

export { initImageSection };