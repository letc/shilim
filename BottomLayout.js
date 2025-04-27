import { app, stageWidth } from './Config.js';

const container = document.getElementById('app-container');

// Total width of the layout
let totalWidth = 1100;

// Create sections with text
const sections = [
    { text: 'ART', color: 0xb1c6c9, container: null },      // Light blue-gray
    { text: 'RESEARCH', color: 0x445768, container: null },  // Dark gray
    { text: 'ECOLOGY', color: 0x97a266, container: null },   // Olive green
    { text: 'CULTURE', color: 0xBCAB99, container: null }    // Beige
];

// Store the layout container globally
let layoutContainer = null;

// Function to update section sizes based on percentages
function updateSectionSizes(p1 = 25, p2 = 25, p3 = 25, p4 = 25) {

    if(layoutContainer == null) {
        console.log('Layout container not initialized');
        return;
    }
    // Adjust percentages if total exceeds 100%
    let adjustedPercentages = [p1, p2, p3, p4];
    let total = adjustedPercentages.reduce((sum, p) => sum + p, 0);
    
    if (total > 100) {
        // Scale down all percentages proportionally
        const scale = 100 / total;
        adjustedPercentages = adjustedPercentages.map(p => p * scale);
        //console.log('Adjusted percentages to:', adjustedPercentages);
        [p1, p2, p3, p4] = adjustedPercentages;
    }

    layoutContainer.removeChildren();

    // Create background with rounded corners
    const background = new PIXI.Graphics();
    background.beginFill(0xEEEEEE);
    background.drawRoundedRect(0, 0, totalWidth, 50, 20);
    background.endFill();
    layoutContainer.addChild(background);
    
    // Create initial sections
    sections.forEach((section, index) => {
        // Create container for each section
        const sectionContainer = new PIXI.Container();
        section.container = sectionContainer;
        sectionContainer.interactive = false;

        // Create section background
        const sectionBg = new PIXI.Graphics();
        sectionContainer.addChild(sectionBg);
        sectionBg.interactive = false;

        // Add text label
        const textLabel = new PIXI.Text(section.text, {
            fontFamily: 'Arial',
            fontSize: 16,
            fill: 0xFFFFFF,
            align: 'right'
        });
        textLabel.anchor.set(1, 0.5);
        textLabel.y = 25; // Vertically centered
        textLabel.interactive = false;
        sectionContainer.addChild(textLabel);

        layoutContainer.addChild(sectionContainer);
    });

    //console.log('Updating sections with percentages:', [p1, p2, p3, p4]);

    // Ensure we have the layout container
    if (!layoutContainer) {
        console.error('Layout container not initialized');
        return;
    }

    let currentX = 0;

    sections.forEach((section, index) => {
        const percentage = [p1, p2, p3, p4][index];
        //console.log(`Section ${section.text}: ${percentage}%, container:`, section.container?.visible);
        
        // Show and update section if percentage > 0, hide if 0
        if (section.container) {
            if (percentage <= 0) {
                section.container.visible = false;
                //console.log(`Hiding section ${section.text}`);
            } else {
                section.container.visible = true;
                const width = (percentage / 100) * totalWidth;
                
                // Get text element and check if it fits
                const textLabel = section.container.getChildAt(1); // Text is the second child
                const textWidth = textLabel.width + 10; // Add some padding
                textLabel.visible = textWidth <= width;
                
                //console.log(`Showing section ${section.text} with width ${width}, text width: ${textWidth}`);

                // Update background
                const sectionBg = section.container.getChildAt(0);
                sectionBg.clear();
            
                // Apply rounded corners based on position
                const isFirst = currentX === 0;
                const isLast = index === sections.findLastIndex((_, i) => [p1, p2, p3, p4][i] > 0);
                const radius = 20;

                // Draw main rectangle
                sectionBg.beginFill(section.color);
                sectionBg.drawRect(0, 0, width, 50);
                sectionBg.endFill();

                // Draw rounded corners if needed
                if (isFirst || isLast) {
                    // Create a mask for rounded corners
                    const mask = new PIXI.Graphics();
                    mask.beginFill(0xFFFFFF);

                    if (isFirst && isLast) {
                        // All corners rounded
                        mask.drawRect(radius, 0, width - 2 * radius, 50);
                        mask.drawCircle(radius, radius, radius);
                        mask.drawCircle(radius, 50 - radius, radius);
                        mask.drawCircle(width - radius, radius, radius);
                        mask.drawCircle(width - radius, 50 - radius, radius);
                    } else if (isFirst) {
                        // Left corners rounded
                        mask.drawRect(radius, 0, width - radius, 50);
                        mask.drawCircle(radius, radius, radius);
                        mask.drawCircle(radius, 50 - radius, radius);
                    } else {
                        // Right corners rounded
                        mask.drawRect(0, 0, width - radius, 50);
                        mask.drawCircle(width - radius, radius, radius);
                        mask.drawCircle(width - radius, 50 - radius, radius);
                    }
                    mask.endFill();

                    // Apply the mask
                    sectionBg.mask = mask;
                    sectionBg.addChild(mask);
                }

                // Update position and text
                section.container.x = currentX;
                const text = section.container.getChildAt(1);
                text.x = width - 10; // Right align with 10px padding

                currentX += width;
            }
        }
    });
}

async function initBottomLayout() {
    try {
        // Create a container for the bottom layout
        layoutContainer = new PIXI.Container();
        layoutContainer.x = 390;  // Position from left
        layoutContainer.y = app.screen.height - 60;  // Position at bottom
        //layoutContainer.eventMode = 'static';
        // Make the container non-interactable
        layoutContainer.interactive = false;

        totalWidth = (container.clientWidth - 390) - 10; // 10 is padding, // 440 is left margin

        // Initial layout with equal sizes
        updateSectionSizes(0,0,0,0);

        app.stage.addChild(layoutContainer);

        // Handle window resizing
        function resize() {

            totalWidth = (container.clientWidth - 390) - 10; // 10 is padding, // 440 is left margin

            layoutContainer.y = container.clientHeight - 60;
        }

        // Initial resize
        resize();

        // Add window resize listener
        window.addEventListener('resize', resize);

    } catch (error) {
        console.error('Error in initBottomLayout:', error);
    }
}

export { initBottomLayout, updateSectionSizes };
