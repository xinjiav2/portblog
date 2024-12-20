---
layout: base
title: Snake
permalink: /snake
---
hi!
i tried to make a snake game here

<style>
    body {
        font-family: 'Arial', sans-serif;
        background-color: #ffffff;
        color: #000000;
        display: flex;
        flex-direction: row;
        /*column = vertical, row = horizontal*/ 
        align-items: center;
        justify-content: flex-start;
        height: 100vh;
        margin: 0;
        padding-top: 20px;
    }

    canvas {
        display: block;
        border-style: solid;
        border-width: 10px;
        border-color: #ff69b4;
        border-radius: 15px;
        margin-top: 20px;
    }

    h2 {
        background: linear-gradient(135deg, #ff7e5f, #feb47b, #f7c8fc, #f5a5c0, #ff69b4, #f9d423);
        background-size: 400% 400%;
        animation: rainbow 15s ease infinite;
        color: white;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
        margin: 0;
    }

    @keyframes rainbow {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    .header {
        font-size: 18px;
        margin: 20px 0;
    }
</style>

<h2>Snake Game</h2>
<div class="header">
    Score: <span id="score_value">0</span>
</div>
<canvas id="snake" width="320" height="320" tabindex="1"></canvas>

<script>
    (function(){
        const canvas = document.getElementById("snake");
        const ctx = canvas.getContext("2d");
        const BLOCK = 10;
        let snake;
        let snake_dir;
        let snake_next_dir;
        let snake_speed = 150;
        let food = {x: 0, y: 0};
        let score = 0;

        const updateScore = () => document.getElementById("score_value").textContent = score;

        const addFood = () => {
            food.x = Math.floor(Math.random() * (canvas.width / BLOCK));
            food.y = Math.floor(Math.random() * (canvas.height / BLOCK));
        };

        const activeDot = (x, y, color = '#FF6347') => {
            ctx.fillStyle = color;
            ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
        };

        const changeDirection = (key) => {
            if (key === 37 && snake_dir !== 1) snake_next_dir = 3; // Left
            if (key === 38 && snake_dir !== 2) snake_next_dir = 0; // Up
            if (key === 39 && snake_dir !== 3) snake_next_dir = 1; // Right
            if (key === 40 && snake_dir !== 0) snake_next_dir = 2; // Down
        };

        const mainLoop = () => {
            let _x = snake[0].x;
            let _y = snake[0].y;
            snake_dir = snake_next_dir;

            switch (snake_dir) {
                case 0: _y--; break; // Up
                case 1: _x++; break; // Right
                case 2: _y++; break; // Down
                case 3: _x--; break; // Left
            }

            snake.pop();
            snake.unshift({x: _x, y: _y});

            if (_x < 0 || _x >= canvas.width / BLOCK || _y < 0 || _y >= canvas.height / BLOCK) {
                showGameOverScreen();
                return;
            }

            for (let i = 1; i < snake.length; i++) {
                if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                    showGameOverScreen();
                    return;
                }
            }

            if (snake[0].x === food.x && snake[0].y === food.y) {
                snake.push({});
                score++;
                updateScore();
                addFood();
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            snake.forEach((segment, index) => activeDot(segment.x, segment.y, index === 0 ? '#FFD700' : '#FF6347'));
            activeDot(food.x, food.y, '#32CD32');

            setTimeout(mainLoop, snake_speed);
        };

        const newGame = () => {
          const bgMusic = document.getElementById("bgMusic");
           bgMusic.play(); // Play the background music

           score = 0;
          updateScore();
          snake = [{x: 10, y: 10}];
          snake_dir = 1; // Start moving right
          snake_next_dir = 1;
          addFood();
          mainLoop();
        };

        canvas.focus();
        canvas.addEventListener("keydown", (e) => changeDirection(e.keyCode));
        newGame();
    })();
