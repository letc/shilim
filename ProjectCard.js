import { app } from './Config.js';

export function createProjectCard(title, author, date, link, x = 0, y = 0) {
    const cardContainer = new PIXI.Container();
    cardContainer.x = x;
    cardContainer.y = y;

    // Card dimensions
    const cardWidth = 280;
    const cardHeight = 100;
    const padding = 15;

    // Create background with rounded corners
    const background = new PIXI.Graphics();
    background.lineStyle(1, 0xd2d2d2, 1);
    background.beginFill(0xFFFFFF);
    background.drawRoundedRect(0, 0, cardWidth, cardHeight, 10);
    background.endFill();
    cardContainer.addChild(background);

    // Title text
    const titleText = new PIXI.Text(title, {
        fontFamily: 'Arial',
        fontSize: 16,
        fontStyle: 'italic',
        fill: 0x000000,
        wordWrap: true,
        wordWrapWidth: cardWidth - (padding * 2)
    });
    titleText.x = padding;
    titleText.y = padding;
    cardContainer.addChild(titleText);

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
    cardContainer.addChild(authorText);

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
    cardContainer.addChild(dateText);

    // Create button container in bottom right
    const buttonSize = 24;
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

    // Click handler to open link
    buttonContainer.on('pointertap', () => {
        if (link) {
            window.open(link, '_blank');
        }
    });

    cardContainer.addChild(buttonContainer);

    return cardContainer;
}
