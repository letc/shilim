import { app } from './Config.js';
let content;
async function initInfoSection() {
    try {
        // Create a container for the image section
        const imageContainer = new PIXI.Container();
        imageContainer.x = 10;  // Position from left
        imageContainer.y = 10;    // Position from top
        imageContainer.eventMode = 'static';
        

        // Create a container for the background with effects
        const bgContainer = new PIXI.Container();

        // Load the background
        const bgTexture = await PIXI.Assets.load('assets/bg_white.png');
        
        
        
        //archiveIndex--------------------------------------

        const archiveIndexRect = {
            x: 0,
            y: 0,
            width: 290,
            height: 50,
        };

        const archiveIndexImage = new PIXI.Sprite(bgTexture);
        archiveIndexImage.x = archiveIndexRect.x;
        archiveIndexImage.y = archiveIndexRect.y;
        archiveIndexImage.width = archiveIndexRect.width;
        archiveIndexImage.height = archiveIndexRect.height;

        // Create stroke and mask using graphics
        const bgGraphics = new PIXI.Graphics();
        bgGraphics.lineStyle(1, 0xd2d2d2, 1);
        bgGraphics.beginFill(0xFFFFFF);
        bgGraphics.drawRoundedRect(archiveIndexRect.x, archiveIndexRect.y, archiveIndexRect.width, archiveIndexRect.height, 20);
        bgGraphics.endFill();

        // Create mask for rounded corners
        const bgMask = new PIXI.Graphics();
        bgMask.beginFill(0xFFFFFF);
        bgMask.drawRoundedRect(archiveIndexRect.x, archiveIndexRect.y, archiveIndexRect.width, archiveIndexRect.height, 20);
        bgMask.endFill();
        archiveIndexImage.mask = bgMask;

        // Add text element with padding
        const archiveIndexLabelText = new PIXI.Text('archive index', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x808080,
            align: 'left',
            fontStyle: 'italic'
        });
        archiveIndexLabelText.x = 12; // 10px padding from left
        archiveIndexLabelText.y = 14; // 10px padding from top
        //archiveIndex--------------------------------------




        //archiveIndexValue--------------------------------------

        const archiveIndexValueRect = {
            x: 250,
            y: 10,
            width: 30,
            height: 30,
        };

        const archiveIndexValueImage = new PIXI.Sprite(bgTexture);
        archiveIndexValueImage.x = archiveIndexValueRect.x;
        archiveIndexValueImage.y = archiveIndexValueRect.y;
        archiveIndexValueImage.width = archiveIndexValueRect.width;
        archiveIndexValueImage.height = archiveIndexValueRect.height;

        // Create stroke and mask using graphics
        const bgArchiveIndexValueGraphics = new PIXI.Graphics();
        bgArchiveIndexValueGraphics.lineStyle(1, 0xd2d2d2, 1);
        bgArchiveIndexValueGraphics.beginFill(0xFFFFFF);
        bgArchiveIndexValueGraphics.drawRoundedRect(archiveIndexValueRect.x, archiveIndexValueRect.y, archiveIndexValueRect.width, archiveIndexValueRect.height, 20);
        bgArchiveIndexValueGraphics.endFill();

        // Create mask for rounded corners
        const bgArchiveIndexValueMask = new PIXI.Graphics();
        bgArchiveIndexValueMask.beginFill(0xFFFFFF);
        bgArchiveIndexValueMask.drawRoundedRect(archiveIndexValueRect.x, archiveIndexValueRect.y, archiveIndexValueRect.width, archiveIndexValueRect.height, 20);
        bgArchiveIndexValueMask.endFill();
        archiveIndexValueImage.mask = bgArchiveIndexValueMask;

        // Add text element with padding
        const archiveIndexValueLabelText = new PIXI.Text('0', {
            fontFamily: 'Arial',
            fontSize: 20,
            fill: 0x808080,
            align: 'center',
            fontStyle: 'italic'
        });
        archiveIndexValueLabelText.x = archiveIndexValueRect.x + 8; // 10px padding from left
        archiveIndexValueLabelText.y = archiveIndexValueRect.y + 4; // 10px padding from top
        //archiveIndexValue--------------------------------------





        // Add everything to the container
        bgContainer.addChild(archiveIndexImage);
        bgContainer.addChild(bgGraphics);
        bgContainer.addChild(bgMask);
        bgContainer.addChild(archiveIndexLabelText);

        bgContainer.addChild(archiveIndexValueImage);
        bgContainer.addChild(bgArchiveIndexValueGraphics);
        bgContainer.addChild(bgArchiveIndexValueMask);
        bgContainer.addChild(archiveIndexValueLabelText);

        imageContainer.addChild(bgContainer);

        // Add the container to the stage
        app.stage.addChild(imageContainer);
        

        // Create a container for the scroll area
        const scrollContainer = new PIXI.Container();
        scrollContainer.x = 0;
        scrollContainer.y = 0;
        scrollContainer.width = 300;
        scrollContainer.height = 1000;
        scrollContainer.eventMode = 'static';

        // Create a mask for the scroll container
        const scrollMask = new PIXI.Graphics();
        scrollMask.beginFill(0xFFFFFF);
        scrollMask.drawRect(0, 0, 300, 1000);
        scrollMask.endFill();
        scrollContainer.mask = scrollMask;
        app.stage.addChild(scrollMask);

        // Create text content
        content = new PIXI.Text('', {
            fontSize: 10,
            fill: 0x000000,
            wordWrap: true,
            wordWrapWidth: 280,
            lineHeight: 24,
            align: 'center'
        });
        content.x = 10;
        content.y = 10;
        scrollContainer.addChild(content);

        // Create scrollbar background
        const scrollbarBg = new PIXI.Graphics();
        scrollbarBg.beginFill(0xDDDDDD);
        scrollbarBg.drawRoundedRect(290, 0, 10, 1000, 5);
        scrollbarBg.endFill();
        app.stage.addChild(scrollbarBg);

        // Create scrollbar thumb
        const scrollbarThumb = new PIXI.Graphics();
        scrollbarThumb.beginFill(0x999999);
        scrollbarThumb.drawRoundedRect(0, 0, 6, 100, 3);
        scrollbarThumb.endFill();
        scrollbarThumb.x = 292;
        scrollbarThumb.y = 2;
        scrollbarThumb.eventMode = 'static';
        scrollbarThumb.cursor = 'pointer';
        app.stage.addChild(scrollbarThumb);

        // Calculate scrollbar properties
        let contentHeight = content.height;
        const viewportHeight = 1000;
        let scrollableHeight = Math.max(0, contentHeight - viewportHeight);
        let thumbHeight = Math.max(50, (viewportHeight / contentHeight) * viewportHeight);
        const scrollTrackHeight = viewportHeight - 4;
        scrollbarThumb.height = thumbHeight;

        // Function to update scroll position and scrollbar
        function updateScrollbar() {
            contentHeight = content.height;
            scrollableHeight = Math.max(0, contentHeight - viewportHeight);
            thumbHeight = Math.max(50, (viewportHeight / contentHeight) * viewportHeight);
            scrollbarThumb.height = thumbHeight;

            // Center content if it's smaller than viewport
            if (contentHeight <= viewportHeight) {
                scrollContainer.y = (viewportHeight - contentHeight) / 2;
                scrollbarThumb.visible = false;
                scrollbarBg.visible = false;
            } else {
                scrollbarThumb.visible = true;
                scrollbarBg.visible = true;
                // Keep scroll position within bounds
                scrollContainer.y = Math.max(-scrollableHeight, Math.min(0, scrollContainer.y));
            }
        }

        // Initial position update
        updateScrollbar();

        // Scrollbar drag functionality
        let isDragging = false;
        let dragStartY = 0;
        let startScrollY = 0;

        scrollContainer.on('pointerdown', (event) => {
            content.text += 'New text added after drag!\n'.repeat(5);
            updateScrollbar();
        });

        scrollbarThumb.on('pointerdown', (event) => {
            // Only allow dragging if content is larger than viewport
            if (contentHeight > viewportHeight) {
                isDragging = true;
                dragStartY = event.globalY;
                startScrollY = scrollContainer.y;
            }
            console.log('pointerdown', isDragging);
        });

        app.stage.on('pointermove', (event) => {
            console.log('pointermove', isDragging);
            if (!isDragging || contentHeight <= viewportHeight) return;

            const dy = event.globalY - dragStartY;
            const scrollRatio = dy / (scrollTrackHeight - thumbHeight);
            const newScrollY = Math.max(
                -scrollableHeight,
                Math.min(0, startScrollY - (scrollableHeight * scrollRatio))
            );
            
            scrollContainer.y = newScrollY;
            const thumbY = 2 + ((Math.abs(newScrollY) / scrollableHeight) * (scrollTrackHeight - thumbHeight));
            scrollbarThumb.y = thumbY;
        });

        app.stage.on('pointerup', () => {
            if (isDragging) {
                // Add new text when drag ends
                content.text += 'New text added after drag!\n'.repeat(5);
                updateScrollbar();
            }
            console.log('pointerup', isDragging);
            isDragging = false;
        });

        // Mouse wheel scrolling
        scrollContainer.on('wheel', (event) => {
            // Check if mouse is within bounds
            const mouseX = event.globalX;
            const mouseY = event.globalY;
            
            // Define scroll area bounds
            const bounds = {
                x: 0,
                y: 0,
                width: 300,
                height: 1000
            };

            // Check if mouse is within bounds and content is larger than viewport
            if (mouseX >= bounds.x && 
                mouseX <= bounds.x + bounds.width && 
                mouseY >= bounds.y && 
                mouseY <= bounds.y + bounds.height &&
                contentHeight > viewportHeight) {
                
                const newScrollY = Math.max(
                    -scrollableHeight,
                    Math.min(0, scrollContainer.y - event.deltaY)
                );
                
                scrollContainer.y = newScrollY;
                const thumbY = 2 + ((Math.abs(newScrollY) / scrollableHeight) * (scrollTrackHeight - thumbHeight));
                scrollbarThumb.y = thumbY;
            }
        });

        app.stage.addChild(scrollContainer);

    } catch (error) {
        console.error('Error initializing info section:', error);
    }
}

export { initInfoSection, content };