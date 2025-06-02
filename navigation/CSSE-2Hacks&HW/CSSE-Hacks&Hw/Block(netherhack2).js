// block (hack 2 for nether)

class Block {
    constructor(gameEnv) {
      this.gameEnv = gameEnv;
      this.width = 50; // Width of the block
      this.height = 50; // Height of the block
      
      // Position the block in a random column
      this.x = Math.random() * (gameEnv.innerWidth - this.width);
      this.y = 0; // Start from top of the screen
      
      // Speed and physics properties
      this.baseSpeed = 1; // Initial falling speed
      this.speed = this.baseSpeed;
      this.acceleration = 0.2; // Acceleration per frame
      this.maxSpeed = 20; // Maximum speed cap
      this.bounceForce = -10; // Force of bounce (negative to go up)
      this.gravity = 0.4; // Gravity effect
      this.bounceDecay = 0.6; // Bounce decay factor (0-1, lower means more dampening)
      this.bounceCount = 0; // Track bounces for a single fall
      this.maxBounces = 2; // Maximum number of bounces before resetting
      this.fallCount = 0; // Track how many times the block has fallen completely
      
      // State flags
      this.isBouncing = false;
      
      // Random color generation for visual variety
      this.colors = ['crimson', 'royalblue', 'limegreen', 'mediumslateblue', 'darkorange', 'gold', 'deeppink', 'turquoise', 'tomato', 'springgreen', 'indigo', 'orchid', 'salmon', 'steelblue', 'chartreuse', 'coral', 'cyan', 'fuchsia', 'navy', 'firebrick'];
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      
      // Create HTML element for the block
      this.element = document.createElement('div');
      this.element.style.position = 'absolute';
      this.element.style.width = this.width + 'px';
      this.element.style.height = this.height + 'px';
      this.element.style.backgroundColor = this.color;
      this.element.style.transition = 'background-color 0.3s';
      this.element.style.zIndex = '100'; // Make sure blocks appear above background
      this.element.style.borderRadius = '5px'; // Rounded corners
      this.element.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.3)'; // Drop shadow for depth
      document.body.appendChild(this.element);
    }
  
    update() {
      // Apply gravity and acceleration
      if (!this.isBouncing) {
        // Exponential acceleration during fall
        this.speed += this.acceleration * (1 + this.y / (this.gameEnv.innerHeight / 2));
        this.speed = Math.min(this.speed, this.maxSpeed);
      } else {
        // Apply gravity during bounce
        this.speed += this.gravity;
      }
      
      // Update vertical position
      this.y += this.speed;
  
      // Check if block hit the bottom
      if (this.y > this.gameEnv.innerHeight - this.height && this.speed > 0) { 
        // Bounce behavior
        if (this.bounceCount < this.maxBounces) {
          // Calculate bounce force based on impact speed and decay
          let bounceStrength = this.bounceForce * Math.min(this.speed / 10, 1) * Math.pow(this.bounceDecay, this.bounceCount);
          this.speed = bounceStrength;
          this.isBouncing = true;
          this.bounceCount++;
          
          // Ensure the block doesn't go below the ground
          this.y = this.gameEnv.innerHeight - this.height;
        } else {
          // Reset after max bounces
          this.resetBlock();
        }
      }
      
      // Check if block reached top of bounce
      if (this.isBouncing && this.speed >= 0) {
        this.isBouncing = false;
      }
      
      // Update HTML element position
      this.element.style.top = this.y + 'px';
      this.element.style.left = this.x + 'px';
      
      // Add subtle rotation effect based on movement for visual interest
      const rotation = Math.sin(this.y / 50) * 10;
      this.element.style.transform = `rotate(${rotation}deg)`;
    }
    
    resetBlock() {
      // Reset position to top
      this.y = -this.height - Math.random() * 200; // Stagger the heights
      
      // Change to a new random column
      this.x = Math.random() * (this.gameEnv.innerWidth - this.width);
      
      // Reset physics
      this.speed = this.baseSpeed;
      this.bounceCount = 0;
      this.isBouncing = false;
      
      // Increase fall count for difficulty progression
      this.fallCount++;
      
      // Increase base difficulty slightly
      this.baseSpeed += 0.1;
      this.acceleration += 0.01;
      
      // Change color on each reset
      this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.element.style.backgroundColor = this.color;
    }
  
    render(ctx) {
      // If using canvas for rendering
      if (ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
      }
    }
    
    // Check collision with player
    checkCollision(player) {
      if (!player || !player.position) return false;
      
      // Get player hitbox dimensions
      const playerWidth = player.width * player.hitbox.widthPercentage;
      const playerHeight = player.height * player.hitbox.heightPercentage;
      
      // Calculate hitbox positions (centered on player)
      const playerX = player.position.x + (player.width - playerWidth) / 2;
      const playerY = player.position.y + (player.height - playerHeight);
      
      // Check for overlap between player hitbox and block
      return (
        playerX < this.x + this.width &&
        playerX + playerWidth > this.x &&
        playerY < this.y + this.height &&
        playerY + playerHeight > this.y
      );
    }
    
    // Clean up when block is no longer needed
    destroy() {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }
  }
  
  export default Block;