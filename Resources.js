import { app, TextureArray, folderPaths, numberOfRows, numberOfColumns, cellSize } from './Config.js';

async function downloadAndExtractZip(zipUrl) {
    let loadingText = null;
    try {
        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library is not loaded. Please check your script includes.');
        }

        console.log('Downloading textures...', zipUrl);
        // Show loading text
        loadingText = new PIXI.Text('Downloading textures...', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        loadingText.anchor.set(0.5);
        loadingText.x = app.screen.width / 2;
        loadingText.y = app.screen.height / 2;
        app.stage.addChild(loadingText);

        // Download the zip file
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error(`Failed to download zip file: ${response.status} ${response.statusText}`);
        }
        console.log('Zip file downloaded, getting array buffer...');
        const zipData = await response.arrayBuffer();
        console.log('Array buffer received, size:', zipData.byteLength);
        
        // Load zip data
        console.log('Creating new JSZip instance...');
        const zip = new JSZip();
        console.log('Loading zip data...');
        await zip.loadAsync(zipData);
        console.log('Zip loaded successfully');

        const texturePromises = [];
        const textureMap = new Map();

        // Process each file in the zip
        const files = Object.entries(zip.files);
        console.log('Found files in zip:', files.length);
        
        for (const [filename, file] of files) {
            console.log('Processing file:', filename);
            if (!file.dir && filename.endsWith('.png')) {
                const promise = file.async('blob').then(async (blob) => {
                    console.log('Extracted blob for:', filename, 'size:', blob.size);
                    
                    // Create an image element
                    const img = new Image();
                    const objectUrl = URL.createObjectURL(blob);
                    
                    // Extract row and column from filename
                    const match = filename.match(/tile_(\d+)_(\d+)\.png$/);
                    if (match) {
                        const row = parseInt(match[1]);
                        const col = parseInt(match[2]);
                        console.log(`Processing texture ${filename} for position [${row}][${col}]`);
                        
                        // Create a promise that resolves when the image loads
                        const imageLoadPromise = new Promise((resolve, reject) => {
                            img.onload = () => {
                                // Create a canvas and draw the image
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                
                                // Create PIXI texture from canvas
                                const texture = PIXI.Texture.from(canvas);
                                
                                // Create and configure sprite
                                const sprite = new PIXI.Sprite(texture);
                                sprite.width = cellSize;
                                sprite.height = cellSize;
                                sprite.x = col * cellSize;
                                sprite.y = row * cellSize;
                                
                                // Store in texture array
                                TextureArray[0][row][col] = sprite;
                                
                                // Clean up
                                URL.revokeObjectURL(objectUrl);
                                resolve();
                            };
                            
                            img.onerror = () => {
                                URL.revokeObjectURL(objectUrl);
                                reject(new Error(`Failed to load image for ${filename}`));
                            };
                        });
                        
                        // Set the image source to start loading
                        img.src = objectUrl;
                        return imageLoadPromise;
                    } else {
                        console.warn('Invalid filename format:', filename);
                        URL.revokeObjectURL(objectUrl);
                    }
                }).catch(error => {
                    console.error('Error processing file:', filename, error);
                });
                
                texturePromises.push(promise);
            }
        }

        // Wait for all files to be processed
        console.log('Waiting for all textures to be processed...');
        await Promise.all(texturePromises.filter(p => p)); // Filter out undefined promises
        console.log('All textures processed');
        
        // Remove loading text
        if (loadingText && loadingText.parent) {
            app.stage.removeChild(loadingText);
        }

        return true;
    } catch (error) {
        console.error('Error downloading or extracting zip:', error);
        if (loadingText && loadingText.parent) {
            app.stage.removeChild(loadingText);
        }
        throw error;
    }
}

async function LoadTextures() {
    try {
        // Create loading text
        const loadingText = new PIXI.Text('Initializing...', {
            fontFamily: 'Arial',
            fontSize: 24,
            fill: 0xFFFFFF,
            align: 'center'
        });
        loadingText.anchor.set(0.5);
        loadingText.x = app.screen.width / 2;
        loadingText.y = app.screen.height / 2;
        app.stage.addChild(loadingText);

        // Process each texture folder
        for (const folderPath of folderPaths) {
            const zipUrl = `${folderPath}/textures.zip`;
            await downloadAndExtractZip(zipUrl);
        }

        // Remove loading text
        if (loadingText && loadingText.parent) {
            app.stage.removeChild(loadingText);
        }

        return {
            success: true,
            message: 'All textures loaded successfully'
        };

    } catch (error) {
        console.error('Error in LoadTextures:', error);
        throw error;
    }
}

export { LoadTextures };