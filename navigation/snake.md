---
layout: base
title: Snake
permalink: /snake
---
hi!
i tried to make a snake game here


<style>
    body {
        font-family: Arial, sans-serif;
        background-color: #222;
        color: #fff;
        margin: 0;
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
</style>

<h2>Snake Game</h2>
<div class="container">
    <header class="pb-3 mb-4 border-bottom border-primary text-dark">
        <p class="fs-4">Score: <span id="score_value">0</span></p>
    </header>
    <div class="container bg-secondary" style="text-align:center;">
        <div id="menu" class="py-4 text-light">
            <p>Welcome to Snake, press <span style="background-color: #FFFFFF; color: #000000">space</span> to begin</p>
            <a id="new_game" class="link-alert">new game</a>
            <a id="setting_menu" class="link-alert">settings</a>
        </div>

        <div id="gameover" class="py-4 text-light">
            <p>Game Over, press <span style="background-color: #FFFFFF; color: #000000">space</span> to try again</p>
            <a id="new_game1" class="link-alert">new game</a>
            <a id="setting_menu1" class="link-alert">settings</a>
        </div>

        <canvas id="snake" class="wrap" width="320" height="320" tabindex="1"></canvas>

        <div id="setting" class="py-4 text-light">
            <p>Settings Screen, press <span style="background-color: #FFFFFF; color: #000000">space</span> to go back to playing</p>
            <a id="new_game2" class="link-alert">new game</a>
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
        let SCREEN_MENU = 0;
        let SCREEN_SNAKE = 1;
        let SCREEN_GAME_OVER = 2;
        let SCREEN_SETTING = 3;
        let SCREEN = SCREEN_MENU;

        let snake;
        let snake_dir;
        let snake_next_dir;
        let snake_speed;
        let foodImage = new Image();
        foodImage.src = "apple.png"; // Path to the image file
        let food = { x: 0, y: 0 };
        let score = 0;
        let wall = 1;

        // Display Screen function
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

        function setSnakeSpeed(speed_value){
            snake_speed = parseInt(speed_value);
        }

        function setWall(wall_value){
            wall = wall_value;
        }

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

        function altScore(score_val){
            ele_score.innerHTML = score_val;
        }

        function addFood(){
            food.x = Math.floor(Math.random() * (canvas.width / BLOCK));
            food.y = Math.floor(Math.random() * (canvas.height / BLOCK));
            for (let i = 0; i < snake.length; i++) {
                if (food.x === snake[i].x && food.y === snake[i].y) {
                    addFood();
                }
            }
        }

        function activeDot(x, y, isFood = false) {
            if (isFood) {
                ctx.drawImage(foodImage, x * BLOCK, y * BLOCK, BLOCK, BLOCK);
            } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
            }
        }

        function checkBlock(x, y, _x, _y){
            return (x === _x && y === _y);
        }

        function mainLoop() {
            let _x = snake[0].x;
            let _y = snake[0].y;
            snake_dir = snake_next_dir;

            switch(snake_dir){
                case 0: _y--; break;
                case 1: _x++; break;
                case 2: _y++; break;
                case 3: _x--; break;
            }

            snake.pop();
            snake.unshift({x: _x, y: _y});

            if (wall === 1) {
                if (snake[0].x < 0 || snake[0].x === canvas.width / BLOCK || snake[0].y < 0 || snake[0].y === canvas.height / BLOCK) {
                    showScreen(SCREEN_GAME_OVER);
                    return;
                }
            } else {
                for (let i = 0; i < snake.length; i++) {
                    if (snake[i].x < 0) snake[i].x = canvas.width / BLOCK;
                    if (snake[i].x === canvas.width / BLOCK) snake[i].x = 0;
                    if (snake[i].y < 0) snake[i].y = canvas.height / BLOCK;
                    if (snake[i].y === canvas.height / BLOCK) snake[i].y = 0;
                }
            }

            for (let i = 1; i < snake.length; i++) {
                if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
                    showScreen(SCREEN_GAME_OVER);
                    return;
                }
            }

            if (checkBlock(snake[0].x, snake[0].y, food.x, food.y)) {
                snake.push({x: snake[snake.length - 1].x, y: snake[snake.length - 1].y});
                score++;
                altScore(score);
                addFood();
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < snake.length; i++) {
                activeDot(snake[i].x, snake[i].y);
            }

            activeDot(food.x, food.y, true);

            setTimeout(mainLoop, snake_speed);
        }

        function newGame() {
            showScreen(SCREEN_SNAKE);
            score = 0;
            altScore(score);
            snake = [{x: 5, y: 5}];
            snake_dir = 1;
            snake_next_dir = 1;
            addFood();
            mainLoop();
        }

        window.onload = function(){
            document.getElementById("new_game").onclick = newGame;
            document.getElementById("new_game1").onclick = newGame;
            document.getElementById("new_game2").onclick = newGame;
            document.getElementById("setting_menu").onclick = function(){ showScreen(SCREEN_SETTING); };
            document.getElementById("setting_menu1").onclick = function(){ showScreen(SCREEN_SETTING); };

            for (let i = 0; i < speed_setting.length; i++) {
                speed_setting[i].addEventListener("click", function(){
                    setSnakeSpeed(this.value);
                });
            }

            for (let i = 0; i < wall_setting.length; i++) {
                wall_setting[i].addEventListener("click", function(){
                    setWall(this.value);
                });
            }

            window.addEventListener("keydown", function(evt) {
                if (evt.code === "Space" && SCREEN !== SCREEN_SNAKE) {
                    newGame();
                } else {
                    changeDir(evt.keyCode);
                }
            });
        }
    })();
</script>
