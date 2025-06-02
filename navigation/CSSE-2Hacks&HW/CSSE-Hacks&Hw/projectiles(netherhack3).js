/**
 * CS Fighters - Projectile System
 * Handles creation and management of projectiles
 */

/**
 * Projectile class for attacks
 */
class Projectile {
    /**
     * Create a new projectile
     * @param {Number} x - Starting X position
     * @param {Number} y - Starting Y position
     * @param {Number} width - Projectile width
     * @param {Number} height - Projectile height
     * @param {Number} velocityX - Horizontal velocity
     * @param {Number} velocityY - Vertical velocity
     * @param {Number} damage - Damage dealt on hit
     * @param {String} color - Projectile color
     * @param {Number} lifetime - How long projectile lasts (ms)
     * @param {String} owner - Who fired the projectile ('player' or 'enemy')
     * @param {Object} options - Additional options (execute, effect, etc.)
     */
    constructor(x, y, width, height, velocityX, velocityY, damage, color, lifetime, owner, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.damage = damage;
        this.color = color;
        this.isActive = true;
        this.owner = owner;
        this.type = options.type || 'standard';
        
        // Special properties
        this.execute = options.execute || 0; // Health threshold for execute (0-1)
        this.effect = options.effect || null; // Special effect on hit
        this.effectDuration = options.effectDuration || 0; // Duration of effect
        this.effectStrength = options.effectStrength || 8; // Effect strength (default 8)
        
        // apparently muy importante to get heal for rufat
        this.onHit = options.onHit || null;

        // Force properties
        this.forceX = options.forceX || 0;
        this.forceY = options.forceY || 0;
        this.forceDuration = options.forceDuration || 1;
        
        // Movement pattern properties
        this.movementPattern = options.movementPattern || null;
        this.movementParams = options.movementParams || {};
        
        // For sine wave movement
        if (this.movementPattern === 'sine') {
            this.initialY = y;
            this.amplitude = this.movementParams.amplitude || 50;
            this.frequency = this.movementParams.frequency || 0.05;
            this.travelDistance = 0;
        }
        
        // For helix patterns
        this.offset = options.offset || 0;
        
        // Status effect properties
        this.statusEffects = options.statusEffects || [];
        
        // Set expiration time
        this.expirationTime = Date.now() + lifetime;
        this.createTime = Date.now();
    }
    
    /**
     * Update projectile position
     */
    update() {
        // Store previous position to calculate distance
        const prevX = this.x;
        const prevY = this.y;
        
        // Move projectile based on movement pattern
        if (this.movementPattern === 'sine') {
            // Update travel distance
            this.travelDistance += Math.abs(this.velocityX);
            
            // Calculate sine wave Y position
            const screenFrequency = (2 * Math.PI * 4) / CONFIG.CANVAS.WIDTH;
            const reducedAmplitude = this.amplitude * 0.4;
            
            const sineOffset = Math.sin(this.travelDistance * screenFrequency) * reducedAmplitude;
            
            // Move horizontally as normal
            this.x += this.velocityX;
            
            // Set Y position based on sine wave + initial position + any offset
            this.y = this.initialY + sineOffset + this.offset;
        } else {
            // Standard movement
            this.x += this.velocityX;
            this.y += this.velocityY;
        }
        
        // Special handling for certain projectile types that ignore terrain
        if (this.type === 'helix' || this.type === 'malware' || this.type === 'hellfire') {
            // Skip all collision checks for helix (East's sine attack) and malware projectiles
            // They can pass through walls, floors, and platforms
        } else {
            // Normal collision checks for other projectile types
            
            // CHECK COLLISION WITH FLOOR
            if (CONFIG.ENVIRONMENT.FLOOR_ACTIVE !== false) {
                // Check for pit exceptions (areas with no floor)
                let inPit = false;
                
                if (CONFIG.ENVIRONMENT.PITS) {
                    for (const pit of CONFIG.ENVIRONMENT.PITS) {
                        if (this.x + this.width > pit.x && this.x < pit.x + pit.width) {
                            inPit = true;
                            break;
                        }
                    }
                }
                
                // If not in a pit and hitting the floor, deactivate
                if (!inPit && this.y + this.height >= CONFIG.ENVIRONMENT.FLOOR_Y) {
                    this.isActive = false;
                    return;
                }
            }
            
            // CHECK COLLISION WITH PLATFORMS
            for (const platform of CONFIG.ENVIRONMENT.PLATFORMS) {
                // Check if projectile overlaps with platform
                if (this.x + this.width > platform.x &&
                    this.x < platform.x + platform.width &&
                    this.y + this.height > platform.y &&
                    this.y < platform.y + platform.height) {
                    
                    this.isActive = false;
                    return;
                }
            }
            
            // CHECK COLLISION WITH WALLS (if they exist)
            if (CONFIG.ENVIRONMENT.WALLS && Array.isArray(CONFIG.ENVIRONMENT.WALLS)) {
                for (const wall of CONFIG.ENVIRONMENT.WALLS) {
                    if (this.x + this.width > wall.x &&
                        this.x < wall.x + wall.width &&
                        this.y + this.height > wall.y &&
                        this.y < wall.y + wall.height) {
                        
                        this.isActive = false;
                        return;
                    }
                }
            }
        }
        
        // Check max distance traveled (for limited range projectiles)
        if (this.maxDistance > 0) {
            const distanceFromStart = Math.sqrt(
                Math.pow(this.x - this.startX, 2) + 
                Math.pow(this.y - this.startY, 2)
            );
            
            if (distanceFromStart >= this.maxDistance) {
                this.isActive = false;
                return;
            }
        }
        
        // Check if projectile should expire by time
        if (Date.now() > this.expirationTime) {
            this.isActive = false;
            return;
        }
        
        // Check if projectile is off-screen
        if (this.x < -this.width || this.x > CONFIG.CANVAS.WIDTH ||
            this.y < -this.height || this.y > CONFIG.CANVAS.HEIGHT) {
            this.isActive = false;
        }
    }
    
