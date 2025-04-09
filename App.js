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

        // Add rounded corners and stroke to the canvas
        app.view.style.borderRadius = '26px';
        app.view.style.border = '2px solid #d2d2d2';
        app.view.style.backgroundColor = '#FFFFFF';

        // Add the Pixi canvas to our container
        document.getElementById('app-container').appendChild(app.view);

        try {
            // Initialize the asset loader
            await PIXI.Assets.init();

        } catch (error) {
            console.error('Error loading game assets:', error);
        }
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

export { initApp };