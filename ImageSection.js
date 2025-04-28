import { app, TextureArray, numberOfRows, numberOfColumns, cellSize, interactiveRect, stageSize, stageHeight, GridCell, gridCells, DragDirection, PLAIN_COLORS, projectType } from './Config.js';
import { getRandomSelectionRect } from './Utils.js';
import { archiveIndexValueLabelText } from './InfoSection.js';
import { updateSectionSizes } from './BottomLayout.js';
import { interactiveBgTexture, restartButtonTexture, whitebgTexture } from './Resources.js';

let previousSurroundedGroupsLength = 1;
let tempGridCells = [];
let surroundedGroupsContainer = new PIXI.Container();

async function initImageSection() {
    try {

        const DirectionalTextureArray = {
            TopToBottomRight: TextureArray[0],
            TopToBottomLeft: TextureArray[1],
            BottomToTopRight: TextureArray[2],
            BottomToTopLeft: TextureArray[3]
        };

        let currentDragDirection;

        const container = document.getElementById('app-container');

        // Create a container for the image section
        const imageContainer = new PIXI.Container();
        imageContainer.x = interactiveRect.x;  // Position from left
        imageContainer.y = interactiveRect.y;    // Position from top
        imageContainer.width = interactiveRect.width;
        imageContainer.height = interactiveRect.height;
        imageContainer.eventMode = 'static';
        
        // Class to track texture statistics
        class TextureStats {
            constructor() {
                this.textures = {
                    [DragDirection.TopToBottomRight]: 0,
                    [DragDirection.TopToBottomLeft]: 0,
                    [DragDirection.BottomToTopRight]: 0,
                    [DragDirection.BottomToTopLeft]: 0
                };
                this.totalCells = numberOfRows * numberOfColumns;
                this.surroundedEmptyCells = 0;
                this.surroundedGroups = [];
                // Create a 2D grid to track filled cells
                this.grid = Array(numberOfRows).fill().map(() => 
                    Array(numberOfColumns).fill(false)
                );
                // Create a 2D grid to track visited cells during group detection
                this.visited = Array(numberOfRows).fill().map(() => 
                    Array(numberOfColumns).fill(false)
                );

                this.topToBottomRightPercentage = '0';
                this.topToBottomLeftPercentage = '0';
                this.bottomToTopRightPercentage = '0';
                this.bottomToTopLeftPercentage = '0';
            }

            // Helper function to check if a cell is within grid bounds
            isValidCell(row, col) {
                return row >= 0 && row < numberOfRows && col >= 0 && col < numberOfColumns;
            }

            // Helper function to find connected empty cells
            findConnectedEmptyCells(row, col, group) {
                if (!this.isValidCell(row, col) || this.visited[row][col] || this.grid[row][col]) {
                    return;
                }

                this.visited[row][col] = true;
                group.push({row, col});

                // Check 4-connected neighbors (up, right, down, left)
                const neighbors = [[-1, 0], [0, 1], [1, 0], [0, -1]];
                for (const [dr, dc] of neighbors) {
                    this.findConnectedEmptyCells(row + dr, col + dc, group);
                }
            }

            // Check if a group of cells is completely surrounded by filled cells
            isGroupSurrounded(group) {
                for (const {row, col} of group) {
                    const neighbors = [
                        [-1, -1], [-1, 0], [-1, 1],
                        [0, -1],           [0, 1],
                        [1, -1],  [1, 0],  [1, 1]
                    ];

                    for (const [dr, dc] of neighbors) {
                        const newRow = row + dr;
                        const newCol = col + dc;
                        
                        // If neighbor is outside grid, group is not surrounded
                        if (!this.isValidCell(newRow, newCol)) return false;
                        
                        // If neighbor is empty and not part of the group, group is not surrounded
                        if (!this.grid[newRow][newCol] && 
                            !group.some(cell => cell.row === newRow && cell.col === newCol)) {
                            return false;
                        }
                    }
                }
                return true;
            }

            updateSections() {
                // Calculate total filled cells
                const totalFilled = Object.values(this.textures).reduce((sum, count) => sum + count, 0);
                
                if (totalFilled === 0) {
                    // If no cells are filled, make all sections equal
                    updateSectionSizes(0, 0, 0, 0);
                    return;
                }

                // Calculate percentages based on filled cells
                this.topToBottomRightPercentage = ((this.textures[DragDirection.TopToBottomRight] / totalFilled) * 100).toFixed(2);
                this.topToBottomLeftPercentage = ((this.textures[DragDirection.TopToBottomLeft] / totalFilled) * 100).toFixed(2);
                this.bottomToTopRightPercentage = ((this.textures[DragDirection.BottomToTopRight] / totalFilled) * 100).toFixed(2);
                this.bottomToTopLeftPercentage = ((this.textures[DragDirection.BottomToTopLeft] / totalFilled) * 100).toFixed(2);

                // Update section sizes
                updateSectionSizes(
                    parseFloat(this.topToBottomRightPercentage),
                    parseFloat(this.topToBottomLeftPercentage),
                    parseFloat(this.bottomToTopRightPercentage),
                    parseFloat(this.bottomToTopLeftPercentage)
                );

                //updateSectionSizes(100, 0, 0, 0);

                archiveIndexValueLabelText.text = (this.surroundedGroups.length).toString();
            }

            addTexture(direction, row, col) {
                this.textures[direction]++;
                this.grid[row][col] = true;
                this.updateSurroundedEmptyCells();
                this.updateSections();
            }

            removeTexture(direction, row, col) {
                if (this.textures[direction] > 0) {
                    this.textures[direction]--;
                    this.grid[row][col] = false;
                    this.updateSurroundedEmptyCells();
                    this.updateSections();
                }
            }

            updateSurroundedEmptyCells() {
                this.surroundedEmptyCells = 0;
                this.surroundedGroups = [];
                
                // Reset visited grid
                for (let row = 0; row < numberOfRows; row++) {
                    for (let col = 0; col < numberOfColumns; col++) {
                        this.visited[row][col] = false;
                    }
                }

                // Find all groups of connected empty cells
                for (let row = 0; row < numberOfRows; row++) {
                    for (let col = 0; col < numberOfColumns; col++) {
                        if (!this.visited[row][col] && !this.grid[row][col]) {
                            const group = [];
                            this.findConnectedEmptyCells(row, col, group);
                            
                            // Check if this group is surrounded
                            if (group.length > 0 && this.isGroupSurrounded(group)) {
                                this.surroundedGroups.push(group);
                                this.surroundedEmptyCells += group.length;
                            }
                        }
                    }
                }
            }

            /* printStats() {
                console.log('\nTexture Statistics:');
                for (const [direction, count] of Object.entries(this.textures)) {
                    const percentage = ((count / this.totalCells) * 100).toFixed(2);
                    console.log(`${direction}: ${count} cells (${percentage}%)`);
                }
                const totalUsed = Object.values(this.textures).reduce((a, b) => a + b, 0);
                const totalPercentage = ((totalUsed / this.totalCells) * 100).toFixed(2);
                console.log(`Total Used: ${totalUsed} cells (${totalPercentage}%)`);
                
                const surroundedPercentage = ((this.surroundedEmptyCells / this.totalCells) * 100).toFixed(2);
                console.log(`Surrounded Empty Cells: ${this.surroundedEmptyCells} (${surroundedPercentage}%)`);
                console.log(`Number of surrounded groups: ${this.surroundedGroups.length}`);
                this.surroundedGroups.forEach((group, index) => {
                    console.log(`Group ${index + 1} size: ${group.length} cells`);
                });
                
                // Also update sections when printing stats
                this.updateSections();
            } */
        }

        // Create instance of TextureStats
        let textureStats = new TextureStats();

        // Handle window resizing
        function resize() {
            
            console.log('container.clientHeight: ',container.clientHeight);

            interactiveRect.height -= (1000 -container.clientHeight);

            textureStats.updateSections();
        }

        // Initial resize
        resize();

        // Add window resize listener
        window.addEventListener('resize', resize);

        // Helper function to update sprite's corner mask
        const updateSpriteCornerMask = (sprite, row, col, isCorner, cornerPosition) => {
            // Check if sprite or its position is null
            if (!sprite || !sprite.position || sprite.position._x === null || sprite.position._y === null) {
                return sprite;
            }

            // Remove any existing mask
            if (sprite.mask) {
                sprite.mask.destroy();
                sprite.mask = null;
            }

            if (isCorner) {
                const cornerRadius = 20;
                const mask = new PIXI.Graphics();
                mask.beginFill(0xFFFFFF);
                
                // Calculate absolute coordinates
                const x = col * cellSize;
                const y = row * cellSize;
                
                // Create path for rounded corner only at specific corner
                switch(cornerPosition) {
                    case 'topLeft':
                        mask.moveTo(x + cornerRadius, y);
                        mask.arcTo(x, y, x, y + cornerRadius, cornerRadius);
                        mask.lineTo(x, y + cellSize);
                        mask.lineTo(x + cellSize, y + cellSize);
                        mask.lineTo(x + cellSize, y);
                        break;
                    case 'topRight':
                        mask.moveTo(x, y);
                        mask.lineTo(x + cellSize - cornerRadius, y);
                        mask.arcTo(x + cellSize, y, x + cellSize, y + cornerRadius, cornerRadius);
                        mask.lineTo(x + cellSize, y + cellSize);
                        mask.lineTo(x, y + cellSize);
                        break;
                    case 'bottomLeft':
                        mask.moveTo(x, y);
                        mask.lineTo(x + cellSize, y);
                        mask.lineTo(x + cellSize, y + cellSize);
                        mask.lineTo(x + cornerRadius, y + cellSize);
                        mask.arcTo(x, y + cellSize, x, y + cellSize - cornerRadius, cornerRadius);
                        break;
                    case 'bottomRight':
                        mask.moveTo(x, y);
                        mask.lineTo(x + cellSize, y);
                        mask.lineTo(x + cellSize, y + cellSize - cornerRadius);
                        mask.arcTo(x + cellSize, y + cellSize, x + cellSize - cornerRadius, y + cellSize, cornerRadius);
                        mask.lineTo(x, y + cellSize);
                        break;
                }
                mask.closePath();
                mask.endFill();
                
                // Add mask to the container and set it as sprite's mask
                gridContainer.addChild(mask);
                sprite.mask = mask;
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
                const cornerRadius = 20;
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

        // Function to add random cells around selection
        const addRandomCellsAroundSelection = (startRow, startCol, endRow, endCol) => {
            const numCells = Math.floor(Math.random() * 2) + 2; // Random number between 2-3
            const positions = [];
            //recentlyAddedCells = []; // Reset the tracking array
            
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

                    // Calculate pixel position
                    const pixelX = col * cellSize;
                    const pixelY = row * cellSize;
                    
                    // Check if position is within imageContainer bounds
                    const isWithinBounds = 
                        pixelX >= 0 && 
                        pixelX + cellSize <= imageContainer.width && 
                        pixelY >= 0 && 
                        pixelY + cellSize <= imageContainer.height;

                    if (row >= 0 && row < numberOfRows && 
                        col >= 0 && col < numberOfColumns &&
                        !(row >= startRow && row <= endRow && col >= startCol && col <= endCol) &&
                        !isCornerOrAdjacent &&
                        isWithinBounds) {
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
                    //recentlyAddedCells.push({row, col}); // Track the added cell
                    textureStats.addTexture(currentDragDirection, row, col); // Track new texture
                }
            }
        };

        // Function to remove a random cell around selection
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
                textureStats.removeTexture(currentDragDirection, row, col); // Track removed texture
            }
        };

        
        const backgroundImage = new PIXI.Sprite(interactiveBgTexture);
        backgroundImage.x = -15;
        backgroundImage.y = -10;
        backgroundImage.width = interactiveRect.width + 30;
        backgroundImage.height = interactiveRect.height + 20;

        // Create a container for the background with effects
        const bgContainer = new PIXI.Container();

        // Add everything to the container
        bgContainer.addChild(backgroundImage);
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

        // Create project type text
        const projectTypeText = new PIXI.Text('', {
            fontFamily: 'IBM Plex Mono',
            fontSize: 20,
            fill: 0x4A90E2,
            align: 'center'
        });
        projectTypeText.visible = false;
        gridContainer.addChild(projectTypeText);

        // Mouse move event
        gridContainer.on('pointermove', (event) => {
            if (isDragging) {
                const pos = event.getLocalPosition(gridContainer);
                endX = pos.x;
                endY = pos.y;
                
                // Snap to grid
                endX = Math.floor(endX / cellSize) * cellSize + cellSize;
                endY = Math.floor(endY / cellSize) * cellSize + cellSize;

                // Calculate dimensions in cells
                const cellsWidth = Math.abs(endX - startX) / cellSize;
                const cellsHeight = Math.abs(endY - startY) / cellSize;

                // Restrict to minimum 2x2 and maximum 5x5
                if (cellsWidth < 2) endX = startX + (endX > startX ? 2 * cellSize : -2 * cellSize);
                if (cellsWidth > 15) endX = startX + (endX > startX ? 15 * cellSize : -15 * cellSize);
                if (cellsHeight < 2) endY = startY + (endY > startY ? 2 * cellSize : -2 * cellSize);
                if (cellsHeight > 11) endY = startY + (endY > startY ? 11 * cellSize : -11 * cellSize);
                
                // Draw selection rectangle
                selectionRect.clear();
                selectionRect.beginFill(0x707070, 0.1);  // Semi-transparent grey
                
                const x = Math.min(startX, endX);
                const y = Math.min(startY, endY);
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);
                
                selectionRect.drawRoundedRect(x, y, width, height,24);
                selectionRect.endFill();

                // Update project type text based on drag direction
                const direction = getDragDirection(startX, startY, endX, endY);
                let projectIndex = 0;
                switch(direction) {
                    case DragDirection.TopToBottomRight:
                        projectIndex = 0; // ART
                        break;
                    case DragDirection.TopToBottomLeft:
                        projectIndex = 1; // RESEARCH
                        break;
                    case DragDirection.BottomToTopRight:
                        projectIndex = 2; // ECOLOGY
                        break;
                    case DragDirection.BottomToTopLeft:
                        projectIndex = 3; // COMMUNITY
                        break;
                }
                
                // Position text at the center of selection
                projectTypeText.text = projectType[projectIndex];
                projectTypeText.visible = true;
                projectTypeText.x = x + width/2 - projectTypeText.width/2;
                projectTypeText.y = y + height/2 - projectTypeText.height/2;
            } else {
                projectTypeText.visible = false;
            }
        });

        // Create restart button
        const restartButton = new PIXI.Sprite(restartButtonTexture);
        restartButton.x = 10;
        restartButton.y = interactiveRect.height - 60;
        restartButton.width = 50;
        restartButton.height = 50;
        restartButton.eventMode = 'static';
        restartButton.cursor = 'pointer';
        
        
        // Hover effects
        restartButton.on('pointerover', () => {
            gsap.to(restartButton, { alpha: 0.9, duration: 0.2 });
        });
        
        restartButton.on('pointerout', () => {
            gsap.to(restartButton, { alpha: 1, duration: 0.2 });
        });
        
        // Reset functionality
        restartButton.on('pointertap', () => {

            surroundedGroupsContainer.children.forEach(cell => cell.destroy());
            surroundedGroupsContainer.removeChildren();

            // Clear all containers
            gridContainer.removeChildren();
            
            // Reset arrays and objects
            gridCells.forEach(cell => cell.destroy());
            gridCells.length = 0;
            tempGridCells.length = 0;
            
            // Reset texture stats
            textureStats = new TextureStats();
            previousSurroundedGroupsLength = 1;
            
            // Reset selection state
            isDragging = false;
            startX = startY = endX = endY = 0;
            selectionRect.clear();

            // Re-add selection rectangle to grid container
            gridContainer.addChild(selectionRect);
            gridContainer.addChild(projectTypeText);

            // Reset section sizes
            updateSectionSizes(0, 0, 0, 0);

            // Clear projects from InfoSection
            if (typeof window.clearAllProjects === 'function') {
                window.clearAllProjects();
            }

            archiveIndexValueLabelText.text = '0';
        });

        // Mouse up event
        gridContainer.on('pointerup', () => {
            isDragging = false;
            projectTypeText.visible = false;
            // Calculate dimensions in cells
            const cellsWidth = Math.abs(endX - startX) / cellSize;
            const cellsHeight = Math.abs(endY - startY) / cellSize;

            // Enforce minimum 2x2 and maximum 5x5 on final selection
            if (cellsWidth < 2 || cellsWidth > 15 || cellsHeight < 2 || cellsHeight > 15) {
                selectionRect.clear();
                return;
            }

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

            

            currentDragDirection = getDragDirection(startX, startY, endX, endY);
            
            tempGridCells.length = 0;

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
                            textureStats.addTexture(currentDragDirection, row, col); // Track new texture
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
                        textureStats.addTexture(currentDragDirection, row, col); // Track new texture
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
            //textureStats.printStats(); // Print updated statistics
            textureStats.updateSections();
            
            // If we found a new surrounded group
            if (textureStats.surroundedGroups.length > previousSurroundedGroupsLength) {


                // Remove any existing surrounded group sprites
                if (gridContainer.surroundedGroupsContainer) {
                    surroundedGroupsContainer.children.forEach(cell => cell.destroy());
                    gridContainer.removeChild(gridContainer.surroundedGroupsContainer);
                }

                
                gridContainer.surroundedGroupsContainer = surroundedGroupsContainer;
                
                

                // Color all surrounded groups
                textureStats.surroundedGroups.forEach(group => {
                    // Get a random color from PLAIN_COLORS
                const colors = Object.values(PLAIN_COLORS);
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                const plainColor = parseInt(randomColor.replace('#', '0x'));
                    // Color all cells in the group
                    group.forEach(cell => {
                        const newSprite = new PIXI.Sprite(whitebgTexture);
                        newSprite.width = cellSize;
                        newSprite.height = cellSize;
                        newSprite.tint = plainColor;
                        newSprite.x = cell.col * cellSize;
                        newSprite.y = cell.row * cellSize;
                        surroundedGroupsContainer.addChild(newSprite);
                    });
                });

                // Add the container to gridContainer
                gridContainer.addChild(surroundedGroupsContainer);

                previousSurroundedGroupsLength = textureStats.surroundedGroups.length + 1;

                // Add a project card based on percentages
                if (typeof window.addRandomProject === 'function') {
                    window.addRandomProject(
                        textureStats.topToBottomRightPercentage,  // ART
                        textureStats.topToBottomLeftPercentage,   // RESEARCH
                        textureStats.bottomToTopRightPercentage,  // ECOLOGY
                        textureStats.bottomToTopLeftPercentage    // COMMUNITY
                    );
                }
            }

            
        });

        // Mouse out event
        gridContainer.on('pointerupoutside', () => {
            isDragging = false;
        });

        // Add grid container to image container
        imageContainer.addChild(gridContainer);
        imageContainer.addChild(restartButton);
        
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