from turtle import Turtle
import os

ALIGNMENT = "center"
SCORE_FONT = ("Courier", 14, "bold")
TITLE_FONT = ("Courier", 26, "bold")
SUB_FONT = ("Courier", 13, "normal")
ACCENT_FONT = ("Courier", 16, "bold")

HUD_COLOR = "#ECEFF1"
ACCENT_COLOR = "#00FF7F"
GOLD_COLOR = "#FFD700"
ALERT_COLOR = "#FF5252"


class Scoreboard:
    """Manages the top HUD score and on-screen overlays (Start, Pause, Game Over)."""

    def __init__(self):
        self.score = 0
        self.high_score = self._load_high_score()

        # HUD Top Banner Turtle
        self.hud = Turtle()
        self.hud.color(HUD_COLOR)
        self.hud.penup()
        self.hud.hideturtle()
        self.hud.goto(0, 268)

        # Center Screen Messages Turtle
        self.msg = Turtle()
        self.msg.penup()
        self.msg.hideturtle()

        self.update_scoreboard(level=1)

    def _get_data_path(self):
        return os.path.join(os.path.dirname(__file__), "data.txt")

    def _load_high_score(self) -> int:
        try:
            path = self._get_data_path()
            if os.path.exists(path):
                with open(path, "r") as f:
                    content = f.read().strip()
                    return int(content) if content.isdigit() else 0
        except Exception:
            pass
        return 0

    def _save_high_score(self):
        try:
            path = self._get_data_path()
            with open(path, "w") as f:
                f.write(str(self.high_score))
        except Exception:
            pass

    def update_scoreboard(self, level=1):
        self.hud.clear()
        self.hud.write(
            f"SCORE: {self.score}   ★ HIGH: {self.high_score}   SPEED: Lv.{level}",
            align=ALIGNMENT,
            font=SCORE_FONT,
        )

    def increase_score(self, points=1, level=1):
        self.score += points
        self.update_scoreboard(level=level)

    def clear_overlay(self):
        self.msg.clear()

    def show_start_screen(self):
        self.msg.clear()
        self.msg.goto(0, 50)
        self.msg.color(ACCENT_COLOR)
        self.msg.write("S N A K E", align=ALIGNMENT, font=TITLE_FONT)

        self.msg.goto(0, 0)
        self.msg.color(HUD_COLOR)
        self.msg.write("Press [ SPACE ] to Start", align=ALIGNMENT, font=ACCENT_FONT)

        self.msg.goto(0, -50)
        self.msg.color("#90A4AE")
        self.msg.write("Controls: Arrow Keys / WASD  |  [P] Pause", align=ALIGNMENT, font=SUB_FONT)

    def show_pause_screen(self):
        self.msg.clear()
        self.msg.goto(0, 20)
        self.msg.color(GOLD_COLOR)
        self.msg.write("PAUSED", align=ALIGNMENT, font=TITLE_FONT)

        self.msg.goto(0, -30)
        self.msg.color(HUD_COLOR)
        self.msg.write("Press [ SPACE ] or [ P ] to Resume", align=ALIGNMENT, font=SUB_FONT)

    def show_game_over(self, is_new_record=False):
        self.msg.clear()
        self.msg.goto(0, 40)
        self.msg.color(ALERT_COLOR)
        self.msg.write("GAME OVER", align=ALIGNMENT, font=TITLE_FONT)

        if is_new_record:
            self.msg.goto(0, 0)
            self.msg.color(GOLD_COLOR)
            self.msg.write(f"★ NEW HIGH SCORE: {self.score} ★", align=ALIGNMENT, font=ACCENT_FONT)
        else:
            self.msg.goto(0, 0)
            self.msg.color(HUD_COLOR)
            self.msg.write(f"Final Score: {self.score}", align=ALIGNMENT, font=ACCENT_FONT)

        self.msg.goto(0, -50)
        self.msg.color(ACCENT_COLOR)
        self.msg.write("Press [ SPACE ] to Play Again", align=ALIGNMENT, font=SUB_FONT)

    def check_and_save_high_score(self) -> bool:
        """Returns True if a new high score was set."""
        if self.score > self.high_score:
            self.high_score = self.score
            self._save_high_score()
            return True
        return False

    def reset(self):
        self.score = 0
        self.update_scoreboard(level=1)
        self.clear_overlay()