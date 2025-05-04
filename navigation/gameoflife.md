---
layout: page
title: Conway's Game Of Life
description: Conway's Game Of Life
permalink: /cgof/
---

# currently i am having problems getting it to load but it will eventually work :D

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Conway's Game of Life</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Conway's Game of Life</h1>
    <div class="description">
        Conway's Game of Life is a cellular automaton where cells live or die based on simple rules.
        Click on the grid to toggle cells or use the pattern buttons to get started.
    </div>
    
    <div class="container">
        <canvas id="gameCanvas" width="600" height="600"></canvas>
        
        <div class="controls">
            <button id="startBtn">Start</button>
            <button id="stopBtn">Stop</button>
            <button id="stepBtn">Step</button>
            <button id="clearBtn">Clear</button>
            <button id="randomBtn">Random</button>
        </div>
        
        <div class="settings">
            <label>
                Speed:
                <input type="range" id="speedSlider" min="1" max="60" value="10">
                <span id="speedValue">10 fps</span>
            </label>
            
            <label>
                Cell Size:
                <input type="range" id="sizeSlider" min="4" max="20" value="10">
                <span id="sizeValue">10 px</span>
            </label>
        </div>
        
        <div class="patterns">
            <button id="gliderBtn">Glider</button>
            <button id="blinkerBtn">Blinker</button>
            <button id="gliderGunBtn">Gosper Glider Gun</button>
            <button id="pulsarBtn">Pulsar</button>
        </div>
        
        <div class="stats">
            <div class="stat">Generation: <span id="generationCount">0</span></div>
            <div class="stat">Population: <span id="populationCount">0</span></div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>