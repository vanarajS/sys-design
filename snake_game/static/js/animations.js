class BonusFruitRenderer {
    constructor(ctx, cellSize) {
        this.ctx = ctx;
        this.cellSize = cellSize;
        this.animationTime = 0;
    }
    
    update() {
        this.animationTime += 0.05;
    }
    
    drawBonusFruit(x, y, type, timeRemaining) {
        const centerX = x * this.cellSize + this.cellSize / 2;
        const centerY = y * this.cellSize + this.cellSize / 2;
        
        // Pulsing effect based on time remaining
        const urgency = timeRemaining < 2 ? Math.sin(this.animationTime * 10) * 0.2 : 0;
        const scale = 1 + Math.sin(this.animationTime * 3) * 0.1 + urgency;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.scale(scale, scale);
        
        switch(type) {
            case 'lightning':
                this.drawLightning();
                break;
            case 'shield':
                this.drawShield();
                break;
            case 'ghost':
                this.drawGhost();
                break;
            case 'magnet':
                this.drawMagnet();
                break;
            case 'freeze':
                this.drawFreeze();
                break;
            case 'rainbow':
                this.drawRainbow();
                break;
            case 'bomb':
                this.drawBomb();
                break;
            case 'mirror':
                this.drawMirror();
                break;
        }
        
        this.ctx.restore();
        
        // Draw countdown timer
        if (timeRemaining < 3) {
            this.drawCountdown(centerX, centerY - this.cellSize * 0.7, timeRemaining);
        }
    }
    
    drawLightning() {
        // Lightning bolt
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 20;
        
        this.ctx.beginPath();
        this.ctx.moveTo(-10, -15);
        this.ctx.lineTo(-3, -2);
        this.ctx.lineTo(3, -5);
        this.ctx.lineTo(-2, 5);
        this.ctx.lineTo(5, 3);
        this.ctx.lineTo(10, 15);
        this.ctx.stroke();
        
        // Electric sparks
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i + this.animationTime;
            const sparkX = Math.cos(angle) * 15;
            const sparkY = Math.sin(angle) * 15;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(sparkX, sparkY);
            this.ctx.stroke();
        }
    }
    
    drawShield() {
        // Shield shape
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.strokeStyle = '#4682B4';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#87CEEB';
        this.ctx.shadowBlur = 25;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -15);
        this.ctx.quadraticCurveTo(-15, -10, -15, 0);
        this.ctx.quadraticCurveTo(-15, 10, 0, 15);
        this.ctx.quadraticCurveTo(15, 10, 15, 0);
        this.ctx.quadraticCurveTo(15, -10, 0, -15);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Inner glow
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 15);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(135, 206, 235, 0.2)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    drawGhost() {
        // Ghost shape
        this.ctx.fillStyle = 'rgba(248, 248, 255, 0.8)';
        this.ctx.shadowColor = '#F8F8FF';
        this.ctx.shadowBlur = 30;
        
        // Body
        this.ctx.beginPath();
        this.ctx.arc(0, -5, 12, Math.PI, 0, false);
        this.ctx.lineTo(12, 10);
        
        // Wavy bottom
        const waves = 4;
        for (let i = 0; i < waves; i++) {
            const x = 12 - (i + 1) * (24 / waves);
            const y = 10 + Math.sin(this.animationTime * 5 + i) * 3;
            this.ctx.lineTo(x, y);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Eyes
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-5, -5, 2, 0, Math.PI * 2);
        this.ctx.arc(5, -5, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMagnet() {
        // Horseshoe magnet
        this.ctx.strokeStyle = '#DC143C';
        this.ctx.lineWidth = 6;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#DC143C';
        this.ctx.shadowBlur = 20;
        
        // Red side
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, Math.PI * 0.7, Math.PI * 1.5, false);
        this.ctx.stroke();
        
        // Blue side
        this.ctx.strokeStyle = '#4169E1';
        this.ctx.shadowColor = '#4169E1';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, Math.PI * 1.5, Math.PI * 2.3, false);
        this.ctx.stroke();
        
        // Magnetic field lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([2, 3]);
        
        for (let i = 0; i < 3; i++) {
            const radius = 15 + i * 5;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawFreeze() {
        // Ice crystal
        this.ctx.strokeStyle = '#00CED1';
        this.ctx.fillStyle = 'rgba(0, 206, 209, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#00CED1';
        this.ctx.shadowBlur = 25;
        
        // Rotate slowly
        this.ctx.rotate(this.animationTime * 0.5);
        
        // Draw 6-pointed snowflake
        for (let i = 0; i < 6; i++) {
            this.ctx.save();
            this.ctx.rotate((Math.PI / 3) * i);
            
            // Main branch
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, -15);
            this.ctx.stroke();
            
            // Side branches
            this.ctx.beginPath();
            this.ctx.moveTo(0, -5);
            this.ctx.lineTo(-4, -8);
            this.ctx.moveTo(0, -5);
            this.ctx.lineTo(4, -8);
            this.ctx.moveTo(0, -10);
            this.ctx.lineTo(-3, -12);
            this.ctx.moveTo(0, -10);
            this.ctx.lineTo(3, -12);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
        
        // Center
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRainbow() {
        // Rainbow arc
        const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
        const radius = 15;
        
        this.ctx.shadowBlur = 30;
        
        colors.forEach((color, i) => {
            this.ctx.strokeStyle = color;
            this.ctx.shadowColor = color;
            this.ctx.lineWidth = 3;
            
            this.ctx.beginPath();
            this.ctx.arc(0, 5, radius - i * 2, Math.PI * 1.2, Math.PI * 1.8, true);
            this.ctx.stroke();
        });
        
        // Sparkles
        this.ctx.fillStyle = '#FFF';
        for (let i = 0; i < 5; i++) {
            const angle = this.animationTime * 2 + i;
            const x = Math.cos(angle) * 20;
            const y = Math.sin(angle) * 20;
            const size = Math.sin(this.animationTime * 5 + i) * 1 + 1.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawBomb() {
        // Bomb body
        this.ctx.fillStyle = '#2F4F4F';
        this.ctx.shadowColor = '#FF4500';
        this.ctx.shadowBlur = 25;
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fuse
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(8, -8);
        this.ctx.quadraticCurveTo(12, -12, 15, -10);
        this.ctx.stroke();
        
        // Spark
        const sparkSize = 3 + Math.sin(this.animationTime * 10) * 2;
        this.ctx.fillStyle = '#FF4500';
        this.ctx.shadowColor = '#FF4500';
        this.ctx.shadowBlur = sparkSize * 5;
        
        this.ctx.beginPath();
        this.ctx.arc(15, -10, sparkSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Danger symbol
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('!', 0, 0);
    }
    
    drawMirror() {
        // Mirror frame
        this.ctx.strokeStyle = '#C0C0C0';
        this.ctx.fillStyle = 'rgba(192, 192, 192, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#C0C0C0';
        this.ctx.shadowBlur = 20;
        
        // Oval mirror
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 10, 15, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.fill();
        
        // Reflection gradient
        const gradient = this.ctx.createLinearGradient(-10, -15, 10, 15);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Shimmer effect
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        
        const shimmerX = Math.sin(this.animationTime * 3) * 8;
        this.ctx.beginPath();
        this.ctx.moveTo(shimmerX - 2, -12);
        this.ctx.lineTo(shimmerX + 2, 12);
        this.ctx.stroke();
    }
    
    drawCountdown(x, y, time) {
        this.ctx.save();
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 10;
        
        this.ctx.fillText(Math.ceil(time).toString(), x, y);
        this.ctx.restore();
    }
}

class PowerUpEffects {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
        this.activeEffects = {};
    }
    
    activateEffect(type, duration = 0) {
        this.activeEffects[type] = {
            startTime: Date.now(),
            duration: duration
        };
    }
    
    deactivateEffect(type) {
        delete this.activeEffects[type];
    }
    
    drawEffects(snakeHead, snakeBody) {
        Object.keys(this.activeEffects).forEach(type => {
            const effect = this.activeEffects[type];
            const elapsed = Date.now() - effect.startTime;
            
            if (effect.duration > 0 && elapsed > effect.duration) {
                this.deactivateEffect(type);
                return;
            }
            
            switch(type) {
                case 'shield':
                    this.drawShieldBubble(snakeHead);
                    break;
                case 'ghost':
                    this.drawGhostEffect(snakeBody);
                    break;
                case 'freeze':
                    this.drawFreezeOverlay();
                    break;
                case 'rainbow':
                    this.drawRainbowTrail(snakeBody);
                    break;
            }
        });
    }
    
    drawShieldBubble(head) {
        const x = head.x * 30 + 15; // Assuming cellSize = 30
        const y = head.y * 30 + 15;
        
        this.ctx.save();
        this.ctx.strokeStyle = '#87CEEB';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#87CEEB';
        this.ctx.shadowBlur = 20;
        
        // Animated bubble
        const time = Date.now() / 1000;
        const radius = 25 + Math.sin(time * 3) * 3;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Inner shimmer
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y - 5, radius * 0.7, Math.PI * 1.5, Math.PI * 0.5);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawGhostEffect(body) {
        // Make snake semi-transparent
        this.ctx.globalAlpha = 0.4;
    }
    
    drawFreezeOverlay() {
        // Blue tint overlay
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 206, 209, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Frost vignette
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, 'rgba(0, 206, 209, 0)');
        gradient.addColorStop(1, 'rgba(0, 206, 209, 0.3)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
    
    drawRainbowTrail(body) {
        if (body.length < 2) return;
        
        this.ctx.save();
        this.ctx.lineCap = 'round';
        this.ctx.lineWidth = 20;
        
        const time = Date.now() / 100;
        
        for (let i = 1; i < Math.min(body.length, 10); i++) {
            const segment = body[i];
            const prevSegment = body[i - 1];
            
            const hue = (time * 30 + i * 30) % 360;
            const opacity = 1 - (i / 10);
            
            this.ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity * 0.5})`;
            this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.moveTo(prevSegment.x * 30 + 15, prevSegment.y * 30 + 15);
            this.ctx.lineTo(segment.x * 30 + 15, segment.y * 30 + 15);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
}