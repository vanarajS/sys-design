class Particle {
    constructor(x, y, type, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.type = type;
        this.life = 1.0;
        this.decay = 0.02;
        
        // Set particle properties based on type
        switch(type) {
            case 'lightning':
                this.vx = (Math.random() - 0.5) * 8;
                this.vy = (Math.random() - 0.5) * 8;
                this.color = '#FFD700';
                this.size = Math.random() * 3 + 2;
                this.sparkle = true;
                break;
            
            case 'shield':
                this.angle = Math.random() * Math.PI * 2;
                this.radius = 30 + Math.random() * 10;
                this.color = '#87CEEB';
                this.size = 2;
                this.orbit = true;
                break;
            
            case 'ghost':
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = -Math.random() * 2;
                this.color = '#F8F8FF';
                this.size = Math.random() * 4 + 1;
                this.fade = true;
                break;
            
            case 'magnet':
                this.angle = Math.random() * Math.PI * 2;
                this.distance = 0;
                this.color = Math.random() > 0.5 ? '#DC143C' : '#4169E1';
                this.size = 1.5;
                this.magnetic = true;
                break;
            
            case 'freeze':
                this.vx = (Math.random() - 0.5) * 1;
                this.vy = Math.random() * 2 + 1;
                this.color = '#00CED1';
                this.size = Math.random() * 3 + 1;
                this.rotation = Math.random() * Math.PI * 2;
                break;
            
            case 'rainbow':
                this.vx = (Math.random() - 0.5) * 3;
                this.vy = (Math.random() - 0.5) * 3;
                this.hue = Math.random() * 360;
                this.size = Math.random() * 4 + 2;
                this.trail = true;
                break;
            
            case 'bomb':
                this.vx = (Math.random() - 0.5) * 10;
                this.vy = (Math.random() - 0.5) * 10;
                this.color = '#FF4500';
                this.size = Math.random() * 5 + 3;
                this.shockwave = true;
                break;
            
            case 'mirror':
                this.vx = 0;
                this.vy = 0;
                this.color = '#C0C0C0';
                this.size = 2;
                this.reflection = true;
                this.opacity = 0.6;
                break;
            
            default:
                this.vx = (Math.random() - 0.5) * 4;
                this.vy = (Math.random() - 0.5) * 4;
                this.color = '#FFFFFF';
                this.size = 2;
        }
    }
    
    update() {
        this.life -= this.decay;
        
        if (this.orbit) {
            // Shield particles orbit
            this.angle += 0.05;
            this.x += Math.cos(this.angle) * 0.5;
            this.y += Math.sin(this.angle) * 0.5;
        } else if (this.magnetic) {
            // Magnet particles create field lines
            this.distance += 2;
            this.x += Math.cos(this.angle) * 2;
            this.y += Math.sin(this.angle) * 2;
            this.size = Math.max(0.5, this.size - 0.02);
        } else if (this.shockwave) {
            // Bomb particles explode outward
            this.vx *= 0.95;
            this.vy *= 0.95;
            this.x += this.vx;
            this.y += this.vy;
            this.size += 0.5;
        } else {
            // Normal particle movement
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.type === 'freeze') {
                this.rotation += 0.1;
            }
        }
        
        if (this.trail) {
            this.hue = (this.hue + 5) % 360;
        }
    }
    
    draw() {
        const alpha = Math.max(0, this.life);
        
        if (this.trail) {
            // Rainbow trail effect
            this.ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${alpha})`;
            this.ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
            this.ctx.shadowBlur = 10;
        } else if (this.reflection) {
            // Mirror reflection effect
            this.ctx.fillStyle = `rgba(192, 192, 192, ${alpha * this.opacity})`;
            this.ctx.shadowColor = this.color;
            this.ctx.shadowBlur = 5;
        } else {
            this.ctx.fillStyle = this.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.shadowColor = this.color;
            this.ctx.shadowBlur = this.sparkle ? 15 : 5;
        }
        
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        
        if (this.type === 'freeze') {
            // Snowflake shape
            this.ctx.rotate(this.rotation);
            this.drawSnowflake();
        } else if (this.shockwave) {
            // Explosion ring
            this.ctx.strokeStyle = this.ctx.fillStyle;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            this.ctx.stroke();
        } else {
            // Default circle
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        this.ctx.shadowBlur = 0;
    }
    
    drawSnowflake() {
        const branches = 6;
        const length = this.size * 2;
        
        this.ctx.strokeStyle = this.ctx.fillStyle;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < branches; i++) {
            this.ctx.save();
            this.ctx.rotate((Math.PI * 2 / branches) * i);
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, -length);
            this.ctx.stroke();
            
            // Branch details
            this.ctx.beginPath();
            this.ctx.moveTo(0, -length * 0.3);
            this.ctx.lineTo(-length * 0.2, -length * 0.5);
            this.ctx.moveTo(0, -length * 0.3);
            this.ctx.lineTo(length * 0.2, -length * 0.5);
            this.ctx.stroke();
            
            this.ctx.restore();
        }
    }
    
    isDead() {
        return this.life <= 0 || this.distance > 100;
    }
}

class ParticleSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
    }
    
    emit(x, y, type, count = 10) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, type, this.ctx));
        }
    }
    
    createTeleportEffect(x1, y1, x2, y2) {
        // Create particles at start position
        this.emit(x1, y1, 'lightning', 20);
        
        // Create particles at end position
        setTimeout(() => {
            this.emit(x2, y2, 'lightning', 20);
        }, 100);
        
        // Create trail between positions
        const steps = 10;
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = x1 + (x2 - x1) * t;
            const y = y1 + (y2 - y1) * t;
            setTimeout(() => {
                this.emit(x, y, 'lightning', 3);
            }, i * 20);
        }
    }
    
    createShieldBubble(x, y, radius = 30) {
        const points = 12;
        for (let i = 0; i < points; i++) {
            const angle = (Math.PI * 2 / points) * i;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.particles.push(new Particle(px, py, 'shield', this.ctx));
        }
    }
    
    createExplosion(x, y) {
        this.emit(x, y, 'bomb', 30);
        
        // Screen shake effect
        const originalTransform = this.ctx.getTransform();
        let shakeIntensity = 10;
        const shakeDecay = 0.9;
        
        const shake = () => {
            if (shakeIntensity > 0.1) {
                const offsetX = (Math.random() - 0.5) * shakeIntensity;
                const offsetY = (Math.random() - 0.5) * shakeIntensity;
                this.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                shakeIntensity *= shakeDecay;
                requestAnimationFrame(shake);
            } else {
                this.canvas.style.transform = '';
            }
        };
        shake();
    }
    
    createMagnetField(x, y) {
        const angles = 8;
        for (let i = 0; i < angles; i++) {
            const angle = (Math.PI * 2 / angles) * i;
            const particle = new Particle(x, y, 'magnet', this.ctx);
            particle.angle = angle;
            this.particles.push(particle);
        }
    }
    
    createRainbowTrail(x, y) {
        this.emit(x, y, 'rainbow', 5);
    }
    
    createFrostEffect(edges = true) {
        if (edges) {
            // Create frost particles at screen edges
            const spacing = 50;
            
            // Top edge
            for (let x = 0; x < this.canvas.width; x += spacing) {
                this.particles.push(new Particle(x, 10, 'freeze', this.ctx));
            }
            
            // Bottom edge
            for (let x = 0; x < this.canvas.width; x += spacing) {
                this.particles.push(new Particle(x, this.canvas.height - 10, 'freeze', this.ctx));
            }
            
            // Left edge
            for (let y = 0; y < this.canvas.height; y += spacing) {
                this.particles.push(new Particle(10, y, 'freeze', this.ctx));
            }
            
            // Right edge
            for (let y = 0; y < this.canvas.height; y += spacing) {
                this.particles.push(new Particle(this.canvas.width - 10, y, 'freeze', this.ctx));
            }
        }
    }
    
    update() {
        // Update all particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw() {
        this.particles.forEach(particle => {
            particle.draw();
        });
    }
    
    clear() {
        this.particles = [];
    }
}