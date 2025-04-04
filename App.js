import { app } from './Config.js';

async function initApp() {
    try {
        // Configure the application
        await app.init({
            width: 960,
            height: 540,
            backgroundColor: 0xFFFFFF,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            canvas: document.createElement('canvas')
        });

        // Add the Pixi canvas to our container
        document.getElementById('app-container').appendChild(app.view);

        try {
            // Initialize the asset loader
            await PIXI.Assets.init();

            // Load the background image
            const texture = await PIXI.Assets.load('assets/bg_yellow.png');

            // Create the background sprite
            const background = new PIXI.Sprite(texture);

            // Make the background fill the screen
            background.width = app.screen.width;
            background.height = app.screen.height;

            // Add the background to the stage
            app.stage.addChild(background);

        } catch (error) {
            console.error('Error loading game assets:', error);
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

export { initApp };