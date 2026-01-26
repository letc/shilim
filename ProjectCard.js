import { app } from './Config.js';
import { whiteCircleBg } from './Resources.js';

// Track currently open detail window
let currentOpenDetailWindow = null;

function createDetailWindow(artistDetails, details, link, cardBackground, x, y) {
    const detailContainer = new PIXI.Container();
    detailContainer.x = x;
    detailContainer.y = y;

    // Detail window dimensions
    const detailWidth = 320;
    const detailHeight = 500;
    const padding = 20;

    // Create background with rounded corners
    const background = new PIXI.Graphics();
    background.lineStyle(1, 0xd2d2d2, 1);
    background.beginFill(0xFFFFFF);
    background.drawRoundedRect(0, 0, detailWidth, detailHeight, 15);
    background.endFill();
    detailContainer.addChild(background);

    // Create hit area for better interaction
    const hitArea = new PIXI.Rectangle(0, 0, detailWidth, detailHeight);
    detailContainer.hitArea = hitArea;
    detailContainer.eventMode = 'static';
    detailContainer.cursor = 'pointer';

    // Store initial position
    const initialY = detailContainer.y;
    let isHovered = false;

    const applyHoverState = () => {
        if (!isHovered) {
            isHovered = true;
            gsap.to(detailContainer, {
                y: initialY - 5,
                duration: 0.3,
                ease: 'power2.out'
            });
            background.clear();
            background.lineStyle(1, 0x2196F3, 1);
            background.beginFill(0xFFFFFF);
            background.drawRoundedRect(0, 0, detailWidth, detailHeight, 15);
            background.endFill();
            detailContainer.filters = [new PIXI.filters.DropShadowFilter({
                distance: 4,
                alpha: 0.1,
                blur: 8,
                quality: 3
            })];
        }
    };

    const removeHoverState = () => {
        if (isHovered) {
            isHovered = false;
            gsap.to(detailContainer, {
                y: initialY,
                duration: 0.3,
                ease: 'power2.out'
            });
            background.clear();
            background.lineStyle(1, 0xd2d2d2, 1);
            background.beginFill(0xFFFFFF);
            background.drawRoundedRect(0, 0, detailWidth, detailHeight, 15);
            background.endFill();
            detailContainer.filters = [];
        }
    };

    detailContainer.on('pointerover', applyHoverState);
    detailContainer.on('pointerout', removeHoverState);
    detailContainer.on('pointerupoutside', removeHoverState);

    // Create scrollable content container
    const scrollContainer = new PIXI.Container();
    const scrollbarWidth = 8;
    const closeButtonHeight = 24 + 10; // closeSize + top margin
    const topPadding = closeButtonHeight + 10; // Space for close button + extra margin
    const contentWidth = detailWidth - (padding * 2) - scrollbarWidth - 5;
    const scrollAreaHeight = detailHeight - topPadding - padding - 70; // Reserve space for button at bottom

    let currentY = 0;

    // Add Artist Details Section
    if (artistDetails) {
        const artistTitle = new PIXI.Text('Artist Details', {
            fontFamily: 'Gelasio',
            fontSize: 18,
            fontWeight: 'bold',
            fill: 0x2196F3,
            wordWrap: true,
            wordWrapWidth: contentWidth
        });
        artistTitle.x = 0;
        artistTitle.y = currentY;
        scrollContainer.addChild(artistTitle);
        currentY += artistTitle.height + 10;

        const artistText = new PIXI.Text(artistDetails, {
            fontFamily: 'Gelasio',
            fontSize: 16,
            fontStyle: 'normal',
            fill: 0x444444,
            wordWrap: true,
            wordWrapWidth: contentWidth,
            lineHeight: 24
        });
        artistText.x = 0;
        artistText.y = currentY;
        scrollContainer.addChild(artistText);
        currentY += artistText.height + 20;

        // Add separator line
        const separator = new PIXI.Graphics();
        separator.lineStyle(2, 0x999999, 1);
        separator.moveTo(0, 0);
        separator.lineTo(contentWidth, 0);
        separator.stroke();
        separator.x = 0;
        separator.y = currentY;
        scrollContainer.addChild(separator);
        currentY += 20;

    }

    // Add Project Details Section
    const projectTitle = new PIXI.Text('Project Details', {
        fontFamily: 'Gelasio',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0x2196F3,
        wordWrap: true,
        wordWrapWidth: contentWidth
    });
    projectTitle.x = 0;
    projectTitle.y = currentY;
    scrollContainer.addChild(projectTitle);
    currentY += projectTitle.height + 10;

    const detailText = new PIXI.Text(details, {
        fontFamily: 'Gelasio',
        fontSize: 16,
        fontStyle: 'normal',
        fill: 0x444444,
        wordWrap: true,
        wordWrapWidth: contentWidth,
        lineHeight: 24
    });
    detailText.x = 0;
    detailText.y = currentY;
    scrollContainer.addChild(detailText);
    currentY += detailText.height;

    const totalContentHeight = currentY;

    // Position scroll container
    scrollContainer.x = padding;
    scrollContainer.y = topPadding;

    // Create mask for scrollable area
    const scrollMask = new PIXI.Graphics();
    scrollMask.beginFill(0xFFFFFF);
    scrollMask.drawRect(padding, topPadding, contentWidth, scrollAreaHeight);
    scrollMask.endFill();
    detailContainer.addChild(scrollMask);
    scrollContainer.mask = scrollMask;

    detailContainer.addChild(scrollContainer);

    // Create scrollbar if content exceeds visible area
    if (totalContentHeight > scrollAreaHeight) {
        const scrollbarHeight = Math.max(30, (scrollAreaHeight / totalContentHeight) * scrollAreaHeight);
        const scrollbarTrack = new PIXI.Graphics();
        scrollbarTrack.beginFill(0xE0E0E0);
        scrollbarTrack.drawRoundedRect(detailWidth - scrollbarWidth - padding, topPadding, scrollbarWidth, scrollAreaHeight, 4);
        scrollbarTrack.endFill();
        detailContainer.addChild(scrollbarTrack);

        const scrollbarThumb = new PIXI.Graphics();
        scrollbarThumb.beginFill(0xAAAAAA);
        scrollbarThumb.drawRoundedRect(0, 0, scrollbarWidth, scrollbarHeight, 4);
        scrollbarThumb.endFill();
        scrollbarThumb.x = detailWidth - scrollbarWidth - padding;
        scrollbarThumb.y = topPadding;
        scrollbarThumb.eventMode = 'static';
        scrollbarThumb.cursor = 'pointer';
        detailContainer.addChild(scrollbarThumb);
        
        // Store reference to scrollbar thumb
        detailContainer.scrollbarThumb = scrollbarThumb;

        let isDragging = false;
        let dragStartY = 0;
        let scrollStartY = 0;

        const updateScrollPosition = (thumbY) => {
            const maxThumbY = scrollAreaHeight - scrollbarHeight;
            const clampedY = Math.max(0, Math.min(maxThumbY, thumbY));
            scrollbarThumb.y = topPadding + clampedY;
            const scrollRatio = clampedY / maxThumbY;
            const maxScroll = totalContentHeight - scrollAreaHeight;
            scrollContainer.y = topPadding - (scrollRatio * maxScroll);
        };

        scrollbarThumb.on('pointerdown', (event) => {
            isDragging = true;
            dragStartY = event.global.y;
            scrollStartY = scrollbarThumb.y - topPadding;
        });

        detailContainer.on('pointermove', (event) => {
            if (isDragging) {
                const deltaY = event.global.y - dragStartY;
                updateScrollPosition(scrollStartY + deltaY);
            }
        });

        detailContainer.on('pointerup', () => {
            isDragging = false;
        });

        detailContainer.on('pointerupoutside', () => {
            isDragging = false;
        });

        // Mouse wheel scrolling
        detailContainer.on('wheel', (event) => {
            const scrollDelta = event.deltaY * 0.5;
            const currentScrollRatio = (scrollbarThumb.y - topPadding) / (scrollAreaHeight - scrollbarHeight);
            const maxScroll = totalContentHeight - scrollAreaHeight;
            const currentScroll = currentScrollRatio * maxScroll;
            const newScroll = Math.max(0, Math.min(maxScroll, currentScroll + scrollDelta));
            const newScrollRatio = newScroll / maxScroll;
            updateScrollPosition(newScrollRatio * (scrollAreaHeight - scrollbarHeight));
        });

        scrollbarThumb.on('pointerover', () => {
            scrollbarThumb.tint = 0x888888;
        });

        scrollbarThumb.on('pointerout', () => {
            scrollbarThumb.tint = 0xFFFFFF;
        });
    } else {
        detailContainer.addChild(scrollContainer);
    }

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

        if (currentOpenDetailWindow === detailContainer) {
            currentOpenDetailWindow = null;
        }
    closeButton.on('pointertap', () => {
        detailContainer.visible = false;
        cardBackground.tint = 0xFFFFFF; // White
    });

    detailContainer.addChild(closeButton);
    
    // Store references for scroll position reset
    detailContainer.scrollContainer = scrollContainer;
    detailContainer.topPadding = topPadding;
    
    return detailContainer;
}

