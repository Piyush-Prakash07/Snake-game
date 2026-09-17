import threading
import sys

# Check platform availability for winsound (Windows built-in)
try:
    import winsound
    HAS_WINSOUND = True
except ImportError:
    HAS_WINSOUND = False


class SoundManager:
    """Manages retro sound effects using non-blocking daemon threads."""

    def __init__(self):
        self.muted = False

    def _play_tone(self, frequency: int, duration_ms: int):
        if self.muted or not HAS_WINSOUND:
            return
        try:
            winsound.Beep(frequency, duration_ms)
        except Exception:
            pass

    def _play_sequence(self, tones):
        if self.muted or not HAS_WINSOUND:
            return
        for freq, dur in tones:
            try:
                winsound.Beep(freq, dur)
            except Exception:
                break

    def toggle_mute(self) -> bool:
        self.muted = not self.muted
        return self.muted

    def play_eat(self):
        """Crisp high beep when eating regular food."""
        threading.Thread(target=self._play_tone, args=(800, 60), daemon=True).start()

    def play_bonus(self):
        """Ascending three-tone chime for golden/bonus food."""
        tones = [(700, 70), (900, 70), (1200, 100)]
        threading.Thread(target=self._play_sequence, args=(tones,), daemon=True).start()

    def play_high_score(self):
        """Victory fanfare when achieving a new high score."""
        tones = [(600, 80), (800, 80), (1000, 80), (1400, 180)]
        threading.Thread(target=self._play_sequence, args=(tones,), daemon=True).start()

    def play_game_over(self):
        """Descending buzz for collision / game over."""
        tones = [(450, 120), (320, 150), (200, 250)]
        threading.Thread(target=self._play_sequence, args=(tones,), daemon=True).start()

    def play_pause(self):
        """Short neutral pip for pause/unpause."""
        threading.Thread(target=self._play_tone, args=(500, 50), daemon=True).start()


sound_manager = SoundManager()
