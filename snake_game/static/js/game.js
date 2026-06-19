class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.colors = gameColors;
        
        this.gridSize = 20;
        this.cellSize = this.canvas.width / this.gridSize;
        
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.bonusFood = null;
        this.mirrorSnake = [];
        
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.gameSpeed = 100;
        this.consecutiveFoods = 0;
        
        // Power-up management
        this.activePowerUps = {};
        this.invincible = false;
        this.canPassSelf = false;
        this.speedMultiplier = 1.0;
        this.pointsMultiplier = 1.0;
        
        // Initialize particle system and animations
        this.particleSystem = new ParticleSystem(this.canvas, this.ctx);
        this.bonusFruitRenderer = new BonusFruitRenderer(this.ctx, this.cellSize);
        this.powerUpEffects = new PowerUpEffects(this.ctx, this.canvas);
        
        this.setupEventListeners();
        this.updateUI();
        this.draw();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const actions = {
                'ArrowUp': () => this.changeDirection({ x: 0, y: -1 }),
                'ArrowDown': () => this.changeDirection({ x: 0, y: 1 }),
                'ArrowLeft': () => this.changeDirection({ x: -1, y: 0 }),
                'ArrowRight': () => this.changeDirection({ x: 1, y: 0 }),
                'KeyW': () => this.changeDirection({ x: 0, y: -1 }),
                'KeyS': () => this.changeDirection({ x: 0, y: 1 }),
                'KeyA': () => this.changeDirection({ x: -1, y: 0 }),
                'KeyD': () => this.changeDirection({ x: 1, y: 0 }),
                'Space': () => this.togglePause()
            };
            
            const action = actions[e.code];
            if (action) {
                e.preventDefault();
                action();
            }
        });
    }
    
    changeDirection(newDirection) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const currentDirection = this.direction;
        const oppositeDirection = { x: -currentDirection.x, y: -currentDirection.y };
        
        if (newDirection.x !== oppositeDirection.x || newDirection.y !== oppositeDirection.y) {
            this.direction = newDirection;
        }
    }
    
    generateFood() {
        let food;
        const occupied = [...this.snake];
        if (this.bonusFood) {
            occupied.push(this.bonusFood.position);
        }
        
        do {
            food = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (occupied.some(pos => pos.x === food.x && pos.y === food.y));
        
        return food;
    }
    
    spawnBonusFood() {
        const types = ['lightning', 'shield', 'ghost', 'magnet', 'freeze', 'rainbow', 'bomb', 'mirror'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let position;
        const occupied = [...this.snake, this.food];
        
        do {
            position = {
                x: Math.floor(Math.random() * this.gridSize),
                y: Math.floor(Math.random() * this.gridSize)
            };
        } while (occupied.some(pos => pos.x === position.x && pos.y === position.y));
        
        this.bonusFood = {
            position: position,
            type: type,
            spawnTime: Date.now(),
            duration: 5000,
            timeRemaining: 5
        };
        
        // Announcement particle effect
        this.particleSystem.emit(
            position.x * this.cellSize + this.cellSize / 2,
            position.y * this.cellSize + this.cellSize / 2,
            type, 20
        );
    }
    
    consumeBonusFood() {
        if (!this.bonusFood) return;
        
        const type = this.bonusFood.type;
        const position = this.bonusFood.position;
        
        // Show power-up notification
        this.showPowerUpNotification(type);
        
        // Create consumption effect
        this.particleSystem.emit(
            position.x * this.cellSize + this.cellSize / 2,
            position.y * this.cellSize + this.cellSize / 2,
            type, 30
        );
        
        // Apply bonus effect
        switch(type) {
            case 'lightning':
                this.applyLightningEffect();
                break;
            case 'shield':
                this.activatePowerUp('shield', 5000);
                break;
            case 'ghost':
                this.activatePowerUp('ghost', 5000);
                break;
            case 'magnet':
                this.activatePowerUp('magnet', 0, 3);
                break;
            case 'freeze':
                this.activatePowerUp('freeze', 8000);
                break;
            case 'rainbow':
                this.activatePowerUp('rainbow', 0, 5);
                break;
            case 'bomb':
                this.applyBombEffect();
                break;
            case 'mirror':
                this.activatePowerUp('mirror', 10000);
                break;
        }
        
        // Bonus points
        this.score += 50;
        this.bonusFood = null;
        this.updateUI();
    }
    
    showPowerUpNotification(type) {
        const notification = document.getElementById('powerUpNotification');
        const icon = document.getElementById('notificationIcon');
        const title = document.getElementById('notificationTitle');
        const description = document.getElementById('notificationDescription');
        
        // Clear previous classes
        notification.className = 'power-up-notification';
        
        // Set content based on power-up type
        const powerUpData = {
            'lightning': {
                icon: '⚡',
                title: 'LIGHTNING TELEPORT',
                description: 'Teleported to a safe location!'
            },
            'shield': {
                icon: '🛡️',
                title: 'SHIELD ACTIVATED',
                description: 'Invincible for 5 seconds!'
            },
            'ghost': {
                icon: '👻',
                title: 'GHOST MODE',
                description: 'Pass through yourself for 5 seconds!'
            },
            'magnet': {
                icon: '🧲',
                title: 'MAGNET POWER',
                description: 'Next 3 foods will be attracted to you!'
            },
            'freeze': {
                icon: '❄️',
                title: 'TIME FREEZE',
                description: 'Slowed down for 8 seconds!'
            },
            'rainbow': {
                icon: '🌈',
                title: 'RAINBOW BOOST',
                description: 'Double points for next 5 foods!'
            },
            'bomb': {
                icon: '💣',
                title: 'BOMB BLAST',
                description: 'Cleared surrounding snake segments!'
            },
            'mirror': {
                icon: '🪞',
                title: 'MIRROR SNAKE',
                description: 'Mirror snake will help collect food!'
            }
        };
        
        const data = powerUpData[type];
        if (data) {
            icon.textContent = data.icon;
            title.textContent = data.title;
            description.textContent = data.description;
            
            // Add type-specific styling
            notification.classList.add(`notification-${type}`);
        }
        
        // Show notification with animation
        notification.classList.add('show');
        
        // Hide after 2 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
    
    activatePowerUp(type, duration = 0, count = 0) {
        this.activePowerUps[type] = {
            startTime: Date.now(),
            duration: duration,
            count: count
        };
        
        // Apply immediate effects
        switch(type) {
            case 'shield':
                this.invincible = true;
                this.powerUpEffects.activateEffect('shield', duration);
                break;
            case 'ghost':
                this.canPassSelf = true;
                this.powerUpEffects.activateEffect('ghost', duration);
                break;
            case 'freeze':
                this.speedMultiplier = 0.5;
                this.updateGameSpeed();
                this.powerUpEffects.activateEffect('freeze', duration);
                break;
            case 'rainbow':
                this.pointsMultiplier = 2;
                this.powerUpEffects.activateEffect('rainbow', duration);
                break;
            case 'mirror':
                this.initializeMirrorSnake();
                break;
        }
        
        this.updatePowerUpDisplay();
    }
    
    deactivatePowerUp(type) {
        delete this.activePowerUps[type];
        
        switch(type) {
            case 'shield':
                this.invincible = false;
                this.powerUpEffects.deactivateEffect('shield');
                break;
            case 'ghost':
                this.canPassSelf = false;
                this.powerUpEffects.deactivateEffect('ghost');
                break;
            case 'freeze':
                this.speedMultiplier = 1.0;
                this.updateGameSpeed();
                this.powerUpEffects.deactivateEffect('freeze');
                break;
            case 'rainbow':
                this.pointsMultiplier = 1;
                this.powerUpEffects.deactivateEffect('rainbow');
                break;
            case 'mirror':
                this.mirrorSnake = [];
                break;
        }
        
        this.updatePowerUpDisplay();
    }
    
    updatePowerUps() {
        Object.keys(this.activePowerUps).forEach(type => {
            const powerUp = this.activePowerUps[type];
            
            if (powerUp.duration > 0) {
                const elapsed = Date.now() - powerUp.startTime;
                if (elapsed >= powerUp.duration) {
                    this.deactivatePowerUp(type);
                }
            }
        });
        
        // Update bonus food timer
        if (this.bonusFood) {
            const elapsed = Date.now() - this.bonusFood.spawnTime;
            this.bonusFood.timeRemaining = Math.max(0, 5 - elapsed / 1000);
        }
    }
    
    applyLightningEffect() {
        // Find safe position to teleport
        const safePositions = [];
        for (let x = 2; x < this.gridSize - 2; x++) {
            for (let y = 2; y < this.gridSize - 2; y++) {
                const pos = { x, y };
                if (!this.snake.some(s => s.x === x && s.y === y) &&
                    !(this.food.x === x && this.food.y === y)) {
                    safePositions.push(pos);
                }
            }
        }
        
        if (safePositions.length > 0) {
            const oldHead = this.snake[0];
            const newPos = safePositions[Math.floor(Math.random() * safePositions.length)];
            
            // Create teleport effect
            this.particleSystem.createTeleportEffect(
                oldHead.x * this.cellSize + this.cellSize / 2,
                oldHead.y * this.cellSize + this.cellSize / 2,
                newPos.x * this.cellSize + this.cellSize / 2,
                newPos.y * this.cellSize + this.cellSize / 2
            );
            
            // Move snake head
            this.snake[0] = newPos;
        }
    }
    
    applyBombEffect() {
        const head = this.snake[0];
        
        // Create explosion effect
        this.particleSystem.createExplosion(
            head.x * this.cellSize + this.cellSize / 2,
            head.y * this.cellSize + this.cellSize / 2
        );
        
        // Remove nearby segments
        const newBody = [this.snake[0]];
        for (let i = 1; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const distance = Math.abs(segment.x - head.x) + Math.abs(segment.y - head.y);
            if (distance > 2) {
                newBody.push(segment);
            }
        }
        
        this.snake = newBody;
    }
    
    initializeMirrorSnake() {
        const head = this.snake[0];
        this.mirrorSnake = [{
            x: this.gridSize - 1 - head.x,
            y: this.gridSize - 1 - head.y
        }];
    }
    
    updateMirrorSnake() {
        if (this.mirrorSnake.length === 0) return;
        
        // Move mirror snake in opposite direction
        const mirrorHead = { ...this.mirrorSnake[0] };
        mirrorHead.x -= this.direction.x;
        mirrorHead.y -= this.direction.y;
        
        // Wrap around edges
        mirrorHead.x = (mirrorHead.x + this.gridSize) % this.gridSize;
        mirrorHead.y = (mirrorHead.y + this.gridSize) % this.gridSize;
        
        this.mirrorSnake.unshift(mirrorHead);
        if (this.mirrorSnake.length > 5) {
            this.mirrorSnake.pop();
        }
        
        // Check if mirror snake collected food
        if (mirrorHead.x === this.food.x && mirrorHead.y === this.food.y) {
            const points = 10 * this.pointsMultiplier;
            this.score += points;
            this.food = this.generateFood();
            
            this.particleSystem.emit(
                mirrorHead.x * this.cellSize + this.cellSize / 2,
                mirrorHead.y * this.cellSize + this.cellSize / 2,
                'mirror', 10
            );
        }
    }
    
    updateGameSpeed() {
        this.gameSpeed = 100 / this.speedMultiplier;
        if (this.gameRunning && !this.gamePaused) {
            this.startGameLoop();
        }
    }
    
    startGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.bonusFood = null;
        this.mirrorSnake = [];
        this.score = 0;
        this.consecutiveFoods = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameSpeed = 100;
        
        // Reset power-ups
        this.activePowerUps = {};
        this.invincible = false;
        this.canPassSelf = false;
        this.speedMultiplier = 1.0;
        this.pointsMultiplier = 1.0;
        
        // Clear effects
        this.particleSystem.clear();
        Object.keys(this.powerUpEffects.activeEffects).forEach(effect => {
            this.powerUpEffects.deactivateEffect(effect);
        });
        
        this.updateUI();
        this.startGameLoop();
    }
    
    startGameLoop() {
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), this.gameSpeed);
    }
    
    pauseGame() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        if (this.gamePaused) {
            clearInterval(this.gameLoop);
        } else {
            this.startGameLoop();
        }
        
        this.draw();
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.pauseGame();
        }
    }
    
    resetGame() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        clearInterval(this.gameLoop);
        this.startGame();
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Update animations
        this.bonusFruitRenderer.update();
        this.particleSystem.update();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Check if bonus food expired
        if (this.bonusFood && this.bonusFood.timeRemaining <= 0) {
            this.bonusFood = null;
        }
        
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check collisions based on power-ups
        if (!this.invincible) {
            // Check wall collision
            if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) {
                this.gameOver();
                return;
            }
            
            // Check self collision
            if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                if (!this.canPassSelf) {
                    this.gameOver();
                    return;
                }
            }
        } else {
            // Wrap around walls when invincible
            head.x = (head.x + this.gridSize) % this.gridSize;
            head.y = (head.y + this.gridSize) % this.gridSize;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            const points = 10 * this.pointsMultiplier;
            this.score += points;
            this.consecutiveFoods++;
            
            // Create particle effect
            this.particleSystem.emit(
                this.food.x * this.cellSize + this.cellSize / 2,
                this.food.y * this.cellSize + this.cellSize / 2,
                'food', 10
            );
            
            // Check for bonus food spawn
            if (this.consecutiveFoods >= 5) {
                this.spawnBonusFood();
                this.consecutiveFoods = 0;
            }
            
            // Update count-based power-ups
            if (this.activePowerUps.magnet && this.activePowerUps.magnet.count > 0) {
                this.activePowerUps.magnet.count--;
                if (this.activePowerUps.magnet.count <= 0) {
                    this.deactivatePowerUp('magnet');
                }
            }
            if (this.activePowerUps.rainbow && this.activePowerUps.rainbow.count > 0) {
                this.activePowerUps.rainbow.count--;
                if (this.activePowerUps.rainbow.count <= 0) {
                    this.deactivatePowerUp('rainbow');
                }
            }
            
            this.food = this.generateFood();
            this.updateUI();
        } else {
            this.snake.pop();
        }
        
        // Check bonus food collision
        if (this.bonusFood && head.x === this.bonusFood.position.x && head.y === this.bonusFood.position.y) {
            this.consumeBonusFood();
        }
        
        // Update mirror snake
        if (this.activePowerUps.mirror) {
            this.updateMirrorSnake();
        }
        
        this.draw();
    }
    
    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateUI();
        }
        
        this.drawGameOver();
    }
    
    draw() {
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        
        // Draw power-up effects background
        this.powerUpEffects.drawEffects(this.snake[0], this.snake);
        
        // Draw entities
        this.drawFood();
        if (this.bonusFood) {
            this.bonusFruitRenderer.drawBonusFruit(
                this.bonusFood.position.x,
                this.bonusFood.position.y,
                this.bonusFood.type,
                this.bonusFood.timeRemaining
            );
        }
        
        // Draw mirror snake if active
        if (this.mirrorSnake.length > 0) {
            this.drawMirrorSnake();
        }
        
        // Draw main snake
        this.drawSnake();
        
        // Draw particles on top
        this.particleSystem.draw();
        
        if (this.gamePaused) {
            this.drawPause();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= this.gridSize; i++) {
            const pos = i * this.cellSize;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            
            if (index === 0) {
                // Head
                this.ctx.fillStyle = this.colors.snake_head;
                this.ctx.shadowColor = this.colors.snake_head;
                this.ctx.shadowBlur = 20;
            } else {
                // Body
                this.ctx.fillStyle = this.colors.snake_body;
                this.ctx.shadowColor = this.colors.snake_body;
                this.ctx.shadowBlur = 10;
            }
            
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    drawFood() {
        const x = this.food.x * this.cellSize;
        const y = this.food.y * this.cellSize;
        
        this.ctx.fillStyle = this.colors.food;
        this.ctx.shadowColor = this.colors.food;
        this.ctx.shadowBlur = 25;
        
        this.ctx.beginPath();
        this.ctx.arc(
            x + this.cellSize / 2, 
            y + this.cellSize / 2, 
            this.cellSize / 3, 
            0, 
            Math.PI * 2
        );
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
    }
    
    drawPause() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '30px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.accent;
        this.ctx.font = 'bold 40px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = this.colors.accent;
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.font = '20px Courier New';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press START to play again', this.canvas.width / 2, this.canvas.height / 2 + 30);
        
        this.ctx.shadowBlur = 0;
    }
    
    drawMirrorSnake() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        
        this.mirrorSnake.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            
            this.ctx.fillStyle = '#C0C0C0';
            this.ctx.shadowColor = '#C0C0C0';
            this.ctx.shadowBlur = 10;
            
            this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        });
        
        this.ctx.restore();
    }
    
    updateUI() {
        // Score display removed - will be added by learners
        // document.getElementById('score').textContent = this.score;
        // document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('combo').textContent = `${this.consecutiveFoods}/5`;
        this.updatePowerUpDisplay();
    }
    
    updatePowerUpDisplay() {
        const container = document.getElementById('powerUpStatus');
        container.innerHTML = '';
        
        Object.keys(this.activePowerUps).forEach(type => {
            const powerUp = this.activePowerUps[type];
            const indicator = document.createElement('div');
            indicator.className = 'power-up-indicator';
            indicator.classList.add(`power-up-${type}`);
            
            let text = '';
            let timeLeft = '';
            
            switch(type) {
                case 'shield':
                    text = '🛡️ Shield';
                    timeLeft = Math.ceil((powerUp.duration - (Date.now() - powerUp.startTime)) / 1000) + 's';
                    break;
                case 'ghost':
                    text = '👻 Ghost';
                    timeLeft = Math.ceil((powerUp.duration - (Date.now() - powerUp.startTime)) / 1000) + 's';
                    break;
                case 'freeze':
                    text = '❄️ Freeze';
                    timeLeft = Math.ceil((powerUp.duration - (Date.now() - powerUp.startTime)) / 1000) + 's';
                    break;
                case 'magnet':
                    text = '🧲 Magnet';
                    timeLeft = powerUp.count + ' left';
                    break;
                case 'rainbow':
                    text = '🌈 2x Points';
                    timeLeft = powerUp.count + ' left';
                    break;
                case 'mirror':
                    text = '🪞 Mirror';
                    timeLeft = Math.ceil((powerUp.duration - (Date.now() - powerUp.startTime)) / 1000) + 's';
                    break;
            }
            
            indicator.innerHTML = `<span class="power-up-name">${text}</span><span class="power-up-time">${timeLeft}</span>`;
            container.appendChild(indicator);
        });
    }
}

// Initialize game when page loads
let game;
window.addEventListener('load', () => {
    game = new SnakeGame();
});