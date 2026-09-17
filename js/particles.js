/**
 * Particle, Floating Text & Screen Shake Engine
 */
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
        this.shakeTrauma = 0;
    }

    triggerShake(intensity = 6) {
        this.shakeTrauma = Math.min(15, this.shakeTrauma + intensity);
    }

    emit(x, y, count = 12, color = '#00FF87', speed = 3) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
            const velocity = speed * (0.6 + Math.random() * 0.8);
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 3.5 + 2,
                color,
                alpha: 1.0,
                decay: Math.random() * 0.025 + 0.02
            });
        }
    }

    emitGoldExplosion(x, y) {
        this.triggerShake(5);
        const colors = ['#FFD700', '#FFA500', '#FFF8DC', '#00FF87'];
        for (let i = 0; i < 24; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = (Math.random() * 4 + 2);
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 4 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: Math.random() * 0.02 + 0.015
            });
        }
    }

    emitFrost(x, y) {
        const colors = ['#00E5FF', '#80D8FF', '#E1F5FE', '#FFFFFF'];
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 3 + 1;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 3.5 + 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    emitMagnet(x, y) {
        const colors = ['#FF007F', '#E040FB', '#EA80FC', '#FFFFFF'];
        for (let i = 0; i < 16; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 3.5 + 1;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                size: Math.random() * 3.5 + 1.5,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1.0,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    addFloatingText(x, y, text, color = '#00FF87') {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            alpha: 1.0,
            vy: -1.2,
            life: 0
        });
    }

    update() {
        // Screen shake decay
        if (this.shakeTrauma > 0) {
            this.shakeTrauma = Math.max(0, this.shakeTrauma * 0.88 - 0.1);
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Update floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const ft = this.floatingTexts[i];
            ft.y += ft.vy;
            ft.life += 1;
            if (ft.life > 20) {
                ft.alpha -= 0.04;
            }
            if (ft.alpha <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    applyScreenShake(ctx) {
        if (this.shakeTrauma > 0.2) {
            const offsetX = (Math.random() - 0.5) * this.shakeTrauma;
            const offsetY = (Math.random() - 0.5) * this.shakeTrauma;
            ctx.translate(offsetX, offsetY);
        }
    }

    draw(ctx) {
        ctx.save();
        // Draw particles
        for (const p of this.particles) {
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw floating text
        for (const ft of this.floatingTexts) {
            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.font = 'bold 15px "Orbitron", sans-serif';
            ctx.fillStyle = ft.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = ft.color;
            ctx.textAlign = 'center';
            ctx.fillText(ft.text, ft.x, ft.y);
        }
        ctx.restore();
    }

    clear() {
        this.particles = [];
        this.floatingTexts = [];
        this.shakeTrauma = 0;
    }
}
