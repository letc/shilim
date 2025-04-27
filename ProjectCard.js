import { app } from './Config.js';
import { whiteCircleBg } from './Resources.js';

function createDetailWindow(details, link, cardBackground, x, y) {
    const detailContainer = new PIXI.Container();
    detailContainer.x = x;
    detailContainer.y = y;

    // Detail window dimensions
    const detailWidth = 320;
    const detailHeight = 400;
    const padding = 20;

    // Create background with rounded corners
    const background = new PIXI.Graphics();
    background.lineStyle(1, 0xd2d2d2, 1);
    background.beginFill(0xFFFFFF);
    background.drawRoundedRect(0, 0, detailWidth, detailHeight, 15);
    background.endFill();
    detailContainer.addChild(background);

    // Add title
    const detailText = new PIXI.Text(details, {
        fontFamily: 'Gelasio',
        fontSize: 20,
        fontStyle: 'normal',
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: detailWidth - (padding * 2)
    });
    detailText.x = padding;
    detailText.y = padding;
    detailContainer.addChild(detailText);

    // Create URL button
    const urlButton = new PIXI.Container();
    
    const buttonSize = 50;
    
    const buttonBg = new PIXI.Sprite(whiteCircleBg);
    buttonBg.width = buttonSize;
    buttonBg.height = buttonSize;
    urlButton.addChild(buttonBg);

    urlButton.x = detailWidth - buttonSize - padding;
    urlButton.y = detailHeight - buttonSize - padding;

    urlButton.eventMode = 'static';
    urlButton.cursor = 'pointer';

    urlButton.on('pointerover', () => {
        buttonBg.tint = 0x3570B2;
    });

    urlButton.on('pointerout', () => {
        buttonBg.tint = 0xFFFFFF;
    });

    urlButton.on('pointertap', () => {
        if (link) {
            detailContainer.visible = false;
        cardBackground.tint = 0xFFFFFF; // White
            window.open(link, '_blank');
        }
    });

    detailContainer.addChild(urlButton);
    detailContainer.visible = false;
    
    // Add close button
    const closeButton = new PIXI.Container();
    const closeSize = 24;
    const closeBg = new PIXI.Graphics();
    closeBg.beginFill(0xd2d2d2);
    closeBg.drawCircle(closeSize/2, closeSize/2, closeSize/2);
    closeBg.endFill();
    closeButton.addChild(closeBg);

    // Add X symbol
    const closeSymbol = new PIXI.Text('×', {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0x000000
    });
    closeSymbol.x = (closeSize - closeSymbol.width) / 2;
    closeSymbol.y = (closeSize - closeSymbol.height) / 2;
    closeButton.addChild(closeSymbol);

    closeButton.x = detailWidth - closeSize - 10;
    closeButton.y = 10;
    closeButton.eventMode = 'static';
    closeButton.cursor = 'pointer';

    closeButton.on('pointerover', () => {
        closeBg.tint = 0xb0b0b0;
    });

    closeButton.on('pointerout', () => {
        closeBg.tint = 0xFFFFFF;
    });

    closeButton.on('pointertap', () => {
        detailContainer.visible = false;
        cardBackground.tint = 0xFFFFFF; // White
    });

    detailContainer.addChild(closeButton);
    return detailContainer;
}

export function createProjectCard(title, author, date, link, details, x = 0, y = 0) {
    const cardContainer = new PIXI.Container();
    cardContainer.x = x;
    cardContainer.y = y;

    // Card dimensions
    const cardWidth = 280;
    let cardHeight = 100;
    const padding = 15;
    const buttonSize = 24;
    const buttonPadding = padding;

    // Add text elements first to calculate total height
    // Title text
    const titleText = new PIXI.Text(title, {
        fontFamily: 'Gelasio',
        fontSize: 19,
        fontStyle: 'normal',
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: cardWidth - (padding * 2)
    });
    titleText.x = padding;
    titleText.y = padding;

    // Author text
    const authorText = new PIXI.Text(author, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0x808080,
        wordWrap: true,
        wordWrapWidth: cardWidth - (padding * 2)
    });
    authorText.x = padding;
    authorText.y = titleText.y + titleText.height + 8;

    // Date text
    const dateText = new PIXI.Text(date, {
        fontFamily: 'Arial',
        fontSize: 14,
        fill: 0x808080,
        wordWrap: true,
        wordWrapWidth: cardWidth - (padding * 2)
    });
    dateText.x = padding;
    dateText.y = authorText.y + authorText.height + 8;

    // Calculate required height
    const contentHeight = dateText.y + dateText.height + buttonPadding;
    cardHeight = Math.max(cardHeight, contentHeight);

    // Create background with rounded corners
    const background = new PIXI.Graphics();
    background.lineStyle(1, 0xd2d2d2, 1);
    background.beginFill(0xFFFFFF);
    background.drawRoundedRect(0, 0, cardWidth, cardHeight, 26);
    background.endFill();
    cardContainer.addChild(background);

    // Now add the text elements to the container
    cardContainer.addChild(titleText);
    cardContainer.addChild(authorText);
    cardContainer.addChild(dateText);



    // Create button container in bottom right
    const buttonContainer = new PIXI.Container();
    buttonContainer.x = cardWidth - buttonSize - padding;
    buttonContainer.y = cardHeight - buttonSize - padding;
    
    // Button background (circle)
    const buttonBg = new PIXI.Graphics();
    buttonBg.beginFill(0xd2d2d2);
    buttonBg.drawCircle(buttonSize/2, buttonSize/2, buttonSize/2);
    buttonBg.endFill();
    buttonContainer.addChild(buttonBg);

    // Make button interactive
    buttonContainer.eventMode = 'static';
    buttonContainer.cursor = 'pointer';

    // Button hover effects
    buttonContainer.on('pointerover', () => {
        buttonBg.tint = 0xb0b0b0;
    });

    buttonContainer.on('pointerout', () => {
        buttonBg.tint = 0xFFFFFF;
    });

    // Create a separate container for the detail window to avoid clipping
    const detailContainer = new PIXI.Container();
    app.stage.addChild(detailContainer);

    // Create detail window
    const detailWindow = createDetailWindow(details, link, background, cardContainer.x + cardWidth + 20, cardContainer.y + 60);
    detailContainer.addChild(detailWindow);

    // Click handler to toggle detail window
    buttonContainer.on('pointertap', () => {
        detailWindow.visible = !detailWindow.visible;
        // Change card background color
        if (detailWindow.visible) {
            background.tint = 0xE6F3FF; // Light blue
        } else {
            background.tint = 0xFFFFFF; // White
        }
    });

    // Store reference to detail container for cleanup
    cardContainer.detailContainer = detailContainer;

    cardContainer.addChild(buttonContainer);

    return cardContainer;
}
