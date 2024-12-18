---
layout: base
title: Snake
permalink: /snake
---
hi!
i tried to make a snake game here

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Snake Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #222;
            color: #fff;
            margin: 0;
            padding: 0;
        }
        h2 {
            text-align: center;
            color: #fff;
        }
        .wrap {
            margin-left: auto;
            margin-right: auto;
        }
        canvas {
            display: block;
            margin: 0 auto;
            border: 5px solid #38afad;
        }
        canvas:focus {
            outline: none;
        }
        #score_value {
            font-size: 30px;
        }
        .link-alert {
            color: #38afad;
            font-size: 20px;
            text-decoration: none;
        }
        .link-alert:hover {
            cursor: pointer;
        }
        #menu, #gameover, #setting {
            text-align: center;
        }
        .container {
            text-align: center;
        }
    </style>
</head>
<body>

<h2>Snake Game</h2>
<div class="container">
    <header class="pb-3 mb-4 border-bottom border-primary text-dark">
        <p class="fs-4">Score: <span id="score_value">0</span></p>
    </header>
    <div class="container bg-secondary">
        <!-- Menu -->
        <div id="menu" class="py-4 text-light">
            <p>Welcome to Snake, press <span style="background-color: #FFFFFF; color: #000000">space</span> to begin</p>
            <a id="new_game" class="link-alert">New Game</a>
            <a id="setting_menu" class="link-alert">Settings</a>
        </div>

        <!-- Game Over Screen -->
        <div id="gameover" class="py-4 text-light" style="display:none;">
            <p>Game Over! Press <span style="background-color: #FFFFFF; color: #000000">space</span> to try again</p>
            <a id="new_game1" class="link-alert">New Game</a>
            <a id="setting_menu1" class="link-alert">Settings</a>
        </div>

        <!-- Settings Screen -->
        <div id="setting" class="py-4 text-light" style="display:none;">
            <p>Settings Screen, press <span style="background-color: #FFFFFF; color: #000000">space</span> to go back to playing</p>
            <a id="new_game2" class="link-alert">New Game</a>
            <br>
            <p>Speed:
                <input id="speed1" type="radio" name="speed" value="120" checked/>
                <label for="speed1">Slow</label>
                <input id="speed2" type="radio" name="speed" value="75"/>
                <label for="speed2">Normal</label>
                <input id="speed3" type="radio" name="speed" value="35"/>
                <label for="speed3">Fast</label>
            </p>
            <p>Wall:
                <input id="wallon" type="radio" name="wall" value="1" checked/>
                <label for="wallon">On</label>
                <input id="walloff" type="radio" name="wall" value="0"/>
                <label for="walloff">Off</label>
            </p>
        </div>

        <!-- Canvas -->
        <canvas id="snake" class="wrap" width="320" height="320" tabindex="1"></canvas>
    </div>
</div>

<script>
    (function(){
        const canvas = document.getElementById("snake");
        const ctx = canvas.getContext("2d");
        const ele_score = document.getElementById("score_value");
        const speed_setting = document.getElementsByName("speed");
        const wall_setting = document.getElementsByName("wall");

        const BLOCK = 10;
        let snake;
        let snake_dir;
        let snake_next_dir;
        let snake_speed;
        let foodImage = new Image();
        foodImage.src = "apple.png"; // Path to the image file
        let food = { x: 0, y: 0 };
        let score = 0;
        let wall = 1;

        let SCREEN_MENU = 0;
        let SCREEN_SNAKE = 1;
        let SCREEN_GAME_OVER = 2;
        let SCREEN_SETTING = 3;
        let SCREEN = SCREEN_MENU;

        // Show the screen (menu, game, game over, settings)
        function showScreen(screen_opt){
            SCREEN = screen_opt;
            switch(screen_opt){
                case SCREEN_SNAKE:
                    canvas.style.display = "block";
                    document.getElementById("menu").style.display = "none";
                    document.getElementById("gameover").style.display = "none";
                    document.getElementById("setting").style.display = "none";
                    break;
                case SCREEN_GAME_OVER:
                    canvas.style.display = "none";
                    document.getElementById("menu").style.display = "none";
                    document.getElementById("gameover").style.display = "block";
                    document.getElementById("setting").style.display = "none";
                    break;
                case SCREEN_SETTING:
                    canvas.style.display = "none";
                    document.getElementById("menu").style.display = "none";
                    document.getElementById("gameover").style.display = "none";
                    document.getElementById("setting").style.display = "block";
                    break;
                case SCREEN_MENU:
                    canvas.style.display = "none";
                    document.getElementById("menu").style.display = "block";
                    document.getElementById("gameover").style.display = "none";
                    document.getElementById("setting").style.display = "none";
                    break;
            }
        }

        // Set Snake Speed based on settings
        function setSnakeSpeed(speed_value){
            snake_speed = parseInt(speed_value);
        }

        // Set wall settings (on or off)
        function setWall(wall_value){
            wall = wall_value;
        }

        // Change the direction of the snake based on arrow keys
        function changeDir(key){
            switch(key) {
                case 37:    // left arrow
                    if (snake_dir !== 1) snake_next_dir = 3; 
                    break;
                case 38:    // up arrow
                    if (snake_dir !== 2) snake_next_dir = 0; 
                    break;
                case 39:    // right arrow
                    if (snake_dir !== 3) snake_next_dir = 1;
                    break;
                case 40:    // down arrow
                    if (snake_dir !== 0) snake_next_dir = 2;
                    break;
            }
        }

        // Update score display
        function updateScore(sco
