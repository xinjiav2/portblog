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
  }
  .wrap {
    margin-left: auto;
    margin-right: auto;
  }
  canvas {
    display: block;
    border: 5px solid #38afad;
    margin: 20px auto;
  }
  canvas:focus {
    outline: none;
  }
  /* Game Over / Menu / Settings Screen */
  #gameover p, #setting p, #menu p {
    font-size: 20px;
  }
  #gameover a, #setting a, #menu a {
    font-size: 30px;
    display: block;
    margin-top: 10px;
  }
  #gameover a:hover, #setting a:hover, #menu a:hover {
    cursor: pointer;
  }
  #menu {
    display: block;
    text-align: center;
  }
  #gameover {
    display: none;
    text-align: center;
  }
  #setting {
    display: none;
    text-align: center;
  }
</style>

<h2>Snake Game</h2>
<div class="container">
  <header class="pb-3 mb-4 border-bottom border-primary text-dark">
    <p class="fs-4">Score: <span id="score_value">0</span></p>
  </header>

  <div class="container bg-secondary" style="text-align:center;">
    <!-- Main Menu -->
    <div id="menu" class="py-4 text-light">
      <p>Welcome to Snake, press <span style="background-color: #FFFFFF; color: #000000">space</span> to begin</p>
      <a id="new_game" class="link-alert">New Game</a>
      <a id="setting_menu" class="link-alert">Settings</a>
    </div>

    <!-- Game Over -->
    <div id="gameover" class="py-4 text-light">
      <p>Game Over, press <span style="background-color: #FFFFFF; color: #000000">space</span> to try again</p>
      <a id="new_game1" class="link-alert">New Game</a>
      <a id="setting_menu1" class="link-alert">Settings</a>
    </div>

    <!-- Settings Screen -->
    <div id="setting" class="py-4 text-light">
      <p>Settings Screen, press <span style="background-color: #FFFFFF; color: #000000">space</span> to go back to playing</p>
      <a id="new_game2" class="link-alert">New Game</a>
      <br>
      <p>Speed:
        <input id="speed1" type="radio" name="speed" value="150" checked/>
        <label for="speed1">Slow</label>
        <input id="speed2" type="radio" name="speed" value="100"/>
        <label for="speed2">Normal</label>
        <input id="speed3" type="radio" name="speed" value="50"/>
        <label for="speed3">Fast</label>
      </p>
      <p>Wall:
        <input id="wallon" type="radio" name="wall" value="1" checked/>
        <label for="wallon">On</label>
        <input id="walloff" type="radio" name="wall" value="0"/>
        <label for="walloff">Off</label>
      </p>
    </div>

    <!-- Snake Game Canvas -->
    <canvas id="snake" class="wrap" width="320" height="320" tabindex="1"></canvas>
  </div>
</div>

