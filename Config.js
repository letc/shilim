const app = new PIXI.Application();

const stageWidth = 1550;
const stageHeight = 1000;
const GRID_OFFSET_X = 310;

const stageSize = 1240;
const cellSize = 20;
const numberOfRows = 50;
const numberOfColumns = 62;

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

// Define the folder paths
const folderPaths = [
    'assets/illustration1',
    'assets/illustration2',
    'assets/illustration3',
    'assets/illustration4'
];

const TextureArray = folderPaths.map(() => Array.from(Array(numberOfRows), () => Array(numberOfColumns)));

// Direction images
var TileImageDirection;

var stage, layer, leftLayer, rightLayer, selectionLayer;

class GridCell {
    constructor(row, col, sprite) {
        this.row = row;
        this.col = col;
        this.sprite = sprite; // Will store the PIXI.Sprite object
    }

    getPosition() {
        return { row: this.row, col: this.col };
    }

    setSprite(newSprite) {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.sprite = newSprite;
    }

    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}

let gridCells = [];

export { app, folderPaths, stageWidth, stageHeight, GRID_OFFSET_X, stageSize, cellSize, numberOfRows, numberOfColumns, COLORS, DIRECTION_COLORS, DragDirection, TileImageDirection, TextureArray, GridCell, gridCells };