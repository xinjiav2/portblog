---
layout: page
title: Morthack
description: Morthack
permalink: /morthack/
---

<!DOCTYPE html>

<script>
    // 1. Object Literal as initializer
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
  
    // 2. Create Player instances from the object literal
    const players = [
      { ...playerTemplate, name: "p1", health: 100, speed: 15, strength: 12 },
      { ...playerTemplate, name: "p2", health: 100, speed: 10, strength: 14 },
      { ...playerTemplate, name: "p3", health: 100, speed: 13, strength: 13 },
      { ...playerTemplate, name: "p4", health: 100, speed: 14, strength: 10 },
      { ...playerTemplate, name: "p5", health: 100, speed: 11, strength: 15 }
    ];
  
    function leaderboard(players) {
      const living = players.filter(p => p.health > 0);
      living.sort((a, b) => b.health - a.health);
      console.log("🏆 Leaderboard:");
      living.forEach(p => {
        console.log(`${p.name}: ${p.health} HP`);
      });
      console.log("-----------");
    }
  
    function playRound() {
      const livingPlayers = players.filter(p => p.health > 0);
      if (livingPlayers.length <= 1) {
        console.log(`🎉 ${livingPlayers[0].name} wins the game!`);
        return false;
      }
  
      const fighterIndex = Math.floor(Math.random() * livingPlayers.length);
      const fighter = livingPlayers[fighterIndex];
  
      console.log(`\n🔁 ${fighter.name}'s Turn`);
  
      for (let opponent of livingPlayers) {
        if (opponent === fighter) continue;
        const randomPower = fighter.powerTypes[Math.floor(Math.random() * fighter.powerTypes.length)];
        console.log(fighter.attack(opponent, randomPower));
      }
  
      // Everyone loses 1 health for battle fatigue
      for (let p of livingPlayers) {
        p.health -= 1;
      }
  
      // Remove dead players
      for (let i = players.length - 1; i >= 0; i--) {
        if (players[i].health <= 0) {
          console.log(`💀 ${players[i].name} has died!`);
          players.splice(i, 1);
        }
      }
  
      leaderboard(players);
      return true;
    }
  
    // 3. Game Loop
    let round = 1;
    const gameInterval = setInterval(() => {
      console.log(`\n=== Round ${round} ===`);
      const keepPlaying = playRound();
      round++;
      if (!keepPlaying) clearInterval(gameInterval);
    }, 1000);
  </script>
  