<script>
  (function() {
    const canvas = document.getElementById("snake");
    const ctx = canvas.getContext("2d");

    const SCREEN_SNAKE = 0, SCREEN_GAME_OVER = 1, SCREEN_SETTING = 2;
    const SCREEN_MENU = -1;
    let SCREEN = SCREEN_MENU;

    const BLOCK = 10; // size of each snake block
    let snake, snake_dir, snake_next_dir, snake_speed, score, wall;
    const food = { x: 0, y: 0 };
    const foodImage = new Image();
    foodImage.src = "apple.png"; // Path to the image file for the food

    // Elements
    const ele_score = document.getElementById("score_value");
    const speed_setting = document.getElementsByName("speed");
    const wall_setting = document.getElementsByName("wall");
    const button_new_game = document.getElementById("new_game");
    const button_new_game1 = document.getElementById("new_game1");
    const button_new_game2 = document.getElementById("new_game2");
    const button_setting_menu = document.getElementById("setting_menu");
    const button_setting_menu1 = document.getElementById("setting_menu1");
    const screen_snake = document.getElementById("snake");
    const screen_menu = document.getElementById("menu");
    const screen_game_over = document.getElementById("gameover");
    const screen_setting = document.getElementById("setting");

    // Show specific screen
    const showScreen = function(screen_opt) {
      SCREEN = screen_opt;
      switch(screen_opt) {
        case SCREEN_SNAKE:
          screen_snake.style.display = "inline-block";
          screen_menu.style.display = "none";
          screen_setting.style.display = "none";
          screen_game_over.style.display = "none";
          break;
        case SCREEN_GAME_OVER:
          screen_snake.style.display = "block";
          screen_menu.style.display = "none";
          screen_setting.style.display = "none";
          screen_game_over.style.display = "block";
          break;
        case SCREEN_SETTING:
          screen_snake.style.display = "none";
          screen_menu.style.display = "none";
          screen_setting.style.display = "block";
          screen_game_over.style.display = "none";
          break;
      }
    };

    // Main game loop
    const mainLoop = function() {
      let _x = snake[0].x;
      let _y = snake[0].y;
      snake_dir = snake_next_dir; // update direction

      // Update snake's position based on the direction
      switch(snake_dir) {
        case 0: _y--; break; // Up
        case 1: _x++; break; // Right
        case 2: _y++; break; // Down
        case 3: _x--; break; // Left
      }

      // Remove the tail
      snake.pop();
      // Add new head at the front
      snake.unshift({ x: _x, y: _y });

      // Check for wall collision (if wall is on)
      if (wall === 1 && (snake[0].x < 0 || snake[0].x >= canvas.width / BLOCK || snake[0].y < 0 || snake[0].y >= canvas.height / BLOCK)) {
        showScreen(SCREEN_GAME_OVER);
        return;
      }

      // Check for self-collision
      for (let i = 1; i < snake.length; i++) {
        if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
          showScreen(SCREEN_GAME_OVER);
          return;
        }
      }

      // Check if snake eats food
      if (checkBlock(snake[0].x, snake[0].y, food.x, food.y)) {
        snake.push({ x: snake[0].x, y: snake[0].y });
        score++;
        altScore(score);
        addFood();
      }

      // Redraw everything
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "green";
      snake.forEach(block => activeDot(block.x, block.y));
      activeDot(food.x, food.y, true);

      setTimeout(mainLoop, snake_speed); // keep the game running at the set speed
    };

    // Start new game
    const newGame = function() {
      showScreen(SCREEN_SNAKE);
      score = 0;
      altScore(score);
      snake = [{ x: 10, y: 10 }];
      snake_next_dir = 1; // Start moving right
      addFood();
      canvas.focus();
      mainLoop();
    };

    // Change direction based on key input
    const changeDir = function(key) {
      switch (key) {
        case 37: // left arrow
          if (snake_dir !== 1) snake_next_dir = 3;
          break;
        case 38: // up arrow
          if (snake_dir !== 2) snake_next_dir = 0;
          break;
        case 39: // right arrow
          if (snake_dir !== 3) snake_next_dir = 1;
          break;
        case 40: // down arrow
          if (snake_dir !== 0) snake_next_dir = 2;
          break;
      }
    };

    // Draw a block on the canvas (snake body or food)
    const activeDot = function(x, y, isFood = false) {
      if (isFood) {
        ctx.drawImage(foodImage, x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      } else {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    };

    // Add food at random location
    const addFood = function() {
      food.x = Math.floor(Math.random() * (canvas.width / BLOCK));
      food.y = Math.floor(Math.random() * (canvas.height / BLOCK));
      for (let i = 0; i < snake.length; i++) {
        if (checkBlock(food.x, food.y, snake[i].x, snake[i].y)) {
          addFood(); // regenerate food if it spawns on the snake
        }
      }
    };

    // Check if a block is at the same coordinates
    const checkBlock = function(x, y, _x, _y) {
      return x === _x && y === _y;
    };

    // Update score on screen
    const altScore = function(score_val) {
      ele_score.innerHTML = score_val;
    };

    // Set snake speed
    const setSnakeSpeed = function(speed_value) {
      snake_speed = speed_value;
    };

    // Set wall on/off
    const setWall = function(wall_value) {
      wall = wall_value;
      canvas.style.borderColor = wall === 0 ? "#606060" : "#FFFFFF";
    };

    // Set up event listeners
    window.onload = function() {
      button_new_game.onclick = newGame;
      button_new_game1.onclick = newGame;
      button_new_game2.onclick = newGame;
      button_setting_menu.onclick = function() { showScreen(SCREEN_SETTING); };
      button_setting_menu1.onclick = function() { showScreen(SCREEN_SETTING); };
      window.addEventListener("keydown", function(evt) {
        if (evt.code === "Space" && SCREEN !== SCREEN_SNAKE) {
          newGame();
        } else if (SCREEN === SCREEN_SNAKE) {
          changeDir(evt.keyCode);
        }
      });

      // Speed settings
      setSnakeSpeed(150); // default speed
      for (let i = 0; i < speed_setting.length; i++) {
        speed_setting[i].addEventListener("click", function() {
          setSnakeSpeed(speed_setting[i].value);
        });
      }

      // Wall setting
      setWall(1); // default wall is on
      for (let i = 0; i < wall_setting.length; i++) {
        wall_setting[i].addEventListener("click", function() {
          setWall(wall_setting[i].value);
        });
      }
    };
  })();
</script>