    /**
     * Draw projectile on canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        
        // Different drawing based on projectile type
        switch(this.type) {
            case 'seed':
                // Draw seed shape (oval)
                ctx.beginPath();
                ctx.ellipse(
                    this.x + this.width/2, 
                    this.y + this.height/2,
                    this.width/2,
                    this.height/2,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
                
                // Draw glow
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.ellipse(
                    this.x + this.width/2, 
                    this.y + this.height/2,
                    this.width/2 + 3,
                    this.height/2 + 3,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
                ctx.globalAlpha = 1.0;
                break;
                
            case 'note':
                // Draw music note
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Draw stem
                ctx.fillRect(
                    this.x + this.width - 4,
                    this.y - this.height/2,
                    2,
                    this.height
                );
                break;
                
            case 'code':
                // Draw text for CODE
                ctx.font = `${this.height}px Arial`;
                ctx.fillText('CODE', this.x, this.y + this.height);
                break;
                
            case 'malware':
                // Draw malware as a pixelated, glitchy circle
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Add glitch effect
                const glitchAmount = Math.random() * 4;
                const glitchX = this.x + (Math.random() - 0.5) * glitchAmount;
                const glitchY = this.y + (Math.random() - 0.5) * glitchAmount;
                
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = "rgba(0, 255, 150, 0.8)";
                ctx.beginPath();
                ctx.arc(
                    glitchX + this.width/2,
                    glitchY + this.height/2,
                    this.width/2 * 0.8,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                ctx.globalAlpha = 1.0;
                break;
                
            // In the Projectile draw() method, rename conflicting gradient variables:

            case 'helix':
                // Draw helix projectile as a glowing cyber circle
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Add inner glow
                const helixGradient = ctx.createRadialGradient(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/4,
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2
                );
                helixGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
                helixGradient.addColorStop(1, this.color);
                
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = helixGradient;
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                ctx.globalAlpha = 1.0;
                break;

            case 'burst':
                // Draw burst projectile with trailing effect
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fillStyle = this.color;
                ctx.fill();
                
                // Add trail
                const trailLength = 20;
                const burstGradient = ctx.createLinearGradient(
                    this.x - this.velocityX * 0.5,
                    this.y - this.velocityY * 0.5,
                    this.x + this.width/2,
                    this.y + this.height/2
                );
                burstGradient.addColorStop(0, 'rgba(255, 140, 0, 0)');
                burstGradient.addColorStop(1, this.color);
                
                ctx.globalAlpha = 0.7;
                ctx.strokeStyle = burstGradient;
                ctx.lineWidth = this.height;
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
                ctx.lineTo(
                    this.x + this.width/2 - this.velocityX * 0.5,
                    this.y + this.height/2 - this.velocityY * 0.5
                );
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                break;

            case 'sonicWave':
                // Draw sonic wave as a pulsing wave shape
                ctx.beginPath();
                
                // Draw wave shape
                const waveHeight = this.height * 0.5;
                const waveWidth = this.width;
                
                ctx.moveTo(this.x, this.y + this.height/2);
                
                // Draw wave using sine function
                for (let i = 0; i <= waveWidth; i++) {
                    const waveY = this.y + this.height/2 + 
                                 Math.sin(i / waveWidth * Math.PI * 4 + 
                                         Date.now() * 0.01) * waveHeight;
                    ctx.lineTo(this.x + i, waveY);
                }
                
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // Add glow
                ctx.globalAlpha = 0.5;
                ctx.lineWidth = 6;
                ctx.strokeStyle = "rgba(0, 255, 150, 0.5)";
                ctx.stroke();
                
                ctx.globalAlpha = 1.0;
                break;

            case 'bansheeBeam':
                // Draw banshee beam as a fiery projectile
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Add glowing effect
                const bansheeGradient = ctx.createRadialGradient(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/4,
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2
                );
                bansheeGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
                bansheeGradient.addColorStop(1, this.color);
                
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = bansheeGradient;
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                ctx.globalAlpha = 1.0;
                
                // Add a trail effect
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.height/2);
                ctx.lineTo(this.x - this.width, this.y + this.height/2);
                ctx.lineWidth = this.height;
                ctx.strokeStyle = "rgba(255, 100, 0, 0.5)";
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                break;

            case 'gitPull':
                // Draw Git Pull symbol (arrow pointing backward)
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Draw arrow
                const arrowDir = this.velocityX > 0 ? -1 : 1; // Arrow points opposite to movement
                const arrowLength = this.width * 0.8;
                const arrowHeadSize = this.width * 0.4;
                
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
                ctx.lineTo(this.x + this.width/2 + arrowDir * arrowLength, this.y + this.height/2);
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2 + arrowDir * arrowLength, this.y + this.height/2);
                ctx.lineTo(this.x + this.width/2 + arrowDir * (arrowLength - arrowHeadSize), this.y + this.height/2 - arrowHeadSize/2);
                ctx.lineTo(this.x + this.width/2 + arrowDir * (arrowLength - arrowHeadSize), this.y + this.height/2 + arrowHeadSize/2);
                ctx.closePath();
                ctx.fill();
                break;
                
            case 'gitPush':
                // Draw Git Push symbol (arrow pointing forward)
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(
                    this.x + this.width/2,
                    this.y + this.height/2,
                    this.width/2,
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Draw arrow in direction of travel
                const pushArrowDir = this.velocityX > 0 ? 1 : -1;
                const pushArrowLength = this.width * 0.8;
                const pushArrowHeadSize = this.width * 0.4;
                
                ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
                ctx.lineTo(this.x + this.width/2 + pushArrowDir * pushArrowLength, this.y + this.height/2);
                ctx.stroke();
                
                // Arrow head
                ctx.beginPath();
                ctx.moveTo(this.x + this.width/2 + pushArrowDir * pushArrowLength, this.y + this.height/2);
                ctx.lineTo(this.x + this.width/2 + pushArrowDir * (pushArrowLength - pushArrowHeadSize), this.y + this.height/2 - pushArrowHeadSize/2);
                ctx.lineTo(this.x + this.width/2 + pushArrowDir * (pushArrowLength - pushArrowHeadSize), this.y + this.height/2 + pushArrowHeadSize/2);
                ctx.closePath();
                ctx.fill();
                break;

            case 'slash':
                // Draw slash projectile as a thin line/blade
                ctx.save();
                
                // Rotate based on velocity
                const angle = Math.atan2(this.velocityY, this.velocityX);
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(angle);
                
                // Draw blade
                ctx.fillStyle = this.color;
                ctx.fillRect(-this.width/2, -this.height/2, this.width * 1.5, this.height);
                
                // Add glow effect
                ctx.globalAlpha = 0.6;
                ctx.fillRect(-this.width/2 - 2, -this.height/2 - 2, this.width * 1.5 + 4, this.height + 4);
                
                ctx.restore();
                break;

                case 'dummy':
                    // Draw a simple red circle for dummy projectiles
                    ctx.beginPath();
                    ctx.arc(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        this.width/2,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                    
                    // Add a simple glow effect
                    ctx.globalAlpha = 0.3;
                    ctx.beginPath();
                    ctx.arc(
                        this.x + this.width/2,
                        this.y + this.height/2,
                        this.width/2 + 2,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                    ctx.globalAlpha = 1.0;
                    break;
                
            default:
                // Default rectangle projectile
                ctx.fillRect(this.x, this.y, this.width, this.height);
                
                // Draw glow effect
                ctx.globalAlpha = 0.3;
                ctx.fillRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
                ctx.globalAlpha = 1.0;
                break;
        }
    }
    
    /**
     * Get projectile hitbox for collision detection
     * @returns {Object} Hitbox {x, y, width, height}
     */
    getHitbox() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

/**
 * Manages all projectiles in the game
 */
const ProjectileManager = {
    projectiles: [],
    
    /**
     * Create a standard projectile moving horizontally
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration
     * @returns {Projectile} The created projectile
     */
    createProjectile: function(character, projectileConfig) {
        const direction = character.direction;
        const projectileSpeed = projectileConfig.speed || CONFIG.PROJECTILE.SPEED;
        
        // Calculate spawn position (in front of the character)
        const spawnX = projectileConfig.x !== undefined ? projectileConfig.x : 
        (direction > 0 
            ? character.x + character.width 
            : character.x - projectileConfig.width);
    
        const spawnY = projectileConfig.y !== undefined ? projectileConfig.y :
            (character.y + (character.height / 2) - (projectileConfig.height / 2));
        
        // Create the projectile
        const projectile = new Projectile(
            spawnX,
            spawnY,
            projectileConfig.width,
            projectileConfig.height,
            direction * projectileSpeed,
            0, // No vertical velocity
            projectileConfig.damage,
            projectileConfig.color,
            projectileConfig.lifetime || CONFIG.PROJECTILE.LIFETIME,
            character.type,
            {
                type: projectileConfig.type,
                execute: projectileConfig.execute,
                effect: projectileConfig.effect,
                effectDuration: projectileConfig.effectDuration,
                effectStrength: projectileConfig.effectStrength,
                movementPattern: projectileConfig.movementPattern,
                movementParams: projectileConfig.movementParams,
                statusEffects: projectileConfig.statusEffects,
                offset: projectileConfig.offset,
                // Add these:
                forceX: projectileConfig.forceX,
                forceY: projectileConfig.forceY,
                forceDuration: projectileConfig.forceDuration
            }
        );
        
        // Add to projectiles array
        this.projectiles.push(projectile);
        
        return projectile;
    },
    
    /**
     * Create a directional projectile with custom velocity
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration with speedX and speedY
     * @returns {Projectile} The created projectile
     */
    createDirectionalProjectile: function(character, projectileConfig) {
        // Calculate spawn position (centered on character)
        const spawnX = character.x + character.width/2 - projectileConfig.width/2;
        const spawnY = character.y + character.height/2 - projectileConfig.height/2;
        
        // Create the projectile with specified velocities
        const projectile = new Projectile(
            spawnX,
            spawnY,
            projectileConfig.width,
            projectileConfig.height,
            projectileConfig.speedX,
            projectileConfig.speedY,
            projectileConfig.damage,
            projectileConfig.color,
            projectileConfig.lifetime || CONFIG.PROJECTILE.LIFETIME,
            character.type,
            {
                type: projectileConfig.type,
                execute: projectileConfig.execute,
                effect: projectileConfig.effect,
                effectDuration: projectileConfig.effectDuration,
                effectStrength: projectileConfig.effectStrength,
                movementPattern: projectileConfig.movementPattern,
                movementParams: projectileConfig.movementParams,
                statusEffects: projectileConfig.statusEffects,
                offset: projectileConfig.offset,
                forceX: projectileConfig.forceX,
                forceY: projectileConfig.forceY,
                forceDuration: projectileConfig.forceDuration,
                // Add this line explicitly:
                onHit: projectileConfig.onHit
            }
        );
        
        // Add to projectiles array
        this.projectiles.push(projectile);
        
        return projectile;
    },
    // test dummy shot
    createDummyProjectile: function(character, projectileConfig) {
        // Calculate spawn position (from the center of the dummy)
        const spawnX = character.direction > 0 
            ? character.x + character.width 
            : character.x;
        
        const spawnY = character.y + (character.height / 2) - (projectileConfig.height / 2);
        
        // Create the projectile with specified velocities
        const projectile = new Projectile(
            spawnX,
            spawnY,
            projectileConfig.width,
            projectileConfig.height,
            character.direction * projectileConfig.speed, // Horizontal velocity
            0, // No vertical velocity
            projectileConfig.damage,
            projectileConfig.color,
            projectileConfig.lifetime,
            character.type, // 'enemy'
            {
                type: 'dummy',
            }
        );
        
        // Add to projectiles array
        this.projectiles.push(projectile);
        
        return projectile;
    },
    
    /**
     * Create a fan of banshee beam projectiles (for Rufat's ultimate)
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration
     * @param {Number} count - Number of projectiles in the fan
     * @param {Number} spreadAngle - Total spread angle in degrees
     * @returns {Array} Created projectiles
     */
    createBansheeBeam: function(character, projectileConfig, count = 5, spreadAngle = 60) {
        const direction = character.direction;
        const baseSpeed = projectileConfig.speed || 15;
        const damage = projectileConfig.damage || 50;
        const color = projectileConfig.color || "rgba(255, 0, 0, 1.0)";
        const lifetime = projectileConfig.lifetime || 800; // Short range
        const onHit = projectileConfig.onHit; // Store the onHit callback
        
        console.log("Creating banshee beam with onHit:", Boolean(onHit), "Is function:", typeof onHit === 'function');
        
        const projectiles = [];
        
        // Calculate starting angle
        const baseAngle = direction > 0 ? 0 : 180; // 0 degrees is right, 180 is left
        const startAngle = baseAngle - (spreadAngle / 2);
        const angleStep = spreadAngle / (count - 1);
        
        // Create projectiles in a fan pattern
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (angleStep * i);
            const radians = angle * Math.PI / 180;
            
            // Calculate velocities
            const speedX = Math.cos(radians) * baseSpeed;
            const speedY = Math.sin(radians) * baseSpeed;
            
            // Create projectile
            const projectile = this.createDirectionalProjectile(character, {
                width: 30,
                height: 15,
                speedX: speedX,
                speedY: speedY,
                damage: damage,
                color: color,
                lifetime: lifetime,
                type: 'bansheeBeam',
                // Explicitly pass the onHit callback
                onHit: onHit
            });
            
            projectiles.push(projectile);
        }
        
        return projectiles;
    },
    /**
     * Create a helix (sine wave) projectile
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration
     * @returns {Array} Array of created projectiles (top and bottom)
     */
    createHelixProjectiles: function(character, projectileConfig) {
        const direction = character.direction;
        const speed = projectileConfig.speed || CONFIG.PROJECTILE.SPEED;
        const amplitude = projectileConfig.amplitude || 50;
        const frequency = projectileConfig.frequency || 0.9;
        
        // Calculate spawn position
        const spawnX = direction > 0 
            ? character.x + character.width 
            : character.x - projectileConfig.width;
        
        // Center position
        const spawnY = character.y + (character.height / 2) - (projectileConfig.height / 2);
        
        // Create offset for the two projectiles (one above, one below)
        const offset1 = -amplitude / 2; // Top projectile
        const offset2 = amplitude / 2;  // Bottom projectile
        
        // Create two projectiles with opposite sine wave phases
        const projectile1 = new Projectile(
            spawnX,
            spawnY + offset1,
            projectileConfig.width,
            projectileConfig.height,
            direction * speed,
            0, // Initial vertical velocity (will be modified by sine wave)
            projectileConfig.damage,
            projectileConfig.color,
            projectileConfig.lifetime || CONFIG.PROJECTILE.LIFETIME,
            character.type,
            {
                type: 'helix',
                movementPattern: 'sine',
                movementParams: {
                    amplitude: amplitude,
                    frequency: frequency
                },
                offset: offset1,
                statusEffects: projectileConfig.statusEffects
            }
        );
        
        const projectile2 = new Projectile(
            spawnX,
            spawnY + offset2,
            projectileConfig.width,
            projectileConfig.height,
            direction * speed,
            0,
            projectileConfig.damage,
            projectileConfig.color,
            projectileConfig.lifetime || CONFIG.PROJECTILE.LIFETIME,
            character.type,
            {
                type: 'helix',
                movementPattern: 'sine',
                movementParams: {
                    amplitude: amplitude,
                    frequency: frequency
                },
                offset: offset2,
                statusEffects: projectileConfig.statusEffects
            }
        );
        
        // Add to projectiles array
        this.projectiles.push(projectile1);
        this.projectiles.push(projectile2);
        
        return [projectile1, projectile2];
    },

