var stage, layer, leftLayer, rightLayer, selectionLayer;
const stageWidth = 960;
const stageHeight = 540;
let isSelecting = false;
let selectionRect = null;
let startPos = null;
let gridCells = [];
let selectedCells = [];
let currentDragDirection = null;
let directionList = [];
let isDraggingScroll = false;
let scrollbarY = 0;
const GRID_OFFSET_X = 310;
const SCROLLBAR_WIDTH = 10;
const SCROLLBAR_PADDING = 2;
const TEXT_CONTAINER_HEIGHT = 520;

// Cache color values
const COLORS = {
    CELL_DEFAULT: '#f0f0f0',
    CELL_SELECTED: '#4444ff',
    SELECTION_FILL: 'rgba(0, 0, 255, 0.2)',
    SELECTION_STROKE: 'black',
    CELL_STROKE: 'black',
    CELL_SHADOW: 'black',
    TEXT_COLOR: 'black',
    SCROLLBAR_BG: '#dddddd',
    SCROLLBAR_THUMB: '#999999'
};

// Direction colors
const DIRECTION_COLORS = {
    TopToBottomRight: '#ff0000',  // Red
    TopToBottomLeft: '#00ff00',   // Green
    BottomToTopRight: '#0000ff',  // Blue
    BottomToTopLeft: '#ffa500'    // Orange
};

// Direction enum
const DragDirection = {
    TopToBottomRight: 'TopToBottomRight',   // x2 > x1 && y2 > y1
    TopToBottomLeft: 'TopToBottomLeft',     // x2 < x1 && y2 > y1
    BottomToTopRight: 'BottomToTopRight',   // x2 > x1 && y2 < y1
    BottomToTopLeft: 'BottomToTopLeft'      // x2 < x1 && y2 < y1
};

function getDragDirection(startX, startY, endX, endY) {
    const isGoingRight = endX > startX;
    const isGoingDown = endY > startY;

    if (isGoingDown) {
        return isGoingRight ? DragDirection.TopToBottomRight : DragDirection.TopToBottomLeft;
    } else {
        return isGoingRight ? DragDirection.BottomToTopRight : DragDirection.BottomToTopLeft;
    }
}

