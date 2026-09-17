/**
 * Web Audio API Synth for Retro 8-bit & Modern Arcade Sound FX and Synthesized BGM
 * Zero external audio files required.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.musicEnabled = false;
        this.volume = 0.3;
        this.bgmTimer = null;
        this.bgmStep = 0;
    }

    _initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted && this.musicEnabled) {
            this.stopBGM();
        } else if (!this.muted && this.musicEnabled) {
            this.startBGM();
        }
        return this.muted;
    }

    setMuted(state) {
        this.muted = state;
    }

    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;
        if (this.musicEnabled && !this.muted) {
            this._initContext();
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.musicEnabled;
    }

    startBGM() {
        if (this.bgmTimer) return;
        this._initContext();
        if (!this.ctx) return;

        // 8-bit Arcade Bassline & Arpeggio pattern
        const bassNotes = [110, 110, 130.81, 146.83, 164.81, 146.83, 130.81, 110];
        const leadNotes = [220, 261.63, 329.63, 440, 329.63, 261.63, 293.66, 349.23];

        this.bgmStep = 0;
        this.bgmTimer = setInterval(() => {
            if (this.muted || !this.musicEnabled || !this.ctx) return;

            const now = this.ctx.currentTime;
            const bassFreq = bassNotes[this.bgmStep % bassNotes.length];
            const leadFreq = leadNotes[this.bgmStep % leadNotes.length];

            // Bass pulse
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bOsc.type = 'triangle';
            bOsc.frequency.setValueAtTime(bassFreq, now);
            bGain.gain.setValueAtTime(this.volume * 0.18, now);
            bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
            bOsc.connect(bGain);
            bGain.connect(this.ctx.destination);
            bOsc.start(now);
            bOsc.stop(now + 0.16);

            // Lead chime
            if (this.bgmStep % 2 === 0) {
                const lOsc = this.ctx.createOscillator();
                const lGain = this.ctx.createGain();
                lOsc.type = 'square';
                lOsc.frequency.setValueAtTime(leadFreq, now);
                lGain.gain.setValueAtTime(this.volume * 0.08, now);
                lGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
                lOsc.connect(lGain);
                lGain.connect(this.ctx.destination);
                lOsc.start(now);
                lOsc.stop(now + 0.14);
            }

            this.bgmStep++;
        }, 180);
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
    }

    playEat() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);

        gain.gain.setValueAtTime(this.volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
    }

    playBonus() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const notes = [587.33, 739.99, 880.00, 1174.66];
        notes.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.06;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(this.volume * 0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.12);
        });
    }

    playPowerUp() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const tones = [440, 554.37, 659.25, 880];
        tones.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(this.volume * 0.7, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.15);
        });
    }

    playGameOver() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(this.volume * 0.9, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    }

    playNewHighScore() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const fanfare = [
            { f: 523.25, d: 0.10 },
            { f: 659.25, d: 0.10 },
            { f: 783.99, d: 0.10 },
            { f: 1046.50, d: 0.28 }
        ];

        let offset = 0;
        fanfare.forEach(item => {
            const now = this.ctx.currentTime + offset;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.f, now);

            gain.gain.setValueAtTime(this.volume * 0.8, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + item.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + item.d);
            offset += item.d * 0.85;
        });
    }

    playClick() {
        if (this.muted) return;
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }
}

const soundEngine = new SoundEngine();