    /**
     * Create a malware projectile (for East's basic skill)
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration
     * @returns {Projectile} The created projectile
     */
    createMalwareProjectile: function(character, projectileConfig) {
        const direction = character.direction;
        const speed = projectileConfig.speed || 30; // Higher speed for malware
        
        // Calculate spawn position
        const spawnX = direction > 0 
            ? character.x + character.width 
            : character.x - projectileConfig.width;
        
        // Center position
        const spawnY = character.y + (character.height / 2) - (projectileConfig.height / 2);
        
        // Create malware projectile
        const projectile = new Projectile(
            spawnX,
            spawnY,
            projectileConfig.width,
            projectileConfig.height,
            direction * speed,
            0,
            projectileConfig.damage || 5, // Direct damage is minimal
            projectileConfig.color || "rgba(0, 255, 100, 1.0)",
            projectileConfig.lifetime || 1500, // Faster projectile, shorter lifetime
            character.type,
            {
                type: 'malware',
                statusEffects: [
                    {
                        type: 'malware',
                        duration: CONFIG.STATUS_EFFECTS.MALWARE.DURATION
                    }
                ]
            }
        );
        
        // Add to projectiles array
        this.projectiles.push(projectile);
        
        return projectile;
    },

    /**
     * Create a fan of sonic wave projectiles (for East's ultimate)
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration
     * @param {Number} count - Number of projectiles in the fan
     * @param {Number} spreadAngle - Total spread angle in degrees
     * @returns {Array} Created projectiles
     */
    createSonicWaveFan: function(character, projectileConfig, count = 5, spreadAngle = 60) {
        const direction = character.direction;
        const baseSpeed = projectileConfig.speed || 15;
        const damage = projectileConfig.damage || 15;
        const color = projectileConfig.color || "rgba(0, 255, 150, 1.0)";
        const lifetime = projectileConfig.lifetime || 1000; // Short range
        
        const projectiles = [];
        
        // Calculate starting angle
        const baseAngle = direction > 0 ? 0 : 180; // 0 degrees is right, 180 is left
        const startAngle = baseAngle - (spreadAngle / 2);
        const angleStep = spreadAngle / (count - 1);
        
        // Create projectiles in a fan pattern
        for (let i = 0; i < count; i++) {
            const angle = startAngle + (angleStep * i);
            const radians = angle * Math.PI / 180;
            
            // Calculate velocities
            const speedX = Math.cos(radians) * baseSpeed;
            const speedY = Math.sin(radians) * baseSpeed;
            
            // Create projectile
            const projectile = this.createDirectionalProjectile(character, {
                width: 30,
                height: 15,
                speedX: speedX,
                speedY: speedY,
                damage: damage,
                color: color,
                lifetime: lifetime,
                type: 'sonicWave',
                statusEffects: [
                    {
                        type: 'malware',
                        duration: 4000 // 4 seconds of malware
                    },
                    {
                        type: 'slow',
                        duration: 3000 // 3 seconds of slow
                    }
                ]
            });
            
            projectiles.push(projectile);
        }
        
        return projectiles;
    },
    /**
     * Create a falling projectile (for Mort's code)
     * @param {Object} character - Character firing the projectile
     * @param {Object} projectileConfig - Projectile configuration
     * @returns {Projectile} The created projectile
     */
    createFallingProjectile: function(character, projectileConfig) {
        // Create the projectile at specified position
        const projectile = new Projectile(
            projectileConfig.x,
            projectileConfig.y,
            projectileConfig.width,
            projectileConfig.height,
            projectileConfig.speedX,
            projectileConfig.speedY,
            projectileConfig.damage,
            projectileConfig.color,
            projectileConfig.lifetime,
            character.type,
            {
                type: projectileConfig.type,
                statusEffects: projectileConfig.statusEffects
            }
        );
        
        // Add to projectiles array
        this.projectiles.push(projectile);
        
        return projectile;
    },
    
