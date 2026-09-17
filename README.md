# 🐍 Snake Game - Arcade & Desktop Editions

[![Language: JavaScript](https://img.shields.io/badge/Language-JavaScript%20ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Language: Python](https://img.shields.io/badge/Language-Python%203.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Tech: HTML5 Canvas](https://img.shields.io/badge/Tech-HTML5%20Canvas-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Audio: Web Audio API](https://img.shields.io/badge/Audio-Web%20Audio%20API-6C5CE7)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A dual-platform implementation of the classic **Snake** game, featuring a state-of-the-art **Web Arcade Edition** powered by HTML5 Canvas & Web Audio API, alongside an object-oriented **Python Desktop Edition** built with the Python `turtle` engine.

---

## 🌟 Table of Contents

- [🎮 Features Overview](#-features-overview)
  - [🌐 Web Arcade Edition](#-web-arcade-edition)
  - [🐍 Python Desktop Edition](#-python-desktop-edition)
- [🕹️ Controls & Gameplay](#️-controls--gameplay)
- [🚀 Getting Started](#-getting-started)
  - [Running the Web Game](#running-the-web-game)
  - [Running the Python Game](#running-the-python-game)
- [📁 Project Architecture](#-project-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [🎨 Skins & Customization](#-skins--customization)
- [🏆 Power-Ups & Bonuses](#-power-ups--bonuses)
- [📄 License](#-license)

---

## 🎮 Features Overview

### 🌐 Web Arcade Edition (`index.html`)

- **High-Performance 60 FPS Rendering**: Smooth 2D grid engine with interpolated animations and glow effects.
- **Cyberpunk / Glassmorphic UI**: Sleek translucent panels, neon gradients, and responsive HUD.
- **Dynamic Synthesizer Audio**: 100% code-generated 8-bit sound effects (eat, bonus, speed-up, game over) and an ambient retro synth background track via the Web Audio API (zero external audio files needed).
- **Particle & Juice System**: Burst particle explosion effects on eating food, glowing trails, screen shake, and floating score popups.
- **Multiple Game Modes & Difficulties**:
  - **Arena Modes**: *Classic Wall Collision* or *Wrap-Around Portal Mode*.
  - **Difficulty Levels**: *Easy*, *Normal*, *Hard*, and *Insane* with progressive speed scaling.
- **Custom Snake Skins**: Selectable cosmetic palettes including *Emerald Dragon*, *Cyber Neon*, *Golden Viper*, *Ruby Flame*, and *Rainbow Synth*.
- **Interactive Power-Ups**:
  - ⭐ **Golden Apple**: Extra points with a dynamic despawn countdown timer bar.
  - ❄️ **Slow-Mo Frost**: Dilates time to maneuver out of tight corners.
  - 🧲 **Food Magnet**: Pulls food directly toward the snake's head.
- **Touch & Mobile Ready**: Virtual on-screen D-pad and gesture controls for smartphones and tablets.
- **Persistent High Scores**: Automatically records personal best scores, total food collected, and gameplay statistics in `localStorage`.

---

### 🐍 Python Desktop Edition (`Project/main.py`)

- **Pure Object-Oriented Architecture**: Modular structure dividing responsibility across `Snake`, `Food`, `BonusFood`, `Scoreboard`, and `SoundManager`.
- **Dynamic Difficulty Ramp**: Movement speed increases automatically every 4 points scored.
- **Golden Bonus Food**: Spawns intermittently with a custom countdown timer for bonus points.
- **Integrated Audio Effects**: Synthesized cross-platform auditory feedback using native sound channels (`winsound` on Windows with multi-platform fallbacks).
- **Persistent Data**: High score saved across game sessions in `data.txt`.
- **Sleek Modern Styling**: Custom dark slate colorway (`#0F172A`) with dual-layered neon arena borders.

---

## 🕹️ Controls & Gameplay

### 🌐 Web Edition

| Action | Primary Key | Secondary Key | Touch / UI |
| :--- | :--- | :--- | :--- |
| **Move Up** | <kbd>W</kbd> | <kbd>↑</kbd> | Virtual D-Pad Up |
| **Move Down** | <kbd>S</kbd> | <kbd>↓</kbd> | Virtual D-Pad Down |
| **Move Left** | <kbd>A</kbd> | <kbd>←</kbd> | Virtual D-Pad Left |
| **Move Right** | <kbd>D</kbd> | <kbd>→</kbd> | Virtual D-Pad Right |
| **Pause / Resume** | <kbd>Space</kbd> | <kbd>P</kbd> | Pause Button |
| **Toggle SFX** | <kbd>M</kbd> | — | Sound Button |
| **Toggle BGM** | <kbd>B</kbd> | — | Music Button |
| **Restart Game** | <kbd>Enter</kbd> | <kbd>Space</kbd> | Play Again Button |

### 🐍 Python Desktop Edition

| Action | Keybinding |
| :--- | :--- |
| **Navigate** | <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> (Arrow Keys) |
| **Pause / Resume** | <kbd>P</kbd> |
| **Restart (Game Over)** | <kbd>Space</kbd> or <kbd>R</kbd> |
| **Start Game** | <kbd>Space</kbd> |

---

## 🚀 Getting Started

### Prerequisites

- **For Web Edition**: Any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Brave, etc.).
- **For Python Edition**: Python 3.8+ installed on your system.

---

### Running the Web Game

#### Option 1: Direct File Launch
Simply open `index.html` in your web browser:
- Double-click `index.html` in your file explorer, OR
- Right-click `index.html` ➔ **Open With** ➔ Your browser.

#### Option 2: Live Server (VS Code / Local Server)
```bash
# Using Python built-in HTTP server:
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

---

### Running the Python Game

1. Open your terminal / command prompt.
2. Navigate to the `Project` directory:
   ```bash
   cd Project
   ```
3. Run the main script:
   ```bash
   python main.py
   ```

---

## 📁 Project Architecture

```
Snake game/
│
├── index.html              # Web Edition - Semantic HTML5 layout & UI modals
├── style.css               # Web Edition - Modern Glassmorphism & Cyberpunk CSS
├── js/
│   ├── game.js             # Main game loop, state machine & power-up logic
│   ├── snake.js            # Snake body coordinates, rendering & skin palettes
│   ├── particles.js        # Dynamic particle emission & screen juice effects
│   └── audio.js            # Web Audio API procedural sound synthesizer
│
├── Project/                # Python Desktop Edition
│   ├── main.py             # Entry point & turtle game coordinator
│   ├── snake.py            # OOP Snake body segments & movement logic
│   ├── food.py             # Standard Food & timed BonusFood classes
│   ├── scoreboard.py       # High score tracking & game-over overlays
│   ├── sound.py            # Cross-platform sound effect synthesizer
│   └── data.txt            # Persistent high score storage
│
├── .gitignore              # Git ignore rules for virtualenvs, caches & IDE files
└── README.md               # Project documentation
```

---

## 🛠️ Tech Stack

### Web Edition
- **Markup & Structure**: HTML5 (Semantic elements, accessible labels)
- **Styling**: Vanilla CSS3 (Custom properties, flexbox/grid, CSS animations, backdrop filters)
- **Rendering Engine**: HTML5 2D Canvas Context
- **Scripting**: Vanilla JavaScript (ES6+ Classes, Modules, Event Listeners)
- **Sound Generation**: Web Audio API (OscillatorNode, GainNode, procedural synth)

### Python Desktop Edition
- **Language**: Python 3 (Object-Oriented Programming)
- **GUI & Graphics**: `turtle` Graphics Engine
- **Sound**: Native system sound synthesis (`winsound` / cross-platform tones)
- **Persistence**: File I/O (`data.txt`)

---

## 🎨 Skins & Customization

The Web Edition includes multiple unlocked color skins:

| Skin Name | Primary Color | Accent Glow | Style |
| :--- | :--- | :--- | :--- |
| **Emerald Dragon** | `#10B981` (Vibrant Green) | `#34D399` | Classic Arcade |
| **Cyber Neon** | `#00E5FF` (Cyan Glow) | `#38BDF8` | Cyberpunk Synth |
| **Golden Viper** | `#F59E0B` (Amber Gold) | `#FDE047` | Luxury Royale |
| **Ruby Flame** | `#EF4444` (Fire Crimson) | `#F87171` | Blazing Ember |
| **Void Shadow** | `#8B5CF6` (Deep Violet) | `#C084FC` | Spectral Phantom |

---

## 🏆 Power-Ups & Bonuses

- 🍏 **Normal Food**: +10 Points, grows snake by 1 segment, triggers particle burst.
- ⭐ **Golden Apple**: +50 Points, temporary spawn with a visible timer bar.
- ❄️ **Slow-Mo Frost**: Temporarily slows down snake speed by 40% for easier navigation.
- 🧲 **Food Magnet**: Pulls food within a 5-tile radius directly to your head.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - feel free to modify and build upon it!

---

*Enjoy playing Snake! Star ⭐ this repo if you like it!*
