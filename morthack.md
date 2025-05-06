---
layout: page
title: Morthack
description: Morthack
permalink: /morthack/
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Turn-Based Battle Game</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      background-color: #1e1e1e;
      color: #f8f8f2;
      text-align: center;
      padding-top: 20px;
    }

    canvas {
      background-color: #2e2e2e;
      border: 2px solid #444;
      margin-bottom: 10px;
    }

    button {
      font-size: 16px;
      margin: 5px;
      padding: 8px 16px;
      cursor: pointer;
      background-color: #444;
      color: #f8f8f2;
      border: none;
      border-radius: 4px;
    }

    button:hover {
      background-color: #666;
    }
  </style>
</head>
<body>
  <h1>Turn-Based Battle Game</h1>
  <canvas id="gameCanvas" width="1500" height="500"></canvas>
  <div>
    <button onclick="nextRound()">Next Round</button>
    <button onclick="toggleAutoPlay()">Auto Play</button>
    <button onclick="resetGame()">Restart Game</button>
  </div>

  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const playerTemplate = {
      name: "Unnamed",
      health: 100,
      signature: 10,
      ultimate: 10,
      powerTypes: ["signature", "ultimate"],

      attack(opponent, power) {
        if (this[power] > opponent[power]) {
          const damage = this[power];
          opponent.health -= damage;
          return `${this.name} beats ${opponent.name} using ${power} (dealt ${damage} damage).`;
        } else if (this[power] < opponent[power]) {
          const damage = opponent[power];
          this.health -= damage;
          return `${opponent.name} beats ${this.name} using ${power} (dealt ${damage} damage).`;
        } else {
          return `${this.name} and ${opponent.name} are equal in ${power} (no damage).`;
        }
      }
    }; // Added missing closing brace here

    // Initial players — customize stats here:
    const initialPlayerStats = [
      { name: "Alexander Novikov", signature: 15, ultimate: 12 },
      { name: "Vincent Fabron", signature: 10, ultimate: 14 },
      { name: "Mateo Armendáriz De la Fuente", signature: 13, ultimate: 13 },
      { name: "Erik Torsten", signature: 14, ultimate: 10 },
      { name: "Kiritani Ryo", signature: 14, ultimate: 10 },
      { name: "Varun Batra", signature: 11, ultimate: 15 }
    ];

    let players = [];
    let messages = [];
    let round = 1;
    let autoPlay = false;
    let gameInterval = null;

    function initGame() {
      players = initialPlayerStats.map(stats => ({ ...playerTemplate, ...stats, health: 100 }));
      messages = [];
      round = 1;
      drawScreen();
    }

    function drawScreen() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8f8f2";
      ctx.font = "18px Courier New";
      ctx.fillText(`Round ${round}`, 20, 30);

      // Leaderboard
      const living = players.filter(p => p.health > 0);
      living.sort((a, b) => b.health - a.health);
      ctx.fillText("🏆 Leaderboard:", 20, 60);
      living.forEach((p, i) => {
        ctx.fillText(`${p.name}: ${p.health} HP`, 40, 90 + i * 20);
      });

      // Battle messages
      ctx.fillText("📜 Log:", 600, 60);
      const recent = messages.slice(-10);
      recent.forEach((msg, i) => {
        ctx.fillText(msg, 600, 90 + i * 20);
      });
    }

    function nextRound() {
      if (players.filter(p => p.health > 0).length <= 1) {
        return;
      }

      messages.push(`--- Round ${round} ---`);
      const living = players.filter(p => p.health > 0);
      const fighter = living[Math.floor(Math.random() * living.length)];

      messages.push(`🔁 ${fighter.name}'s Turn`);
      for (let opponent of living) {
        if (opponent === fighter) continue;
        const power = fighter.powerTypes[Math.floor(Math.random() * fighter.powerTypes.length)];
        messages.push(fighter.attack(opponent, power));
      }

      living.forEach(p => p.health -= 1); // fatigue damage

      // Death cleanup
      players = players.filter(p => p.health > 0);
      
      if (players.length === 1) {
        messages.push(`🎉 ${players[0].name} wins the game!`);
        stopAutoPlay();
      }

      drawScreen();
      round++;
    }

    function toggleAutoPlay() {
      autoPlay = !autoPlay;
      if (autoPlay) {
        gameInterval = setInterval(() => {
          nextRound();
          if (players.length <= 1) stopAutoPlay();
        }, 1500);
      } else {
        stopAutoPlay();
      }
    }

    function stopAutoPlay() {
      clearInterval(gameInterval);
      autoPlay = false;
    }

    function resetGame() {
      stopAutoPlay();
      initGame();
    }

    initGame();
  </script>
</body>
</html>