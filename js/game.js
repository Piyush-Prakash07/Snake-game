/**
 * Main Game Controller, Power-Up Manager & Achievement Tracker
 */
const DIFFICULTIES = {
    easy: { baseSpeed: 130, minSpeed: 75, ramp: 3, name: 'Easy' },
    normal: { baseSpeed: 100, minSpeed: 55, ramp: 4, name: 'Normal' },
    hard: { baseSpeed: 75, minSpeed: 40, ramp: 5, name: 'Hard' },
    insane: { baseSpeed: 55, minSpeed: 30, ramp: 6, name: 'Insane' }
};

const POWERUP_TYPES = [
    { type: 'gold', name: 'Golden Apple', color: '#FFD700', icon: '⭐', duration: 6000 },
    { type: 'freeze', name: 'Slow-Mo Frost', color: '#00E5FF', icon: '❄️', duration: 6000 },
    { type: 'magnet', name: 'Food Magnet', color: '#FF007F', icon: '🧲', duration: 6000 }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.tileCount = 25;
        this.gridSize = this.canvas.width / this.tileCount;

        this.snake = new Snake(this.gridSize, this.tileCount);
        this.particles = new ParticleSystem();

        // Game Config & Preferences
        this.difficulty = localStorage.getItem('snake_difficulty') || 'normal';
        this.gameMode = localStorage.getItem('snake_mode') || 'classic'; // 'classic' or 'wrap'
        this.skinId = localStorage.getItem('snake_skin') || 'emerald';
        this.snake.setSkin(this.skinId);

        // State & Scores
        this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAME_OVER'
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake_high_score') || '0', 10);
        this.foodsEaten = 0;
        this.goldEaten = 0;
        this.gameStartTime = 0;
        this.totalGameTime = 0;

        // Active Power-Up Effects
        this.activePowerUp = null; // { type: 'freeze'|'magnet', expiresAt: number }

        // Food Entities
        this.food = { x: 5, y: 5 };
        this.specialItem = {
            active: false,
            type: 'gold',
            x: -1,
            y: -1,
            spawnTime: 0,
            duration: 6000
        };

        // Loop Timing
        this.lastFrameTime = 0;
        this.lastMoveTime = 0;

        // UI Element References
        this.bonusProgressEl = document.getElementById('bonusProgressBar');
        this.bonusTimerContainer = document.getElementById('bonusTimerContainer');
        this.powerUpBadge = document.getElementById('powerUpBadge');

        this._initDPI();
        this._bindEvents();
        this._loadUI();
        this.spawnFood();

        // Start render loop
        this.renderLoop = this.renderLoop.bind(this);
        requestAnimationFrame(this.renderLoop);
    }

    _initDPI() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = 600 * dpr;
        this.canvas.height = 600 * dpr;
        this.ctx.scale(dpr, dpr);
        this.gridSize = 600 / this.tileCount;
        this.snake.gridSize = this.gridSize;
    }

    _loadUI() {
        document.getElementById('highScoreVal').textContent = this.highScore;
        document.getElementById('scoreVal').textContent = '0';
        document.getElementById('speedVal').textContent = 'Lv. 1';

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.diff === this.difficulty);
        });
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === this.gameMode);
        });
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.skin === this.skinId);
        });

        const isMuted = localStorage.getItem('snake_muted') === 'true';
        soundEngine.setMuted(isMuted);
        this._updateMuteUI(isMuted);

        const musicEnabled = localStorage.getItem('snake_music') === 'true';
        if (musicEnabled) {
            soundEngine.toggleMusic();
            this._updateMusicUI(true);
        }
    }

    _updateMuteUI(muted) {
        const soundIcon = document.getElementById('soundIcon');
        if (soundIcon) soundIcon.textContent = muted ? '🔇' : '🔊';
    }

    _updateMusicUI(enabled) {
        const musicIcon = document.getElementById('musicIcon');
        if (musicIcon) musicIcon.textContent = enabled ? '🎵' : '🎶';
    }

    spawnFood() {
        const occupied = new Set();
        this.snake.body.forEach(seg => occupied.add(`${seg.x},${seg.y}`));
        if (this.specialItem.active) {
            occupied.add(`${this.specialItem.x},${this.specialItem.y}`);
        }

        const available = [];
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                if (!occupied.has(`${x},${y}`)) {
                    available.push({ x, y });
                }
            }
        }

        if (available.length > 0) {
            this.food = available[Math.floor(Math.random() * available.length)];
        }
    }

    spawnSpecialItem() {
        const occupied = new Set();
        this.snake.body.forEach(seg => occupied.add(`${seg.x},${seg.y}`));
        occupied.add(`${this.food.x},${this.food.y}`);

        const available = [];
        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                if (!occupied.has(`${x},${y}`)) {
                    available.push({ x, y });
                }
            }
        }

        if (available.length > 0) {
            const chosen = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
            const pos = available[Math.floor(Math.random() * available.length)];

            this.specialItem.type = chosen.type;
            this.specialItem.x = pos.x;
            this.specialItem.y = pos.y;
            this.specialItem.active = true;
            this.specialItem.spawnTime = performance.now();
            this.specialItem.duration = chosen.duration;

            if (this.bonusProgressEl) {
                this.bonusProgressEl.style.background = chosen.color;
                this.bonusProgressEl.style.boxShadow = `0 0 10px ${chosen.color}`;
            }
            this.bonusTimerContainer.classList.add('visible');
        }
    }

    hideSpecialItem() {
        this.specialItem.active = false;
        this.bonusTimerContainer.classList.remove('visible');
        if (this.bonusProgressEl) {
            this.bonusProgressEl.style.width = '0%';
        }
    }

    applyPowerUp(type) {
        const now = performance.now();
        this.activePowerUp = {
            type,
            expiresAt: now + 6000
        };

        if (this.powerUpBadge) {
            const pInfo = POWERUP_TYPES.find(p => p.type === type);
            this.powerUpBadge.textContent = `${pInfo.icon} ${pInfo.name}`;
            this.powerUpBadge.style.color = pInfo.color;
            this.powerUpBadge.style.borderColor = pInfo.color;
            this.powerUpBadge.classList.add('visible');
        }
    }

    clearActivePowerUp() {
        this.activePowerUp = null;
        if (this.powerUpBadge) {
            this.powerUpBadge.classList.remove('visible');
        }
    }

    getCurrentSpeedDelay() {
        const diff = DIFFICULTIES[this.difficulty] || DIFFICULTIES.normal;
        const level = Math.floor(this.score / diff.ramp);
        let baseDelay = Math.max(diff.minSpeed, diff.baseSpeed - level * 4.5);

        // ❄️ Frost Slow-Mo effect: increases delay by 50%
        if (this.activePowerUp && this.activePowerUp.type === 'freeze') {
            baseDelay *= 1.5;
        }

        return baseDelay;
    }

    getCurrentLevel() {
        const diff = DIFFICULTIES[this.difficulty] || DIFFICULTIES.normal;
        return Math.floor(this.score / diff.ramp) + 1;
    }

    startGame() {
        this.score = 0;
        this.foodsEaten = 0;
        this.goldEaten = 0;
        this.gameStartTime = performance.now();
        this.snake.reset();
        this.particles.clear();
        this.hideSpecialItem();
        this.clearActivePowerUp();
        this.spawnFood();

        this.state = 'PLAYING';
        document.getElementById('startOverlay').classList.add('hidden');
        document.getElementById('pauseOverlay').classList.add('hidden');
        document.getElementById('gameOverOverlay').classList.add('hidden');

        document.getElementById('scoreVal').textContent = '0';
        document.getElementById('speedVal').textContent = 'Lv. 1';

        soundEngine.playClick();
    }

    togglePause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pauseOverlay').classList.remove('hidden');
            soundEngine.playClick();
        } else if (this.state === 'PAUSED') {
            this.state = 'PLAYING';
            document.getElementById('pauseOverlay').classList.add('hidden');
            soundEngine.playClick();
        }
    }

    gameOver() {
        this.state = 'GAME_OVER';
        this.totalGameTime = ((performance.now() - this.gameStartTime) / 1000).toFixed(1);
        this.hideSpecialItem();
        this.clearActivePowerUp();
        this.particles.triggerShake(12);

        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('snake_high_score', this.highScore.toString());
            document.getElementById('highScoreVal').textContent = this.highScore;
            soundEngine.playNewHighScore();
            this.particles.emitGoldExplosion(300, 300);
        } else {
            soundEngine.playGameOver();
        }

        document.getElementById('finalScoreVal').textContent = this.score;
        document.getElementById('finalTimeVal').textContent = `${this.totalGameTime}s`;
        document.getElementById('finalFoodVal').textContent = this.foodsEaten;

        const recordBadge = document.getElementById('newRecordBadge');
        if (recordBadge) {
            recordBadge.classList.toggle('visible', isNewRecord);
        }

        document.getElementById('gameOverOverlay').classList.remove('hidden');
    }

    updatePhysics(timestamp) {
        if (this.state !== 'PLAYING') return;

        // Check active power-up expiration
        if (this.activePowerUp && timestamp >= this.activePowerUp.expiresAt) {
            this.clearActivePowerUp();
        }

        const delay = this.getCurrentSpeedDelay();
        if (timestamp - this.lastMoveTime < delay) return;
        this.lastMoveTime = timestamp;

        // 🧲 Magnet Power-Up: Sucks food 1 tile closer towards snake head
        if (this.activePowerUp && this.activePowerUp.type === 'magnet') {
            const head = this.snake.body[0];
            const dx = Math.sign(head.x - this.food.x);
            const dy = Math.sign(head.y - this.food.y);
            if (dx !== 0 && Math.random() > 0.3) this.food.x += dx;
            else if (dy !== 0 && Math.random() > 0.3) this.food.y += dy;
            this.particles.emitMagnet((this.food.x + 0.5) * this.gridSize, (this.food.y + 0.5) * this.gridSize);
        }

        const isWrap = this.gameMode === 'wrap';
        const head = this.snake.move(isWrap);

        // Check Wall Collision in Classic Mode
        if (!isWrap && this.snake.checkWallCollision()) {
            this.particles.emit(head.x * this.gridSize, head.y * this.gridSize, 20, '#FF4C4C', 5);
            this.gameOver();
            return;
        }

        // Check Self Collision
        if (this.snake.checkSelfCollision()) {
            this.particles.emit(head.x * this.gridSize, head.y * this.gridSize, 20, '#FF4C4C', 5);
            this.gameOver();
            return;
        }

        const hx = head.x;
        const hy = head.y;

        // Normal Food Collision
        if (hx === this.food.x && hy === this.food.y) {
            this.score += 1;
            this.foodsEaten += 1;
            document.getElementById('scoreVal').textContent = this.score;
            document.getElementById('speedVal').textContent = `Lv. ${this.getCurrentLevel()}`;

            const px = (this.food.x + 0.5) * this.gridSize;
            const py = (this.food.y + 0.5) * this.gridSize;

            this.particles.emit(px, py, 14, '#FF4C4C');
            this.particles.addFloatingText(px, py, '+1', '#00FF87');
            soundEngine.playEat();

            this.spawnFood();

            // Spawn special item every 4 food items
            if (this.foodsEaten % 4 === 0 && !this.specialItem.active) {
                this.spawnSpecialItem();
            }
        } else if (this.specialItem.active && hx === this.specialItem.x && hy === this.specialItem.y) {
            // Special Item Collected
            const px = (this.specialItem.x + 0.5) * this.gridSize;
            const py = (this.specialItem.y + 0.5) * this.gridSize;

            if (this.specialItem.type === 'gold') {
                this.score += 5;
                this.goldEaten += 1;
                this.particles.emitGoldExplosion(px, py);
                this.particles.addFloatingText(px, py, '+5 GOLD!', '#FFD700');
                soundEngine.playBonus();
            } else if (this.specialItem.type === 'freeze') {
                this.score += 5;
                this.applyPowerUp('freeze');
                this.particles.emitFrost(px, py);
                this.particles.addFloatingText(px, py, '+5 & ❄️ SLOW-MO!', '#00E5FF');
                soundEngine.playPowerUp();
            } else if (this.specialItem.type === 'magnet') {
                this.score += 5;
                this.applyPowerUp('magnet');
                this.particles.emitMagnet(px, py);
                this.particles.addFloatingText(px, py, '+5 & 🧲 MAGNET!', '#FF007F');
                soundEngine.playPowerUp();
            }

            document.getElementById('scoreVal').textContent = this.score;
            document.getElementById('speedVal').textContent = `Lv. ${this.getCurrentLevel()}`;
            this.hideSpecialItem();
        } else {
            this.snake.popTail();
        }

        // Special Item Expiration
        if (this.specialItem.active) {
            const elapsed = timestamp - this.specialItem.spawnTime;
            const remainingRatio = Math.max(0, 1 - elapsed / this.specialItem.duration);
            if (this.bonusProgressEl) {
                this.bonusProgressEl.style.width = `${(remainingRatio * 100).toFixed(1)}%`;
            }
            if (elapsed >= this.specialItem.duration) {
                this.hideSpecialItem();
            }
        }
    }

    renderLoop(timestamp) {
        this.updatePhysics(timestamp);
        this.particles.update();
        this.draw(timestamp);
        requestAnimationFrame(this.renderLoop);
    }

    draw(timestamp) {
        const ctx = this.ctx;
        const size = this.gridSize;

        ctx.save();
        ctx.clearRect(0, 0, 600, 600);

        // Apply Screen Shake
        this.particles.applyScreenShake(ctx);

        // Draw Arena Grid Tiles
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * size, 0);
            ctx.lineTo(i * size, 600);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * size);
            ctx.lineTo(600, i * size);
            ctx.stroke();
        }

        // Draw Normal Food
        const fx = this.food.x * size + size / 2;
        const fy = this.food.y * size + size / 2;
        const pulse = Math.sin(timestamp * 0.008) * 1.5;
        const radius = size * 0.38 + pulse;

        ctx.save();
        ctx.shadowColor = '#FF4C4C';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#FF4C4C';
        ctx.beginPath();
        ctx.arc(fx, fy, Math.max(2, radius), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFAAAA';
        ctx.beginPath();
        ctx.arc(fx - radius * 0.3, fy - radius * 0.3, radius * 0.28, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw Special Power-Up Item
        if (this.specialItem.active) {
            const bx = this.specialItem.x * size + size / 2;
            const by = this.specialItem.y * size + size / 2;
            const bPulse = Math.sin(timestamp * 0.015) * 2.5;
            const bRadius = size * 0.44 + bPulse;

            ctx.save();
            let color = '#FFD700';
            if (this.specialItem.type === 'freeze') color = '#00E5FF';
            else if (this.specialItem.type === 'magnet') color = '#FF007F';

            ctx.shadowColor = color;
            ctx.shadowBlur = 18;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(bx, by, Math.max(2, bRadius), 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(bx - bRadius * 0.25, by - bRadius * 0.25, bRadius * 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Draw Snake
        this.snake.draw(ctx, timestamp);

        // Draw Particles & Floating Texts
        this.particles.draw(ctx);

        ctx.restore();
    }

    _bindEvents() {
        window.addEventListener('keydown', e => {
            const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D', 'p', 'P', 'm', 'M', 'b', 'B'];
            if (gameKeys.includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.state === 'PLAYING') this.snake.setDirection(0, -1);
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.state === 'PLAYING') this.snake.setDirection(0, 1);
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.state === 'PLAYING') this.snake.setDirection(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.state === 'PLAYING') this.snake.setDirection(1, 0);
                    break;
                case ' ':
                    if (this.state === 'START' || this.state === 'GAME_OVER') {
                        this.startGame();
                    } else {
                        this.togglePause();
                    }
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    break;
                case 'm':
                case 'M':
                    this.toggleMute();
                    break;
                case 'b':
                case 'B':
                    this.toggleMusic();
                    break;
            }
        }, { passive: false });

        // Touch Swipe
        let touchStartX = 0;
        let touchStartY = 0;
        this.canvas.addEventListener('touchstart', e => {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        this.canvas.addEventListener('touchend', e => {
            if (this.state !== 'PLAYING') return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (Math.max(absDx, absDy) > 20) {
                if (absDx > absDy) {
                    this.snake.setDirection(dx > 0 ? 1 : -1, 0);
                } else {
                    this.snake.setDirection(0, dy > 0 ? 1 : -1);
                }
            }
        }, { passive: true });

        // Virtual D-pad
        document.querySelectorAll('.dpad-btn').forEach(btn => {
            const dir = btn.dataset.dir;
            const handleDir = () => {
                if (this.state === 'PLAYING') {
                    if (dir === 'up') this.snake.setDirection(0, -1);
                    else if (dir === 'down') this.snake.setDirection(0, 1);
                    else if (dir === 'left') this.snake.setDirection(-1, 0);
                    else if (dir === 'right') this.snake.setDirection(1, 0);
                }
            };
            btn.addEventListener('click', handleDir);
            btn.addEventListener('touchstart', e => {
                e.preventDefault();
                handleDir();
            });
        });

        // UI Buttons
        document.getElementById('startPlayBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('playAgainBtn')?.addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('soundBtn')?.addEventListener('click', () => this.toggleMute());
        document.getElementById('musicBtn')?.addEventListener('click', () => this.toggleMusic());

        // Difficulty selection
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficulty = btn.dataset.diff;
                localStorage.setItem('snake_difficulty', this.difficulty);
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                soundEngine.playClick();
            });
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.gameMode = btn.dataset.mode;
                localStorage.setItem('snake_mode', this.gameMode);
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                soundEngine.playClick();
            });
        });

        // Skin selection
        document.querySelectorAll('.skin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.skinId = btn.dataset.skin;
                localStorage.setItem('snake_skin', this.skinId);
                this.snake.setSkin(this.skinId);
                document.querySelectorAll('.skin-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                soundEngine.playClick();
            });
        });
    }

    toggleMute() {
        const isMuted = soundEngine.toggleMute();
        localStorage.setItem('snake_muted', isMuted ? 'true' : 'false');
        this._updateMuteUI(isMuted);
    }

    toggleMusic() {
        const enabled = soundEngine.toggleMusic();
        localStorage.setItem('snake_music', enabled ? 'true' : 'false');
        this._updateMusicUI(enabled);
    }
}

// Instantiate Game on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
