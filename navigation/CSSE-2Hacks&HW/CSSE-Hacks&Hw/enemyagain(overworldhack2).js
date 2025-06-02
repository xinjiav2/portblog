import GamEnvBackground from './GameEngine/GameEnvBackground.js';
import BackgroundParallax from './GameEngine/BackgroundParallax.js';
import Player from './GameEngine/Player.js';
import Npc from './GameEngine/Npc.js';
import Collectible from './GameEngine/Collectible.js';
import Quiz from './Quiz.js';
import Dragon from './Dragon.js'; // Import the Dragon enemy class

class GameLevelEnd {
  constructor(gameEnv) {
    console.log("Initializing GameLevelEnd...");

    let width = gameEnv.innerWidth;
    let height = gameEnv.innerHeight;
    let path = gameEnv.path;
    let eyesCollected = 0;

    // Parallax background configuration
    const image_src_parallax = path + "/images/gamify/parallaxbg.png";
    const image_data_parallax = {
      name: 'parallax_background',
      id: 'parallax-background',
      greeting: "A mysterious parallax effect in the background.",
      src: image_src_parallax,
      pixels: { height: 1140, width: 2460 },
      position: { x: 0, y: 0 },
      velocity: 0.2,
      layer: 0,
      zIndex: 1
    };

    const image_src_end = path + "/images/gamify/TransparentEnd.png";
    const image_data_end = {
      name: 'end',
      id: 'end-background',
      greeting: "The End opens before you...",
      src: image_src_end,
      pixels: { height: 1140, width: 2460 },
      layer: 1,
      zIndex: 5
    };

    const sprite_src_chillguy = path + "/images/gamify/Steve.png";
    const CHILLGUY_SCALE_FACTOR = 7;
    const sprite_data_chillguy = {
      id: 'Steve',
      name: 'mainplayer',
      greeting: "Hi, I am Steve.",
      src: sprite_src_chillguy,
      SCALE_FACTOR: CHILLGUY_SCALE_FACTOR,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 25,
      INIT_POSITION: { x: width / 16, y: height / 2 },
      pixels: { height: 256, width: 128 },
      orientation: { rows: 8, columns: 4 },
      down: { row: 1, start: 0, columns: 4 },
      downRight: { row: 7, start: 0, columns: 4, rotate: Math.PI / 8 },
      downLeft: { row: 5, start: 0, columns: 4, rotate: -Math.PI / 8 },
      left: { row: 5, start: 0, columns: 4 },
      right: { row: 7, start: 0, columns: 4 },
      up: { row: 3, start: 0, columns: 4 },
      upLeft: { row: 5, start: 0, columns: 4, rotate: Math.PI / 8 },
      upRight: { row: 7, start: 0, columns: 4, rotate: -Math.PI / 8 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const sprite_src_alex = path + "/images/gamify/Alex.png";
    const alex_SCALE_FACTOR = 7;
    const sprite_data_alex = {
      id: 'Alex',
      name: 'secondplayer',
      greeting: "Hi, I am Alex",
      src: sprite_src_alex,
      SCALE_FACTOR: alex_SCALE_FACTOR,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 25,
      INIT_POSITION: { x: 0, y: height / 2 },
      pixels: { height: 256, width: 128 },
      orientation: { rows: 8, columns: 4 },
      down: { row: 1, start: 0, columns: 4 },
      downRight: { row: 7, start: 0, columns: 4, rotate: Math.PI / 8 },
      downLeft: { row: 5, start: 0, columns: 4, rotate: -Math.PI / 8 },
      left: { row: 5, start: 0, columns: 4 },
      right: { row: 7, start: 0, columns: 4 },
      up: { row: 3, start: 0, columns: 4 },
      upLeft: { row: 5, start: 0, columns: 4, rotate: Math.PI / 8 },
      upRight: { row: 7, start: 0, columns: 4, rotate: -Math.PI / 8 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 73, left: 74, down: 75, right: 76 }
    };




    // start of hack

    const sprite_src_dragon = path + "/images/gamify/dragon.png";
    const sprite_data_dragon = {
      id: 'Dragon',
      greeting: "Enemy Dragon",
      src: sprite_src_dragon,
      SCALE_FACTOR: 5,
      ANIMATION_RATE: 100,
      pixels: { height: 488, width: 564 },
      INIT_POSITION: { x: 100, y: 100 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      walkingArea: {
        xMin: width / 5,
        xMax: (width * 3) / 5,
        yMin: height / 4,
        yMax: (height * 3) / 5
      },
      speed: 5,
      direction: { x: 1, y: 1 },
      sound: new Audio(path + "/dragonRoar.mp3"), // Add sound property
      soundVolume: 0.5, // Set the volume for the sound
      soundDuration: 2000, // Duration for the sound
      soundLoop: false, // Loop the sound
      soundPlay: function () {
        this.sound.volume = this.soundVolume;
        this.sound.loop = this.soundLoop;
        this.sound.play();
        setTimeout(() => {
          this.sound.pause();
          this.sound.currentTime = 0; // Reset sound to start
        }, this.soundDuration);
      },
      
      isAnimating: false, // Add isAnimating property
      playAnimation: function () { // Add playAnimation method
        if (this.isAnimating) return;
        this.isAnimating = true;
        const spriteElement = document.getElementById(this.id);
        if (!spriteElement) return;
        this.sound?.play(); // Ensure sound exists before playing
        spriteElement.style.transition = 'filter 1s ease-in-out';
        spriteElement.style.filter = 'brightness(3) saturate(0)';
        setTimeout(() => {
          spriteElement.style.filter = 'none';
          setTimeout(() => {
            spriteElement.style.transition = '';
            this.isAnimating = false;
          }, 1000);
        }, 1000);
      },
      updatePosition: function () {
        this.INIT_POSITION.x += this.direction.x * this.speed;
        this.INIT_POSITION.y += this.direction.y * this.speed;

        if (this.INIT_POSITION.x <= this.walkingArea.xMin) {
          this.INIT_POSITION.x = this.walkingArea.xMin;
          this.direction.x = 1;
        }
        if (this.INIT_POSITION.x >= this.walkingArea.xMax) {
          this.INIT_POSITION.x = this.walkingArea.xMax;
          this.direction.x = -1;
        }
        if (this.INIT_POSITION.y <= this.walkingArea.yMin) {
          this.INIT_POSITION.y = this.walkingArea.yMin;
          this.direction.y = 1;
        }
        if (this.INIT_POSITION.y >= this.walkingArea.yMax) {
          this.INIT_POSITION.y = this.walkingArea.yMax;
          this.direction.y = -1;
        }
      }
    };

    // Updating dragon's position every 100 ms
    setInterval(() => {
      sprite_data_dragon.updatePosition();
    }, 100);

    // Triggering dragon's animation every 5000 ms
    setInterval(() => {
      sprite_data_dragon.playAnimation();
    }, 5000);






// end of hack


    const sprite_src_eye = path + "/images/gamify/eyeOfEnder.png";
    const sprite_data_eye = {
      id: 'Eye of Ender',
      greeting: "Press E to claim this Eye of Ender.",
      src: sprite_src_eye,
      SCALE_FACTOR: 20,
      ANIMATION_RATE: Number.MAX_SAFE_INTEGER,
      pixels: { height: 16, width: 16 },
      INIT_POSITION: {
        x: (Math.random() * width / 2.6) + width / 19,
        y: (Math.random() * height / 3.5) + height / 2.7
      },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 0 },
      hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
      zIndex: 10,
      move: function (newX, newY) {
        this.INIT_POSITION.x = newX;
        this.INIT_POSITION.y = newY;
      },
      reaction: function () {
        alert("Press E to claim this Eye of Ender.");
      },
      interact: function () {
        eyesCollected++;
        if (eyesCollected >= 12) {
          alert("You have collected all the Eyes of Ender! You can now escape!");
        } else {
          alert(`You collected an Eye of Ender! You need ${12 - eyesCollected} more to escape.`);
          this.move(
            (Math.random() * width / 2.6) + width / 19,
            (Math.random() * height / 3.5) + height / 2.7
          );
        }
      }
    };

    this.classes = [
      { class: BackgroundParallax, data: image_data_parallax },
      { class: GamEnvBackground, data: image_data_end },
      { class: Player, data: sprite_data_chillguy },
      { class: Dragon, data: sprite_data_dragon },
      { class: Collectible, data: sprite_data_eye },
      { class: Player, data: sprite_data_alex }
    ];
  }
}

export default GameLevelEnd;
