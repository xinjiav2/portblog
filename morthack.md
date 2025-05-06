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
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 20px;
    }
    canvas {
      background-color: #2e2e2e;
      border: 2px solid #444;
    }
  </style>
</head>
<body>
  <h1>Turn-Based Battle Game</h1>
  <canvas id="gameCanvas" width="800" height="500"></canvas>

  <script>
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    const playerTemplate = {
      name: "Unnamed",
      health: 100,
      speed: 10,
      strength: 10,
      powerTypes: ["speed", "strength"],

      attack: function (opponent, power) {
        if (this[power] > opponent[power]) {
          opponent.health -= 10;
          return `${this.name} beats ${opponent.name} using ${power}!`;
        } else if (this[power] < opponent[power]) {
          this.health -= 10;
          return `${opponent.name} beats ${this.name} using ${power}!`;
        } else {
          return `${this.name} and ${opponent.name} are equal in ${power}.`;
        }
      }
    };

    const players = [
      { ...playerTemplate, name: "Alice", speed: 15, strength: 12 },
      { ...playerTemplate, name: "Bob", speed: 10, strength: 14 },
      { ...playerTemplate, name: "Charlie", speed: 13, strength: 13 },
      { ...playerTemplate, name: "Diana", speed: 14, strength: 10 },
      { ...playerTemplate, name: "Eve", speed: 11, strength: 15 }
    ];

    let messages = [];
    let round = 1;

    function drawScreen() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f8f8f2";
      ctx.font = "18px Courier New";
      ctx.fillText(`Round ${round}`, 20, 30);

      // Draw leaderboard
      const living = players.filter(p => p.health > 0);
      living.sort((a, b) => b.health - a.health);
      ctx.fillText("🏆 Leaderboard:", 20, 60);
      living.forEach((p, i) => {
        ctx.fillText(`${p.name}: ${p.health} HP`, 40, 90 + i * 20);
      });

      // Draw messages
      ctx.fillText("📜 Log:", 400, 60);
      const recentMessages = messages.slice(-10);
      recentMessages.forEach((msg, i) => {
        ctx.fillText(msg, 400, 90 + i * 20);
      });
    }

    function playRound() {
      const livingPlayers = players.filter(p => p.health > 0);
      if (livingPlayers.length <= 1) {
        messages.push(`🎉 ${livingPlayers[0].name} wins the game!`);
        drawScreen();
        clearInterval(gameLoop);
        return;
      }

      messages.push(`--- Round ${round} ---`);
      const fighterIndex = Math.floor(Math.random() * livingPlayers.length);
      const fighter = livingPlayers[fighterIndex];

      messages.push(`🔁 ${fighter.name}'s Turn`);
      for (let opponent of livingPlayers) {
        if (opponent === fighter) continue;
        const randomPower = fighter.powerTypes[Math.floor(Math.random() * fighter.powerTypes.length)];
        const outcome = fighter.attack(opponent, randomPower);
        messages.push(outcome);
      }

      // Everyone loses 1 health due to fatigue
      livingPlayers.forEach(p => p.health -= 1);

      // Remove dead players
      for (let i = players.length - 1; i >= 0; i--) {
        if (players[i].health <= 0) {
          messages.push(`💀 ${players[i].name} has died!`);
          players.splice(i, 1);
        }
      }

      drawScreen();
      round++;
    }

    drawScreen();
    const gameLoop = setInterval(playRound, 1500);
  </script>
</body>
</html>
