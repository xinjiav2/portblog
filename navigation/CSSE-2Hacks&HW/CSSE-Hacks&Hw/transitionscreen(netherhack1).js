import GameLevel from "./GameLevel.js";
class GameControl {
    /**
     * GameControl class to manage the game levels and transitions
     * @param {*} path - The path to the game assets
     * @param {*} levelClasses - The classes of for each game level
     */
    constructor(game, levelClasses) {
        // GameControl properties
        this.game = game; // Reference required for game-in-game logic
        this.path = game.path;
        this.gameContainer = game.gameContainer; // Document element that contains the game
        this.gameCanvas = game.gameCanvas; // Document element that contains the game canvas
        this.levelClasses = levelClasses;
        this.currentLevel = null;
        this.currentLevelIndex = 0;
        this.gameLoopCounter = 0;
        this.isPaused = false;
        this.exitKeyListener = this.handleExitKey.bind(this);
        this.gameOver = null; // Callback for when the game is over
        this.savedCanvasState = []; // Save the current levels game elements
    }
    /**
     * Starts the game by
     * 1. Adding an exit key listener
     * 2. Transitioning to the first level
     */
    start() {
        this.addExitKeyListener();
        this.transitionToLevel();
    }
    /**
     * Transitions to the next level in the level by
     * 1. Creating a new GameLevel instance
     * 2. Creating the level using the GameLevelClass
     * 3. Starting the game loop
     */




    


// specific transition part starts here
    transitionToLevel() {
        const fadeOverlay = document.createElement('div');
        fadeOverlay.style.position = 'fixed';
        fadeOverlay.style.top = '0';
        fadeOverlay.style.left = '0';
        fadeOverlay.style.width = '100%';
        fadeOverlay.style.height = '100%';
        fadeOverlay.style.background = 'radial-gradient(circle, rgba(58,180,242,1) 0%, rgba(16,16,16,1) 100%)';
        fadeOverlay.style.opacity = '0';
        fadeOverlay.style.transition = 'opacity 1s ease-in-out';
        fadeOverlay.style.display = 'flex';
        fadeOverlay.style.justifyContent = 'center';
        fadeOverlay.style.alignItems = 'center';
        fadeOverlay.style.fontSize = '2em';
        fadeOverlay.style.color = '#0ff';
        fadeOverlay.style.textShadow = '0 0 10px #0ff, 0 0 20px #0ff, 0 0 40px #0ff';
        const loadingText = document.createElement('p');
        loadingText.textContent = 'Loading...';
        fadeOverlay.appendChild(loadingText);
        document.body.appendChild(fadeOverlay);
        // Fade to neon effect
        requestAnimationFrame(() => {
            fadeOverlay.style.opacity = '1';
        });
        setTimeout(() => {
            // Switch levels when screen is dark
            const GameLevelClass = this.levelClasses[this.currentLevelIndex];
            this.currentLevel = new GameLevel(this);
            this.currentLevel.create(GameLevelClass);
            // Fade back in
            fadeOverlay.style.opacity = '0';
            setTimeout(() => document.body.removeChild(fadeOverlay), 1000);
            // Start game loop after transition
            this.gameLoop();
        }, 1000); // Wait for fade-out duration
    }




// ends here
    /**
     * The main game loop
     */
    gameLoop() {
        // If the level is not set to continue, handle the level end condition
        if (!this.currentLevel.continue) {
            this.handleLevelEnd();
            return;
        }
        // If the game level is paused, stop the game loop
        if (this.isPaused) {
            return;
        }
        // Level updates
        this.currentLevel.update();
        this.handleInLevelLogic();
        // Recurse at frame rate speed
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    /**
     * This method is a placeholder for future logic that needs to be executed during the game loop.
     * For example, a starting page or time-based events
     */
    handleInLevelLogic() {
        // This condition is established for future starting page logic
        if (this.currentLevelIndex === 0 && this.gameLoopCounter === 0) {
            console.log("Start Level.");
        }
        // This counter is established for future time-based logic, like frames per second
        this.gameLoopCounter++;
    }
    /**
     * Handles the level end by
     * 1. Destroying the current level
     * 2. Calling the gameOver callback if it exists
     * 3. Transitioning to the next level
     */
    handleLevelEnd() {
        // Alert the user that the level has ended
        if (this.currentLevelIndex < this.levelClasses.length - 1) {
            alert("Level ended.");
        } else {
            alert("All levels completed.");
        }
        this.currentLevel.destroy();
        // Call the gameOver callback if it exists
        if (this.gameOver) {
            this.gameOver();
        } else {
            this.currentLevelIndex++;
            this.transitionToLevel();
        }
    }
    /**
     * Exit key handler to end the current level
     * @param {*} event - The keydown event object
     */
    handleExitKey(event) {
        if (event.key === 'Escape') {
            this.currentLevel.continue = false;
        }
    }
    // Helper methods omitted for brevity...
}
export default GameControl;