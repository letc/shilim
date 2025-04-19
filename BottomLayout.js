import { app } from './Config.js';

async function initBottomLayout() {
    try {
        // Create a container for the bottom layout
        const layoutContainer = new PIXI.Container();
        layoutContainer.x = 430;  // Position from left
        layoutContainer.y = app.screen.height - 50;  // Position at bottom
        layoutContainer.eventMode = 'static';

        // Create background with rounded corners
        const background = new PIXI.Graphics();
        background.beginFill(0xEEEEEE);
        background.drawRoundedRect(0, 0, 1000, 50, 20);
        background.endFill();
        layoutContainer.addChild(background);

        // Total width of the layout
        const totalWidth = 1000;

        // Create sections with text
        const sections = [
            { text: 'ART', color: 0x97a266, container: null },      // Light blue-gray
            { text: 'RESEARCH', color: 0x445768, container: null },  // Dark gray
            { text: 'ECOLOGY', color: 0x97a266, container: null },   // Olive green
            { text: 'CULTURE', color: 0xBCAB99, container: null }    // Beige
        ];

        // Function to update section sizes based on percentages
        function updateSectionSizes(p1 = 25, p2 = 25, p3 = 25, p4 = 25) {
            // Validate percentages
            const percentages = [p1, p2, p3, p4];
            const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);
            if (totalPercentage > 100) {
                console.error('Total percentage cannot exceed 100%');
                return;
            }

            let currentX = 0;

            sections.forEach((section, index) => {
                const percentage = percentages[index];
                console.log(`Section ${section.text}: color = ${section.color.toString(16)}`); // Debug color
                if (percentage <= 0) {
                    // Hide section if percentage is 0
                    if (section.container) {
                        section.container.visible = false;
                    }
                    return;
                }

                // Show and update section
                if (section.container) {
                    section.container.visible = true;
                    const width = (percentage / 100) * totalWidth;

                    // Update background
                    const sectionBg = section.container.getChildAt(0);
                    sectionBg.clear();
                    
                    // Apply rounded corners based on position
                    const isFirst = currentX === 0;
                    const isLast = index === sections.findLastIndex(s => percentages[sections.indexOf(s)] > 0);

                    // Set both line style and fill to the same color
                    sectionBg.lineStyle(1, section.color, 1);
                    sectionBg.beginFill(section.color, 1);

                    // Draw the shape with the current color
                    if (isFirst && isLast) {
                        // Both corners rounded if it's the only visible section
                        sectionBg.drawRoundedRect(0, 0, width, 50, 20);
                    } else if (isFirst) {
                        // Only left corners rounded
                        sectionBg.drawRoundedRect(0, 0, width, 50, { 
                            tl: 20, tr: 0, bl: 20, br: 0 
                        });
                    } else if (isLast) {
                        // Only right corners rounded
                        sectionBg.drawRoundedRect(0, 0, width, 50, { 
                            tl: 0, tr: 20, bl: 0, br: 20 
                        });
                    } else {
                        // No rounded corners
                        sectionBg.drawRect(0, 0, width, 50);
                    }

                    // End both fill and line style
                    sectionBg.endFill();
                    sectionBg.lineStyle(0);

                    // Update position and text
                    section.container.x = currentX;
                    const text = section.container.getChildAt(1);
                    text.x = width - 10; // Right align with 10px padding
                }

                currentX += (percentage / 100) * totalWidth;
            });
        }

        // Create initial sections
        sections.forEach((section, index) => {
            // Create container for each section
            const sectionContainer = new PIXI.Container();
            section.container = sectionContainer;

            // Create section background
            const sectionBg = new PIXI.Graphics();
            sectionContainer.addChild(sectionBg);

            // Add text
            const text = new PIXI.Text(section.text, {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0xFFFFFF,
                align: 'right'
            });
            text.anchor.set(1, 0.5);
            text.y = 25; // Vertically centered
            sectionContainer.addChild(text);

            layoutContainer.addChild(sectionContainer);
        });

        // Initial layout with equal sizes
        updateSectionSizes();

        app.stage.addChild(layoutContainer);
        
        // Return both the container and the update function
        return {
            container: layoutContainer,
            updateSectionSizes
        };

    } catch (error) {
        console.error('Error in initBottomLayout:', error);
    }
}

export { initBottomLayout };
