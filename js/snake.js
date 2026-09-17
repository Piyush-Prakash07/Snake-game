/**
 * Snake Model with Custom Skins, Turn Locking & Dynamic Eye Animations
 */
const SKINS = {
    emerald: {
        id: 'emerald',
        name: 'Cyber Emerald',
        head: '#00FF87',
        bodyGrad1: '#00E676',
        bodyGrad2: '#00B050',
        glow: 'rgba(0, 255, 135, 0.6)',
        eyeColor: '#FFFFFF',
        pupilColor: '#001A0E'
    },
    cyan: {
        id: 'cyan',
        name: 'Electric Cyan',
        head: '#00E5FF',
        bodyGrad1: '#00B0FF',
        bodyGrad2: '#0070FF',
        glow: 'rgba(0, 229, 255, 0.6)',
        eyeColor: '#FFFFFF',
        pupilColor: '#001A26'
    },
    vaporwave: {
        id: 'vaporwave',
        name: 'Vaporwave Pink',
        head: '#FF007F',
        bodyGrad1: '#D600FF',
        bodyGrad2: '#8A2BE2',
        glow: 'rgba(255, 0, 127, 0.6)',
        eyeColor: '#FFE4E1',
        pupilColor: '#2B0017'
    },
    gold: {
        id: 'gold',
        name: 'Golden Dragon',
        head: '#FFE066',
        bodyGrad1: '#FFB800',
        bodyGrad2: '#FF8800',
        glow: 'rgba(255, 215, 0, 0.7)',
        eyeColor: '#FFF8DC',
        pupilColor: '#3A2000'
    },
    chroma: {
        id: 'chroma',
        name: 'Rainbow Chroma',
        head: '#FFFFFF',
        isChroma: true,
        glow: 'rgba(255, 255, 255, 0.6)',
        eyeColor: '#FFFFFF',
        pupilColor: '#000000'
    }
};

class Snake {
    constructor(gridSize, tileCount) {
        this.gridSize = gridSize;
        this.tileCount = tileCount;
        this.currentSkin = SKINS.emerald;
        this.reset();
    }

    reset() {
        const startX = Math.floor(this.tileCount / 2);
        const startY = Math.floor(this.tileCount / 2);

        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];

        this.dx = 1;
        this.dy = 0;
        this.nextDx = 1;
        this.nextDy = 0;
        this.canTurn = true;
    }

    setSkin(skinId) {
        if (SKINS[skinId]) {
            this.currentSkin = SKINS[skinId];
        }
    }

    setDirection(dx, dy) {
        if (!this.canTurn) return;
        // Prevent 180-degree immediate reversal
        if ((dx !== 0 && dx === -this.dx) || (dy !== 0 && dy === -this.dy)) {
            return;
        }
        this.nextDx = dx;
        this.nextDy = dy;
        this.canTurn = false;
    }

    move(wrapAround = false) {
        this.dx = this.nextDx;
        this.dy = this.nextDy;
        this.canTurn = true;

        const head = { ...this.body[0] };
        head.x += this.dx;
        head.y += this.dy;

        if (wrapAround) {
            if (head.x < 0) head.x = this.tileCount - 1;
            else if (head.x >= this.tileCount) head.x = 0;
            if (head.y < 0) head.y = this.tileCount - 1;
            else if (head.y >= this.tileCount) head.y = 0;
        }

        this.body.unshift(head);
        return head;
    }

    popTail() {
        return this.body.pop();
    }

    checkSelfCollision() {
        const head = this.body[0];
        for (let i = 1; i < this.body.length; i++) {
            if (this.body[i].x === head.x && this.body[i].y === head.y) {
                return true;
            }
        }
        return false;
    }

    checkWallCollision() {
        const head = this.body[0];
        return head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount;
    }

    draw(ctx, timestamp = 0) {
        const size = this.gridSize;
        const skin = this.currentSkin;

        ctx.save();

        // Draw body segments
        for (let i = this.body.length - 1; i >= 0; i--) {
            const seg = this.body[i];
            const px = seg.x * size;
            const py = seg.y * size;
            const radius = i === 0 ? size * 0.4 : size * 0.35;

            ctx.beginPath();
            ctx.roundRect(px + 1, py + 1, size - 2, size - 2, radius);

            if (i === 0) {
                // Head
                ctx.fillStyle = skin.head;
                ctx.shadowColor = skin.glow;
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Body
                if (skin.isChroma) {
                    const hue = (timestamp * 0.1 + i * 15) % 360;
                    ctx.fillStyle = `hsl(${hue}, 90%, 55%)`;
                } else {
                    ctx.fillStyle = i % 2 === 0 ? skin.bodyGrad1 : skin.bodyGrad2;
                }
                ctx.fill();
            }
        }

        // Draw Eyes on Head
        this._drawEyes(ctx, this.body[0], size, skin);

        ctx.restore();
    }

    _drawEyes(ctx, head, size, skin) {
        const hx = head.x * size + size / 2;
        const hy = head.y * size + size / 2;

        let eye1X, eye1Y, eye2X, eye2Y;
        let pupOffsetX = this.dx * 1.5;
        let pupOffsetY = this.dy * 1.5;

        const offset = size * 0.24;
        const forwardOffset = size * 0.22;

        if (this.dx === 1) {
            // Moving Right
            eye1X = hx + forwardOffset; eye1Y = hy - offset;
            eye2X = hx + forwardOffset; eye2Y = hy + offset;
        } else if (this.dx === -1) {
            // Moving Left
            eye1X = hx - forwardOffset; eye1Y = hy - offset;
            eye2X = hx - forwardOffset; eye2Y = hy + offset;
        } else if (this.dy === -1) {
            // Moving Up
            eye1X = hx - offset; eye1Y = hy - forwardOffset;
            eye2X = hx + offset; eye2Y = hy - forwardOffset;
        } else {
            // Moving Down
            eye1X = hx - offset; eye1Y = hy + forwardOffset;
            eye2X = hx + offset; eye2Y = hy + forwardOffset;
        }

        const eyeRadius = size * 0.13;
        const pupRadius = size * 0.07;

        // Eye whites
        ctx.fillStyle = skin.eyeColor;
        ctx.beginPath();
        ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = skin.pupilColor;
        ctx.beginPath();
        ctx.arc(eye1X + pupOffsetX, eye1Y + pupOffsetY, pupRadius, 0, Math.PI * 2);
        ctx.arc(eye2X + pupOffsetX, eye2Y + pupOffsetY, pupRadius, 0, Math.PI * 2);
        ctx.fill();
    }
}
