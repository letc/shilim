var stage, layer;
const stageWidth = 960;
const stageHeight = 540;

function initStage() {


    /* let stageSize = stageWidth;

    if(stageHeight < stageWidth){
        stageSize = stageHeight;
    }
    else if(stageWidth < stageHeight){
        stageSize = stageWidth;
    }

    const numberOfCells = 10;

    stageSize = findDivisible(stageSize, numberOfCells);
    const cellSize = stageSize / numberOfCells; // 10x10 grid
    const gridSize = stageSize / cellSize; */

    stage = new Konva.Stage({
        container: 'konva-container',
        width: stageWidth,
        height: stageHeight
    });


    layer = new Konva.Layer();
    stage.add(layer);
}