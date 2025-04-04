import { app, TextureArray, folderPaths, numberOfRows, numberOfColumns, cellSize } from './Config.js';

// Helper function to load a single image with retries
async function loadImageWithRetry(imageUrl, maxRetries = 3, retryDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await PIXI.Assets.load(imageUrl);
        } catch (error) {
            console.warn(`Attempt ${attempt} failed to load ${imageUrl}:`, error);
            if (attempt === maxRetries) {
                throw error;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
}

async function LoadTextures() {
    const totalImages = numberOfRows * numberOfColumns * folderPaths.length;
    let loadedCount = 0;
    let failedImages = [];

    // Create loading text
    const loadingText = new PIXI.Text('Loading... 0%', {
        fontFamily: 'Arial',
        fontSize: 24,
        fill: 0xFFFFFF,
        align: 'center'
    });
    loadingText.anchor.set(0.5);
    loadingText.x = app.screen.width / 2;
    loadingText.y = app.screen.height / 2;
    app.stage.addChild(loadingText);

    // Create loading bar container
    const barWidth = 200;
    const barHeight = 20;
    const loadingBarBg = new PIXI.Graphics();
    loadingBarBg.beginFill(0x666666);
    loadingBarBg.drawRect(-barWidth/2, 20, barWidth, barHeight);
    loadingBarBg.endFill();
    loadingBarBg.x = app.screen.width / 2;
    loadingBarBg.y = app.screen.height / 2;
    app.stage.addChild(loadingBarBg);

    // Create loading bar progress
    const loadingBar = new PIXI.Graphics();
    loadingBar.x = app.screen.width / 2 - barWidth/2;
    loadingBar.y = app.screen.height / 2 + 20;
    app.stage.addChild(loadingBar);

    try {
        // Create a flat array of all loading promises
        const loadingPromises = folderPaths.flatMap((folderPath, folderIndex) =>
            Array.from({ length: numberOfRows }, (_, row) =>
                Array.from({ length: numberOfColumns }, async (_, col) => {
                    const imageUrl = `${folderPath}/tile_${row}_${col}.png`;
                    
                    try {
                        // Try to load the image with retries
                        const cellTexture = await loadImageWithRetry(imageUrl);

                        // Create and configure the sprite
                        const cellImage = new PIXI.Sprite(cellTexture);
                        cellImage.width = cellSize;
                        cellImage.height = cellSize;
                        cellImage.x = col * cellSize;
                        cellImage.y = row * cellSize;
                        
                        // Store in the texture array
                        TextureArray[folderIndex][row][col] = cellImage;
                        
                        // Update loading progress
                        loadedCount++;
                        const progress = (loadedCount / totalImages) * 100;
                        loadingText.text = `Loading... ${Math.floor(progress)}%`;
                        
                        // Update loading bar
                        loadingBar.clear();
                        loadingBar.beginFill(0x00FF00);
                        loadingBar.drawRect(0, 0, (progress/100) * barWidth, barHeight);
                        loadingBar.endFill();
                        
                        console.log(`Loaded ${loadedCount}/${totalImages}: ${imageUrl}`);
                        
                    } catch (error) {
                        failedImages.push({ folderIndex, row, col, imageUrl });
                        console.error(`Failed to load ${imageUrl} after all retries:`, error);
                    }
                })
            )
        ).flat();

        // Wait for all images to finish loading
        await Promise.all(loadingPromises);

        // Remove loading elements
        app.stage.removeChild(loadingText);
        app.stage.removeChild(loadingBarBg);
        app.stage.removeChild(loadingBar);

        // Report loading results
        console.log(`Loading complete. Successfully loaded: ${loadedCount}/${totalImages}`);
        if (failedImages.length > 0) {
            console.warn('Failed to load the following images:', failedImages);
        }

        return {
            success: loadedCount === totalImages,
            loadedCount,
            totalImages,
            failedImages
        };

    } catch (error) {
        console.error('Error in LoadTextures:', error);
        // Remove loading elements even if there's an error
        app.stage.removeChild(loadingText);
        app.stage.removeChild(loadingBarBg);
        app.stage.removeChild(loadingBar);
        throw error;
    }
}

export { LoadTextures };