function initStage() {
    const stageSize = 650;
    const cellSize = 54;
    const numberOfRows = 10;
    const numberOfColumns = 12;

    stage = new Konva.Stage({
        container: 'konva-container',
        width: stageWidth,
        height: stageHeight
    });

    layer = new Konva.Layer();
    var backgrountImage = new Image();
    backgrountImage.src = 'assets/bg_yellow.png';
    backgrountImage.onload = function() {
        var kineticImage = new Konva.Image({
            x: 0,
            y: 0,
            image: backgrountImage,
            width: 960,
            height: 540
        });

        layer.add(kineticImage);
        layer.draw();
    };

    leftLayer = new Konva.Layer();
    var bgImageLeft = new Image();
    bgImageLeft.src = 'assets/bg_red.png';
    bgImageLeft.onload = function() {
        var kineticImage = new Konva.Image({
            x: 0,
            y: 0,
            image: bgImageLeft,
            width: 300,
            height: 540
        });

        layer.add(kineticImage);
        layer.draw();
    };

    // Create a clip container for the text
    const clipContainer = new Konva.Group({
        x: 10,
        y: 10,
        width: 280,
        height: TEXT_CONTAINER_HEIGHT,
        clip: {
            x: 0,
            y: 0,
            width: 280,
            height: TEXT_CONTAINER_HEIGHT
        }
    });

    // Add text to left layer with scrolling container
    const textContainer = new Konva.Group({
        x: 0,
        y: 0,
        width: 260,
        height: TEXT_CONTAINER_HEIGHT
    });

    const directionText = new Konva.Text({
        x: 10,
        y: 0,
        width: 260,
        fontSize: 20,
        fill: COLORS.TEXT_COLOR,
        text: '',
        align: 'left',
        wrap: 'word'
    });

    textContainer.add(directionText);
    clipContainer.add(textContainer);

    // Create scrollbar background
    const scrollbarBg = new Konva.Rect({
        x: 290,
        y: 10,
        width: SCROLLBAR_WIDTH,
        height: TEXT_CONTAINER_HEIGHT,
        fill: COLORS.SCROLLBAR_BG,
        cornerRadius: 4
    });

    // Create scrollbar thumb
    const scrollbarThumb = new Konva.Rect({
        x: 290 + SCROLLBAR_PADDING,
        y: 10 + SCROLLBAR_PADDING,
        width: SCROLLBAR_WIDTH - (2 * SCROLLBAR_PADDING),
        height: 100,
        fill: COLORS.SCROLLBAR_THUMB,
        cornerRadius: 4,
        draggable: true,
        dragBoundFunc: function(pos) {
            const maxY = TEXT_CONTAINER_HEIGHT + 10 - this.height() - (2 * SCROLLBAR_PADDING);
            return {
                x: this.x(),
                y: Math.max(10 + SCROLLBAR_PADDING, Math.min(pos.y, maxY))
            };
        }
    });

    function updateScroll() {
        const contentHeight = directionText.height();
        const containerHeight = TEXT_CONTAINER_HEIGHT;
        
        if (contentHeight <= containerHeight) {
            scrollbarBg.visible(false);
            scrollbarThumb.visible(false);
            textContainer.y(0);
            return;
        }

        scrollbarBg.visible(true);
        scrollbarThumb.visible(true);

        // Update thumb size
        const ratio = containerHeight / contentHeight;
        const thumbHeight = Math.max(30, containerHeight * ratio);
        scrollbarThumb.height(thumbHeight);

        // Calculate scroll position
        const scrollRatio = (scrollbarThumb.y() - (10 + SCROLLBAR_PADDING)) / (containerHeight - thumbHeight - (2 * SCROLLBAR_PADDING));
        const maxScroll = contentHeight - containerHeight;
        textContainer.y(-maxScroll * scrollRatio);
    }

    // Add scrollbar events
    scrollbarThumb.on('dragmove', updateScroll);

    // Add mouse wheel event for scrolling
    stage.on('wheel', (e) => {
        const contentHeight = directionText.height();
        const containerHeight = TEXT_CONTAINER_HEIGHT;

        if (contentHeight > containerHeight) {
            e.evt.preventDefault();
            const delta = e.evt.deltaY;
            const maxScroll = contentHeight - containerHeight;
            const currentScroll = -textContainer.y();
            const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + delta));
            
            textContainer.y(-newScroll);

            // Update thumb position
            const scrollRatio = newScroll / maxScroll;
            const maxThumbY = containerHeight - scrollbarThumb.height() - (2 * SCROLLBAR_PADDING);
            scrollbarThumb.y(10 + SCROLLBAR_PADDING + (scrollRatio * maxThumbY));
            
            leftLayer.batchDraw();
        }
    });

    leftLayer.add(clipContainer);
    leftLayer.add(scrollbarBg);
    leftLayer.add(scrollbarThumb);

    rightLayer = new Konva.Layer();
    var bgImageRight = new Image();
    bgImageRight.src = 'assets/bg_blue.png';
    bgImageRight.onload = function() {
        var kineticImage = new Konva.Image({
            x: GRID_OFFSET_X,
            y: 0,
            image: bgImageRight,
            width: 650,
            height: 540
        });

        layer.add(kineticImage);
        layer.draw();
    };

    // Create grid cells with optimized data structure
    gridCells = Array(numberOfRows).fill().map(() => Array(numberOfColumns).fill(null));
    
    for (let row = 0; row < numberOfRows; row++) {
        for (let col = 0; col < numberOfColumns; col++) {
            const cell = new Konva.Rect({
                x: GRID_OFFSET_X + col * cellSize,
                y: row * cellSize,
                width: cellSize,
                height: cellSize,
                fill: COLORS.CELL_DEFAULT,
                stroke: COLORS.CELL_STROKE,
                strokeWidth: 1,
                shadowColor: COLORS.CELL_SHADOW,
                shadowBlur: 5,
                shadowOffset: { x: 2, y: 2 },
                shadowOpacity: 0.1,
                cornerRadius: 4
            });
            
            // Enable caching for each cell
            cell.cache();
            gridCells[row][col] = cell;
            rightLayer.add(cell);
        }
    }

    selectionLayer = new Konva.Layer();
    
    // Create selection rectangle
    selectionRect = new Konva.Rect({
        fill: COLORS.SELECTION_FILL,
        stroke: COLORS.SELECTION_STROKE,
        strokeWidth: 1,
        visible: false
    });
    selectionLayer.add(selectionRect);

    function updateSelectedCells() {
        const modifiedCells = new Set();
        
        // Get selection bounds
        const pos = stage.getPointerPosition();
        const x1 = Math.min(startPos.x, pos.x);
        const y1 = Math.min(startPos.y, pos.y);
        const x2 = Math.max(startPos.x, pos.x);
        const y2 = Math.max(startPos.y, pos.y);

        // Update drag direction
        currentDragDirection = getDragDirection(startPos.x, startPos.y, pos.x, pos.y);
        
        // Add new direction to list with index and color
        if (currentDragDirection) {
            const directionColor = DIRECTION_COLORS[currentDragDirection];
            directionList.push(`${directionList.length + 1}. ${currentDragDirection}`);
            directionText.text(directionList.join('\n'));

            // Update scroll position to bottom
            const contentHeight = directionText.height();
            const containerHeight = TEXT_CONTAINER_HEIGHT;
            
            if (contentHeight > containerHeight) {
                scrollbarThumb.visible(true);
                const maxScroll = contentHeight - containerHeight;
                textContainer.y(-maxScroll);

                // Update thumb size and position
                const ratio = containerHeight / contentHeight;
                const thumbHeight = Math.max(30, containerHeight * ratio);
                scrollbarThumb.height(thumbHeight);
                scrollbarThumb.y(10 + TEXT_CONTAINER_HEIGHT - thumbHeight - SCROLLBAR_PADDING);
            }
            else {
                scrollbarThumb.visible(false);
            }

            leftLayer.batchDraw();
        }

        // Convert screen coordinates to grid coordinates
        const startCol = Math.max(0, Math.floor((x1 - GRID_OFFSET_X) / cellSize));
        const endCol = Math.min(numberOfColumns - 1, Math.floor((x2 - GRID_OFFSET_X) / cellSize));
        const startRow = Math.max(0, Math.floor(y1 / cellSize));
        const endRow = Math.min(numberOfRows - 1, Math.floor(y2 / cellSize));

        // Store corner cells
        const cornerCells = {
            topLeft: gridCells[startRow][startCol],
            topRight: gridCells[startRow][endCol],
            bottomLeft: gridCells[endRow][startCol],
            bottomRight: gridCells[endRow][endCol]
        };

        // Function to get random cells adjacent to selection
        function getRandomAdjacentCells(numCells) {
            const adjacentCells = [];
            const sides = ['top', 'right', 'bottom', 'left'];
            
            // Shuffle sides array
            for (let i = sides.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [sides[i], sides[j]] = [sides[j], sides[i]];
            }

            // Try to add cells from random sides
            for (let i = 0; i < numCells && sides.length > 0; i++) {
                const side = sides.pop();
                let cell = null;

                switch(side) {
                    case 'top':
                        if (startRow > 0) {
                            const col = startCol + Math.floor(Math.random() * (endCol - startCol + 1));
                            cell = gridCells[startRow - 1][col];
                        }
                        break;
                    case 'right':
                        if (endCol < numberOfColumns - 1) {
                            const row = startRow + Math.floor(Math.random() * (endRow - startRow + 1));
                            cell = gridCells[row][endCol + 1];
                        }
                        break;
                    case 'bottom':
                        if (endRow < numberOfRows - 1) {
                            const col = startCol + Math.floor(Math.random() * (endCol - startCol + 1));
                            cell = gridCells[endRow + 1][col];
                        }
                        break;
                    case 'left':
                        if (startCol > 0) {
                            const row = startRow + Math.floor(Math.random() * (endRow - startRow + 1));
                            cell = gridCells[row][startCol - 1];
                        }
                        break;
                }

                if (cell && !adjacentCells.includes(cell)) {
                    adjacentCells.push(cell);
                }
            }

            return adjacentCells;
        }

        // Only iterate over cells that could be in the selection
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = gridCells[row][col];
                // Apply direction-specific color
                cell.attrs.fill = DIRECTION_COLORS[currentDragDirection];
                // Reset corner radius for non-corner cells
                cell.cornerRadius([0, 0, 0, 0]);
                selectedCells.push(cell);
                modifiedCells.add(cell);
            }
        }

        // Add random adjacent cells
        const numExtraCells = Math.floor(Math.random() * 2) + 2; // Random number between 2 and 3
        const extraCells = getRandomAdjacentCells(numExtraCells);
        extraCells.forEach(cell => {
            cell.attrs.fill = DIRECTION_COLORS[currentDragDirection];
            cell.cornerRadius([0, 0, 0, 0]);
            selectedCells.push(cell);
            modifiedCells.add(cell);
        });

        // Set specific corner radius for each corner
        // Format: [topLeft, topRight, bottomRight, bottomLeft]
        cornerCells.topLeft.cornerRadius([40, 0, 0, 0]);
        cornerCells.topRight.cornerRadius([0, 40, 0, 0]);
        cornerCells.bottomRight.cornerRadius([0, 0, 40, 0]);
        cornerCells.bottomLeft.cornerRadius([0, 0, 0, 40]);

        // Draw only modified cells
        modifiedCells.forEach(cell => {
            cell.clearCache();
            cell.cache();
            cell.draw();
        });
    }

    // Add mouse events to stage
    stage.on('mousedown', (e) => {
        const pos = stage.getPointerPosition();
        if (pos.x >= GRID_OFFSET_X) {
            isSelecting = true;
            startPos = pos;
            currentDragDirection = null; // Reset current direction
            
            selectionRect.setAttrs({
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                visible: true
            });
            
            selectionLayer.batchDraw();
        }
    });

    stage.on('mousemove', () => {
        if (!isSelecting) return;

        const pos = stage.getPointerPosition();
        const width = pos.x - startPos.x;
        const height = pos.y - startPos.y;

        selectionRect.setAttrs({
            width: width,
            height: height
        });
        selectionLayer.batchDraw();
    });

    stage.on('mouseup', () => {
        if (isSelecting) {
            updateSelectedCells();

            isSelecting = false;
            selectionRect.visible(false);
            selectionLayer.batchDraw();
        }
    });

    stage.add(layer);
    stage.add(leftLayer);
    stage.add(rightLayer);
    stage.add(selectionLayer);
}