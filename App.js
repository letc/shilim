var stage, layer, leftLayer, rightLayer, selectionLayer;
const stageWidth = 960;
const stageHeight = 540;
let isSelecting = false;
let selectionRect = null;
let startPos = null;
let gridCells = [];
let selectedCells = [];
let currentDragDirection = null;
const GRID_OFFSET_X = 310;

// Cache color values
const COLORS = {
    CELL_DEFAULT: '#f0f0f0',
    CELL_SELECTED: '#4444ff',
    SELECTION_FILL: 'rgba(0, 0, 255, 0.2)',
    SELECTION_STROKE: 'black',
    CELL_STROKE: 'black',
    CELL_SHADOW: 'black'
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
        console.log('Current drag direction:', currentDragDirection);

        // Convert screen coordinates to grid coordinates
        const startCol = Math.max(0, Math.floor((x1 - GRID_OFFSET_X) / cellSize));
        const endCol = Math.min(numberOfColumns - 1, Math.floor((x2 - GRID_OFFSET_X) / cellSize));
        const startRow = Math.max(0, Math.floor(y1 / cellSize));
        const endRow = Math.min(numberOfRows - 1, Math.floor(y2 / cellSize));

        // Only iterate over cells that could be in the selection
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const cell = gridCells[row][col];
                cell.attrs.fill = COLORS.CELL_SELECTED;
                selectedCells.push(cell);
                modifiedCells.add(cell);
            }
        }

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
            currentDragDirection = null; // Reset direction on new selection
            
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