import { app, TextureArray, numberOfRows, numberOfColumns, cellSize, stageSize, stageHeight, GridCell, gridCells, DragDirection } from './Config.js';
import { getRandomSelectionRect } from './Utils.js';

async function initImageSection() {
    try {

        const DirectionalTextureArray = {
            TopToBottomRight: TextureArray[0],
            TopToBottomLeft: TextureArray[1],
            BottomToTopRight: TextureArray[2],
            BottomToTopLeft: TextureArray[3]
        };

        let currentDragDirection;

        // Helper function to update sprite's corner mask
        const updateSpriteCornerMask = (sprite, row, col, isCorner, cornerPosition) => {
            // Remove any existing mask
            if (sprite.mask) {
                sprite.mask.destroy();
                sprite.mask = null;
            }

            if (isCorner) {
                const cornerRadius = 15;
                const mask = new PIXI.Graphics();
                mask.beginFill(0xFFFFFF);
                
                // Create path for rounded corner only at specific corner
                switch(cornerPosition) {
                    case 'topLeft':
                        mask.moveTo(sprite.x + cornerRadius, sprite.y);
                        mask.arcTo(sprite.x, sprite.y, sprite.x, sprite.y + cornerRadius, cornerRadius);
                        mask.lineTo(sprite.x, sprite.y + cellSize);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize);
                        mask.lineTo(sprite.x + cellSize, sprite.y);
                        break;
                    case 'topRight':
                        mask.moveTo(sprite.x, sprite.y);
                        mask.lineTo(sprite.x + cellSize - cornerRadius, sprite.y);
                        mask.arcTo(sprite.x + cellSize, sprite.y, sprite.x + cellSize, sprite.y + cornerRadius, cornerRadius);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize);
                        mask.lineTo(sprite.x, sprite.y + cellSize);
                        break;
                    case 'bottomLeft':
                        mask.moveTo(sprite.x, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize);
                        mask.lineTo(sprite.x + cornerRadius, sprite.y + cellSize);
                        mask.arcTo(sprite.x, sprite.y + cellSize, sprite.x, sprite.y + cellSize - cornerRadius, cornerRadius);
                        break;
                    case 'bottomRight':
                        mask.moveTo(sprite.x, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize - cornerRadius);
                        mask.arcTo(sprite.x + cellSize, sprite.y + cellSize, sprite.x + cellSize - cornerRadius, sprite.y + cellSize, cornerRadius);
                        mask.lineTo(sprite.x, sprite.y + cellSize);
                        break;
                }
                mask.closePath();
                mask.endFill();
                sprite.mask = mask;
                gridContainer.addChild(mask);
            }

            return sprite;
        };

        // Helper function to create sprite with optional corner masking
        const createSpriteWithMask = (texture, row, col, isCorner, cornerPosition) => {
            const sprite = new PIXI.Sprite(texture);
            sprite.width = cellSize;
            sprite.height = cellSize;
            sprite.x = col * cellSize;
            sprite.y = row * cellSize;

            if (isCorner) {
                const cornerRadius = 15;
                const mask = new PIXI.Graphics();
                mask.beginFill(0xFFFFFF);
                
                // Create path for rounded corner only at specific corner
                switch(cornerPosition) {
                    case 'topLeft':
                        mask.moveTo(sprite.x + cornerRadius, sprite.y);
                        mask.arcTo(sprite.x, sprite.y, sprite.x, sprite.y + cornerRadius, cornerRadius);
                        mask.lineTo(sprite.x, sprite.y + cellSize);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize);
                        mask.lineTo(sprite.x + cellSize, sprite.y);
                        break;
                    case 'topRight':
                        mask.moveTo(sprite.x, sprite.y);
                        mask.lineTo(sprite.x + cellSize - cornerRadius, sprite.y);
                        mask.arcTo(sprite.x + cellSize, sprite.y, sprite.x + cellSize, sprite.y + cornerRadius, cornerRadius);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize);
                        mask.lineTo(sprite.x, sprite.y + cellSize);
                        break;
                    case 'bottomLeft':
                        mask.moveTo(sprite.x, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize);
                        mask.lineTo(sprite.x + cornerRadius, sprite.y + cellSize);
                        mask.arcTo(sprite.x, sprite.y + cellSize, sprite.x, sprite.y + cellSize - cornerRadius, cornerRadius);
                        break;
                    case 'bottomRight':
                        mask.moveTo(sprite.x, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y);
                        mask.lineTo(sprite.x + cellSize, sprite.y + cellSize - cornerRadius);
                        mask.arcTo(sprite.x + cellSize, sprite.y + cellSize, sprite.x + cellSize - cornerRadius, sprite.y + cellSize, cornerRadius);
                        mask.lineTo(sprite.x, sprite.y + cellSize);
                        break;
                }
                mask.closePath();
                mask.endFill();
                sprite.mask = mask;
                gridContainer.addChild(mask);
            }

            return sprite;
        };

        // Track positions of recently added cells
        let recentlyAddedCells = [];

        // Helper function to add random cells around selection
        const addRandomCellsAroundSelection = (startRow, startCol, endRow, endCol) => {
            const numCells = Math.floor(Math.random() * 2) + 2; // Random number between 2-3
            const positions = [];
            recentlyAddedCells = []; // Reset the tracking array
            
            // Get all possible positions around the selection
            for (let row = startRow - 1; row <= endRow + 1; row++) {
                for (let col = startCol - 1; col <= endCol + 1; col++) {
                    // Skip if position is:
                    // 1. Inside selection
                    // 2. Out of bounds
                    // 3. At or adjacent to corners
                    const isCornerOrAdjacent = (
                        // Top-left corner and adjacent positions
                        (row === startRow - 1 && col === startCol - 1) || // corner
                        (row === startRow - 1 && col === startCol) ||     // top adjacent
                        (row === startRow && col === startCol - 1) ||     // left adjacent
                        
                        // Top-right corner and adjacent positions
                        (row === startRow - 1 && col === endCol + 1) ||   // corner
                        (row === startRow - 1 && col === endCol) ||       // top adjacent
                        (row === startRow && col === endCol + 1) ||       // right adjacent
                        
                        // Bottom-left corner and adjacent positions
                        (row === endRow + 1 && col === startCol - 1) ||   // corner
                        (row === endRow + 1 && col === startCol) ||       // bottom adjacent
                        (row === endRow && col === startCol - 1) ||       // left adjacent
                        
                        // Bottom-right corner and adjacent positions
                        (row === endRow + 1 && col === endCol + 1) ||     // corner
                        (row === endRow + 1 && col === endCol) ||         // bottom adjacent
                        (row === endRow && col === endCol + 1)            // right adjacent
                    );

                    if (row >= 0 && row < numberOfRows && 
                        col >= 0 && col < numberOfColumns &&
                        !(row >= startRow && row <= endRow && col >= startCol && col <= endCol) &&
                        !isCornerOrAdjacent) {
                        positions.push({row, col});
                    }
                }
            }

            // Randomly select positions
            for (let i = 0; i < numCells && positions.length > 0; i++) {
                const randomIndex = Math.floor(Math.random() * positions.length);
                const {row, col} = positions.splice(randomIndex, 1)[0];
                
                const originalSprite = DirectionalTextureArray[currentDragDirection][row][col];
                if (originalSprite) {
                    const newSprite = new PIXI.Sprite(originalSprite.texture);
                    newSprite.width = cellSize;
                    newSprite.height = cellSize;
                    newSprite.x = col * cellSize;
                    newSprite.y = row * cellSize;
                    
                    const cell = new GridCell(row, col, newSprite);
                    gridCells.push(cell);
                    gridContainer.addChild(newSprite);
                    recentlyAddedCells.push({row, col}); // Track the added cell
                }
            }
        };

        // Helper function to remove a random cell from the selection edge
        const removeRandomCellAroundSelection = (startRow, startCol, endRow, endCol) => {
            const positions = [];
            
            // Get all edge positions inside the selection area
            for (let row = startRow; row <= endRow; row++) {
                for (let col = startCol; col <= endCol; col++) {
                    // Check if the position is on the edge of selection (inside)
                    const isEdge = (
                        row === startRow || // top edge
                        row === endRow ||   // bottom edge
                        col === startCol || // left edge
                        col === endCol      // right edge
                    );

                    // Skip corners
                    const isCorner = (
                        (row === startRow && col === startCol) || // top-left
                        (row === startRow && col === endCol) ||   // top-right
                        (row === endRow && col === startCol) ||   // bottom-left
                        (row === endRow && col === endCol)        // bottom-right
                    );

                    if (isEdge && !isCorner) {
                        // Check for cells in adjacent positions based on which edge we're on
                        let hasAdjacentCell = false;

                        if (row === startRow) { // Top edge
                            // Check for cell above
                            hasAdjacentCell = gridCells.some(cell => 
                                cell.row === row - 1 && cell.col === col
                            );
                        } else if (row === endRow) { // Bottom edge
                            // Check for cell below
                            hasAdjacentCell = gridCells.some(cell => 
                                cell.row === row + 1 && cell.col === col
                            );
                        } else if (col === startCol) { // Left edge
                            // Check for cell to the left
                            hasAdjacentCell = gridCells.some(cell => 
                                cell.row === row && cell.col === col - 1
                            );
                        } else if (col === endCol) { // Right edge
                            // Check for cell to the right
                            hasAdjacentCell = gridCells.some(cell => 
                                cell.row === row && cell.col === col + 1
                            );
                        }

                        // Only add position if there's no adjacent cell in the direction we're checking
                        if (!hasAdjacentCell) {
                            // Find the cell at this position
                            const cellToRemove = gridCells.find(cell => cell.row === row && cell.col === col);
                            if (cellToRemove) {
                                positions.push({row, col, cell: cellToRemove});
                            }
                        }
                    }
                }
            }

            // Randomly select one position to remove
            if (positions.length > 0) {
                const randomIndex = Math.floor(Math.random() * positions.length);
                const {row, col, cell} = positions[randomIndex];
                
                // Remove the sprite from the container
                if (cell.sprite) {
                    gridContainer.removeChild(cell.sprite);
                    // Remove the cell from gridCells array
                    const cellIndex = gridCells.indexOf(cell);
                    if (cellIndex > -1) {
                        gridCells.splice(cellIndex, 1);
                    }

                    // Determine if the removed cell is on horizontal or vertical edge
                    const isHorizontalEdge = row === startRow || row === endRow;
                    const isVerticalEdge = col === startCol || col === endCol;

                    // Update corners of adjacent cells based on edge type
                    if (isHorizontalEdge) {
                        // If cell is removed from top/bottom edge, round corners of left and right adjacent cells
                        const adjacentCells = [
                            {row: row, col: col-1},   // left
                            {row: row, col: col+1}    // right
                        ];

                        adjacentCells.forEach(({row: adjRow, col: adjCol}) => {
                            const adjacentCell = gridCells.find(cell => cell.row === adjRow && cell.col === adjCol);
                            if (adjacentCell && adjacentCell.sprite) {
                                let cornerPosition = null;
                                if (adjCol < col) {
                                    // Left cell
                                    cornerPosition = row === startRow ? 'topRight' : 'bottomRight';
                                } else {
                                    // Right cell
                                    cornerPosition = row === startRow ? 'topLeft' : 'bottomLeft';
                                }

                                if (cornerPosition) {
                                    updateSpriteCornerMask(adjacentCell.sprite, adjRow, adjCol, true, cornerPosition);
                                }
                            }
                        });
                    } else if (isVerticalEdge) {
                        // If cell is removed from left/right edge, round corners of top and bottom adjacent cells
                        const adjacentCells = [
                            {row: row-1, col: col},   // top
                            {row: row+1, col: col}    // bottom
                        ];

                        adjacentCells.forEach(({row: adjRow, col: adjCol}) => {
                            const adjacentCell = gridCells.find(cell => cell.row === adjRow && cell.col === adjCol);
                            if (adjacentCell && adjacentCell.sprite) {
                                let cornerPosition = null;
                                if (adjRow < row) {
                                    // Top cell
                                    cornerPosition = col === startCol ? 'bottomLeft' : 'bottomRight';
                                } else {
                                    // Bottom cell
                                    cornerPosition = col === startCol ? 'topLeft' : 'topRight';
                                }

                                if (cornerPosition) {
                                    updateSpriteCornerMask(adjacentCell.sprite, adjRow, adjCol, true, cornerPosition);
                                }
                            }
                        });
                    }
                }
            }
        };

        // Create a container for the image section
        const imageContainer = new PIXI.Container();
        imageContainer.x = 310;  // Position from left
        imageContainer.y = 0;    // Position from top
        imageContainer.eventMode = 'static';

        // Load the background
        const backgroundTexture = await PIXI.Assets.load('assets/bg_white.png');
        const backgroundImage = new PIXI.Sprite(backgroundTexture);
        backgroundImage.width = 650;
        backgroundImage.height = 540;

        // Create a container for the background with effects
        const bgContainer = new PIXI.Container();

        // Create stroke and mask using graphics
        const bgGraphics = new PIXI.Graphics();
        bgGraphics.lineStyle(1, 0xd2d2d2, 1);
        bgGraphics.beginFill(0xFFFFFF);
        bgGraphics.drawRoundedRect(0, 0, 650, 540, 20);
        bgGraphics.endFill();

        // Create mask for rounded corners
        const bgMask = new PIXI.Graphics();
        bgMask.beginFill(0xFFFFFF);
        bgMask.drawRoundedRect(0, 0, 650, 540, 20);
        bgMask.endFill();
        backgroundImage.mask = bgMask;

        // Add everything to the container
        bgContainer.addChild(backgroundImage);
        bgContainer.addChild(bgGraphics);
        bgContainer.addChild(bgMask);
        imageContainer.addChild(bgContainer);

        // Create a container for the grid
        const gridContainer = new PIXI.Container();
        gridContainer.x = 0;
        gridContainer.y = 0;

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

            let originalX1 = Math.min(startX, endX);
            let originalY1 = Math.min(startY, endY);
            let originalX2 = Math.max(startX, endX);
            let originalY2 = Math.max(startY, endY);

            // Calculate original selected cells
            let originalStartCol = Math.floor(originalX1 / cellSize);
            let originalStartRow = Math.floor(originalY1 / cellSize);
            let originalEndCol = Math.floor(originalX2 / cellSize);
            let originalEndRow = Math.floor(originalY2 / cellSize);

            // Getting random rectangle within right panel
            const randomSelectionRect = getRandomSelectionRect({ x: originalX1, y: originalY1, width: originalX2 - originalX1, height: originalY2 - originalY1 }, { x: 0, y: 0, width: stageSize, height: stageHeight });
            
            // Update coordinates based on random selection
            let x1 = randomSelectionRect.x;
            let y1 = randomSelectionRect.y;
            let x2 = randomSelectionRect.x + randomSelectionRect.width;
            let y2 = randomSelectionRect.y + randomSelectionRect.height;
            
            // Calculate selected cells
            let startCol = Math.floor(x1 / cellSize);
            let startRow = Math.floor(y1 / cellSize);
            let endCol = Math.floor(x2 / cellSize);
            let endRow = Math.floor(y2 / cellSize);

            // Clear existing grid cells
            /* gridCells.forEach(cell => {
                gridContainer.removeChild(cell.sprite);
                cell.destroy();
            });
            gridCells.length = 0; */

            

            currentDragDirection = getDragDirection(startX, startY, endX, endY);
            
            let tempGridCells = [];

            if(gridCells.length > 0){
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        if (row >= 0 && row < numberOfRows && col >= 0 && col < numberOfColumns) {
                            const originalSprite = DirectionalTextureArray[currentDragDirection][row][col];
                            if (originalSprite) {
                                const newSprite = new PIXI.Sprite(originalSprite.texture);
                                newSprite.width = cellSize;
                                newSprite.height = cellSize;
                                const cell = new GridCell(row, col, newSprite);
                                tempGridCells.push(cell);
                            }
                        }
                    }
                }
            }
            else{
                for (let row = startRow; row <= endRow; row++) {
                    for (let col = startCol; col <= endCol; col++) {
                        if (row >= 0 && row < numberOfRows && col >= 0 && col < numberOfColumns) {
                            const originalSprite = DirectionalTextureArray[currentDragDirection][row][col];
                            if (originalSprite) {
                                const newSprite = new PIXI.Sprite(originalSprite.texture);
                                newSprite.width = cellSize;
                                newSprite.height = cellSize;
                                const cell = new GridCell(row, col, newSprite);
                                gridCells.push(cell);
                            }
                        }
                    }
                }
            }

            if(tempGridCells.length <= 0){

                // Show and color sprites in the original selection area
                gridCells.forEach((cell, index) => {
                    const row = originalStartRow + Math.floor(index / (originalEndCol - originalStartCol + 1));
                    const col = originalStartCol + (index % (originalEndCol - originalStartCol + 1));
                    
                    if (row <= originalEndRow && col <= originalEndCol) {
                        let sprite = cell.sprite;

                        // Check if this is a corner cell
                        const isCorner = (row === originalStartRow && col === originalStartCol) || 
                                       (row === originalStartRow && col === originalEndCol) ||
                                       (row === originalEndRow && col === originalStartCol) ||
                                       (row === originalEndRow && col === originalEndCol);
                        
                        let cornerPosition = null;
                        if (isCorner) {
                            if (row === originalStartRow && col === originalStartCol) cornerPosition = 'topLeft';
                            else if (row === originalStartRow && col === originalEndCol) cornerPosition = 'topRight';
                            else if (row === originalEndRow && col === originalStartCol) cornerPosition = 'bottomLeft';
                            else if (row === originalEndRow && col === originalEndCol) cornerPosition = 'bottomRight';
                        }
                        
                        cell.col = col;
                        cell.row = row;
                        
                        if (sprite) {
                            sprite.x = col * cellSize;
                            sprite.y = row * cellSize;
                            sprite = updateSpriteCornerMask(sprite, row, col, isCorner, cornerPosition);
                            gridContainer.addChild(sprite);
                        }
                    }
                });

                // Add random cells around the selection
                addRandomCellsAroundSelection(originalStartRow, originalStartCol, originalEndRow, originalEndCol);

                // Remove a random cell around the selection
                removeRandomCellAroundSelection(originalStartRow, originalStartCol, originalEndRow, originalEndCol);

                
            }
            else{
                // Show and color sprites in the original selection area
                tempGridCells.forEach((cell, index) => {
                    const row = originalStartRow + Math.floor(index / (originalEndCol - originalStartCol + 1));
                    const col = originalStartCol + (index % (originalEndCol - originalStartCol + 1));
                    
                    if (row <= originalEndRow && col <= originalEndCol) {
                        
                        const existingCell = gridCells.find(cell => cell.row === row && cell.col === col);
                        if(existingCell){
                            gridContainer.removeChild(existingCell.sprite);
                            existingCell.sprite.destroy();
                        }

                        const sprite = cell.sprite;

                        // Check if this is a corner cell
                        const isCorner = (row === originalStartRow && col === originalStartCol) || 
                                       (row === originalStartRow && col === originalEndCol) ||
                                       (row === originalEndRow && col === originalStartCol) ||
                                       (row === originalEndRow && col === originalEndCol);
                        
                        let cornerPosition = null;
                        if (isCorner) {
                            if (row === originalStartRow && col === originalStartCol) cornerPosition = 'topLeft';
                            else if (row === originalStartRow && col === originalEndCol) cornerPosition = 'topRight';
                            else if (row === originalEndRow && col === originalStartCol) cornerPosition = 'bottomLeft';
                            else if (row === originalEndRow && col === originalEndCol) cornerPosition = 'bottomRight';
                        }

                        const newSprite = createSpriteWithMask(sprite.texture, row, col, isCorner, cornerPosition);
                        newSprite.col = col;
                        newSprite.row = row;
                        const newCell = new GridCell(row, col, newSprite);
                        gridCells.push(newCell);
                        gridContainer.addChild(newSprite);
                    }
                });

                // Add random cells around the selection
                addRandomCellsAroundSelection(originalStartRow, originalStartCol, originalEndRow, originalEndCol);

                // Remove a random cell around the selection
                removeRandomCellAroundSelection(originalStartRow, originalStartCol, originalEndRow, originalEndCol);

                // Clear existing grid cells
                tempGridCells.forEach(cell => {
                    cell.destroy();
                });
                tempGridCells.length = 0;
            }
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

function getDragDirection(startX, startY, endX, endY) {
    const isGoingRight = endX > startX;
    const isGoingDown = endY > startY;

    if (isGoingDown) {
        return isGoingRight ? DragDirection.TopToBottomRight : DragDirection.TopToBottomLeft;
    } else {
        return isGoingRight ? DragDirection.BottomToTopRight : DragDirection.BottomToTopLeft;
    }
}

export { initImageSection };