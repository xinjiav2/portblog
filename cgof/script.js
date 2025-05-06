document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const stepBtn = document.getElementById('stepBtn');
    const clearBtn = document.getElementById('clearBtn');
    const randomBtn = document.getElementById('randomBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const generationCount = document.getElementById('generationCount');
    const populationCount = document.getElementById('populationCount');
    
    // Pattern buttons
    const gliderBtn = document.getElementById('gliderBtn');
    const blinkerBtn = document.getElementById('blinkerBtn');
    const gliderGunBtn = document.getElementById('gliderGunBtn');
    const pulsarBtn = document.getElementById('pulsarBtn');
    
    let cellSize = parseInt(sizeSlider.value);
    let cols = Math.floor(canvas.width / cellSize);
    let rows = Math.floor(canvas.height / cellSize);
    let grid = createEmptyGrid();
    let nextGrid = createEmptyGrid();
    let isRunning = false;
    let generation = 0;
    let animationId = null;
    let fps = parseInt(speedSlider.value);
    let lastFrameTime = 0;
    
    function createEmptyGrid() {
        return Array(cols).fill().map(() => Array(rows).fill(0));
    }
    
    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ddd';
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (grid[i][j] === 1) {
                    ctx.fillStyle = '#333';
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
                ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }
    
    function countNeighbors(grid, x, y) {
        let sum = 0;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue;
                
                const col = (x + i + cols) % cols;
                const row = (y + j + rows) % rows;
                sum += grid[col][row];
            }
        }
        return sum;
    }
    
    function updateGrid() {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const state = grid[i][j];
                const neighbors = countNeighbors(grid, i, j);
                
                // Apply Conway's rules
                if (state === 0 && neighbors === 3) {
                    nextGrid[i][j] = 1; // Birth
                } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                    nextGrid[i][j] = 0; // Death
                } else {
                    nextGrid[i][j] = state; // Stasis
                }
            }
        }
        
        // Copy next grid to current grid
        [grid, nextGrid] = [nextGrid, grid];
        generation++;
        updateStats();
    }
    
    function updateStats() {
        let population = 0;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                population += grid[i][j];
            }
        }
        
        generationCount.textContent = generation;
        populationCount.textContent = population;
    }
    
    function gameLoop(timestamp) {
        if (!isRunning) return;
        
        if (!lastFrameTime) lastFrameTime = timestamp;
        const elapsed = timestamp - lastFrameTime;
        
        if (elapsed > 1000 / fps) {
            updateGrid();
            drawGrid();
            lastFrameTime = timestamp;
        }
        
        animationId = requestAnimationFrame(gameLoop);
    }
    
    function startGame() {
        if (!isRunning) {
            isRunning = true;
            lastFrameTime = 0;
            animationId = requestAnimationFrame(gameLoop);
        }
    }
    
    function stopGame() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    
    function clearGrid() {
        grid = createEmptyGrid();
        nextGrid = createEmptyGrid();
        generation = 0;
        updateStats();
        drawGrid();
    }
    
    function randomizeGrid() {
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                grid[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
        generation = 0;
        updateStats();
        drawGrid();
    }
    
    function resizeGrid() {
        cellSize = parseInt(sizeSlider.value);
        cols = Math.floor(canvas.width / cellSize);
        rows = Math.floor(canvas.height / cellSize);
        
        const newGrid = createEmptyGrid();
        const newNextGrid = createEmptyGrid();
        
        // Copy values from old grid to new grid
        for (let i = 0; i < Math.min(grid.length, cols); i++) {
            for (let j = 0; j < Math.min(grid[0].length, rows); j++) {
                newGrid[i][j] = grid[i][j];
            }
        }
        
        grid = newGrid;
        nextGrid = newNextGrid;
        drawGrid();
    }
    
    // Create patterns
    function createGlider(x, y) {
        if (x < 1 || y < 1 || x >= cols - 1 || y >= rows - 1) return;
        
        grid[x][y+1] = 1;
        grid[x+1][y+2] = 1;
        grid[x+2][y] = 1;
        grid[x+2][y+1] = 1;
        grid[x+2][y+2] = 1;
        
        drawGrid();
        updateStats();
    }
    
    function createBlinker(x, y) {
        if (x < 1 || y < 1 || x >= cols - 2 || y >= rows - 1) return;
        
        grid[x][y+1] = 1;
        grid[x+1][y+1] = 1;
        grid[x+2][y+1] = 1;
        
        drawGrid();
        updateStats();
    }
    
    function createGosperGliderGun(x, y) {
        if (x < 1 || y < 1 || x >= cols - 36 || y >= rows - 9) return;
        
        // Left block
        grid[x][y+4] = 1;
        grid[x][y+5] = 1;
        grid[x+1][y+4] = 1;
        grid[x+1][y+5] = 1;
        
        // Left ship
        grid[x+10][y+4] = 1;
        grid[x+10][y+5] = 1;
        grid[x+10][y+6] = 1;
        grid[x+11][y+3] = 1;
        grid[x+11][y+7] = 1;
        grid[x+12][y+2] = 1;
        grid[x+12][y+8] = 1;
        grid[x+13][y+2] = 1;
        grid[x+13][y+8] = 1;
        grid[x+14][y+5] = 1;
        grid[x+15][y+3] = 1;
        grid[x+15][y+7] = 1;
        grid[x+16][y+4] = 1;
        grid[x+16][y+5] = 1;
        grid[x+16][y+6] = 1;
        grid[x+17][y+5] = 1;
        
        // Right ship
        grid[x+20][y+2] = 1;
        grid[x+20][y+3] = 1;
        grid[x+20][y+4] = 1;
        grid[x+21][y+2] = 1;
        grid[x+21][y+3] = 1;
        grid[x+21][y+4] = 1;
        grid[x+22][y+1] = 1;
        grid[x+22][y+5] = 1;
        grid[x+24][y] = 1;
        grid[x+24][y+1] = 1;
        grid[x+24][y+5] = 1;
        grid[x+24][y+6] = 1;
        
        // Right block
        grid[x+34][y+2] = 1;
        grid[x+34][y+3] = 1;
        grid[x+35][y+2] = 1;
        grid[x+35][y+3] = 1;
        
        drawGrid();
        updateStats();
    }
    
    function createPulsar(x, y) {
        if (x < 2 || y < 2 || x >= cols - 13 || y >= rows - 13) return;
        
        const points = [
            [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
            [0, 2], [5, 2], [7, 2], [12, 2],
            [0, 3], [5, 3], [7, 3], [12, 3],
            [0, 4], [5, 4], [7, 4], [12, 4],
            [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
            [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
            [0, 8], [5, 8], [7, 8], [12, 8],
            [0, 9], [5, 9], [7, 9], [12, 9],
            [0, 10], [5, 10], [7, 10], [12, 10],
            [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12]
        ];
        
        for (const [dx, dy] of points) {
            grid[x + dx][y + dy] = 1;
        }
        
        drawGrid();
        updateStats();
    }

    function createYes(x, y) {
        if (x < 2 || y < 2 || x >= cols - 2 || y >= rows - 2) return;
        
        grid[x][y] = 1;
        grid[x+1][y] = 1;
        grid[x+2][y] = 1;
        grid[x][y+1] = 1;
        grid[x+2][y+1] = 1;
        grid[x][y+2] = 1;
        grid[x+1][y+2] = 1;
        grid[x+2][y+2] = 1;
        
        drawGrid();
        updateStats();
    }
    
    // Event Listeners
    startBtn.addEventListener('click', startGame);
    stopBtn.addEventListener('click', stopGame);
    stepBtn.addEventListener('click', () => {
        updateGrid();
        drawGrid();
    });
    clearBtn.addEventListener('click', clearGrid);
    randomBtn.addEventListener('click', randomizeGrid);
    
    speedSlider.addEventListener('input', () => {
        fps = parseInt(speedSlider.value);
        speedValue.textContent = `${fps} fps`;
        
        if (isRunning) {
            stopGame();
            startGame();
        }
    });
    
    sizeSlider.addEventListener('input', () => {
        sizeValue.textContent = `${sizeSlider.value} px`;
        resizeGrid();
    });
    
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = Math.floor((event.clientX - rect.left) * scaleX / cellSize);
        const y = Math.floor((event.clientY - rect.top) * scaleY / cellSize);
        
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[x][y] = grid[x][y] ? 0 : 1;
            drawGrid();
            updateStats();
        }
    });
    
    gliderBtn.addEventListener('click', () => {
        createGlider(10, 10);
    });
    
    blinkerBtn.addEventListener('click', () => {
        createBlinker(Math.floor(cols / 2) - 1, Math.floor(rows / 2) - 1);
    });
    
    gliderGunBtn.addEventListener('click', () => {
        createGosperGliderGun(10, 10);
    });
    
    pulsarBtn.addEventListener('click', () => {
        createPulsar(Math.floor(cols / 2) - 6, Math.floor(rows / 2) - 6);
    });
    
    // Initialize
    drawGrid();
    updateStats();
});