export function createProjectCard(title, author, date, link, details, artistDetails = '', x = 0, y = 0) {
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

    cardContainer.eventMode = 'static';
    cardContainer.cursor = 'pointer';

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
    const detailWindow = createDetailWindow(artistDetails, details, link, background, cardContainer.x + cardWidth + 20, cardContainer.y + 60);
    detailContainer.addChild(detailWindow);

    // Click handler to toggle detail window
    buttonContainer.on('pointertap', () => {
        // Close any previously open detail window
        if (currentOpenDetailWindow && currentOpenDetailWindow !== detailWindow) {
            currentOpenDetailWindow.visible = false;
            // Reset the previous card background
            if (currentOpenDetailWindow.cardBackground) {
                currentOpenDetailWindow.cardBackground.tint = 0xFFFFFF;
            }
        }

        detailWindow.visible = !detailWindow.visible;
        
        // Reset scroll position when opening
        if (detailWindow.visible) {
            detailWindow.scrollContainer.y = detailWindow.topPadding;
            if (detailWindow.scrollbarThumb) {
                detailWindow.scrollbarThumb.y = detailWindow.topPadding;
            }
            currentOpenDetailWindow = detailWindow;
            detailWindow.cardBackground = background;
            background.tint = 0xE6F3FF; // Light blue
        } else {
            if (currentOpenDetailWindow === detailWindow) {
                currentOpenDetailWindow = null;
            }
            background.tint = 0xFFFFFF; // White
        }
    });

    // Store reference to detail container for cleanup
    cardContainer.detailContainer = detailContainer;

    cardContainer.addChild(buttonContainer);

    return cardContainer;
}