    /**
     * Update all projectiles
     */
    update: function() {
        // Update each projectile
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].update();
        }
        
        // Remove inactive projectiles
        this.projectiles = this.projectiles.filter(projectile => projectile.isActive);
    },
    
    /**
     * Draw all projectiles
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw: function(ctx) {
        this.projectiles.forEach(projectile => projectile.draw(ctx));
    },
    
    /**
     * Check if any projectiles hit a target
     * @param {Object} target - Target object with hitbox
     * @returns {Number} Total damage dealt, 0 if no hit
     */
    checkHits: function(target) {
        let totalDamage = 0;
        
        // Check each projectile
        for (let i = 0; i < this.projectiles.length; i++) {
            const projectile = this.projectiles[i];
            
            // Skip projectiles owned by the target
            if (projectile.owner === target.type) continue;
            
            // Check collision
            if (Utils.checkCollision(projectile.getHitbox(), target.getHitbox())) {
                
                
                // Calculate damage based on projectile properties
                let damage = projectile.damage;
                
                // Handle execute mechanic (for ZhengLorant's ult)
                if (projectile.execute > 0 && (target.health / target.maxHealth) < projectile.execute) {
                    damage = target.health; // Execute - deal remaining health as damage
                }
                
                totalDamage += damage;
                //onhit callback if provided
                if (projectile.onHit && typeof projectile.onHit === 'function') {
                    projectile.onHit(target, damage);
                }
                
                // Apply status effects if any
                if (projectile.statusEffects && projectile.statusEffects.length > 0) {
                    for (const effectConfig of projectile.statusEffects) {

                        
                        // Apply the effect to the target with explicit params
                        StatusEffectManager.applyEffect(
                            target,
                            effectConfig.type,
                            effectConfig.duration,
                            effectConfig.params || {},
                            projectile.owner
                        );
                        
                        // Add visual notification
                        if (window.game && window.game.statusMessage) {
                            window.game.statusMessage.textContent = `${effectConfig.type.toUpperCase()} applied to target!`;
                        }
                    }
                }
                
                // Handle special effects
                if (projectile.effect === 'forced_movement' && target.applyForcedMovement) {
                    // Direction away from player
                    const direction = (target.x > projectile.x) ? 1 : -1;
                    const strength = projectile.effectStrength || 8; // Default strength if not specified
                    target.applyForcedMovement(direction, projectile.effectDuration, strength);
                } else if (projectile.effect === 'pull' && target.applyForcedMovement) {
                    // Direction towards player (opposite of normal knockback)
                    const direction = (target.x > projectile.x) ? -1 : 1;
                    const strength = projectile.effectStrength || 8;
                    target.applyForcedMovement(direction, projectile.effectDuration, strength);
                } else if (projectile.effect === 'knockback' && target.applyForcedMovement) {
                    // Direction away from projectile
                    const direction = (target.x > projectile.x) ? 1 : -1;
                    const strength = projectile.effectStrength || 8;
                    target.applyForcedMovement(direction, projectile.effectDuration, strength);
                } else if (projectile.effect === 'force' && target.applyForce) {
                    // Apply raw force vector
                    const forceX = projectile.forceX || 0;
                    const forceY = projectile.forceY || 0;
                    const duration = projectile.forceDuration || 1;
                    target.applyForce(forceX, forceY, duration);
                }
                
                // Special effect for Mort's seed
                if (projectile.type === 'seed' && target.health <= damage) {
                    // The game would reset here in a full implementation
                    // For now, just display a message
                    if (window.game && window.game.statusMessage) {
                        window.game.statusMessage.textContent = "SEED DOCKED! GAME RESET!";
                    }
                }
                
                projectile.isActive = false; // Deactivate projectile after hit
            }
        }
        
        return totalDamage;
    },
    
    /**
     * Clear all projectiles
     */
    clear: function() {
        this.projectiles = [];
    }
};