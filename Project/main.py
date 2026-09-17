import time
import turtle
from turtle import Screen, Turtle

from food import Food, BonusFood
from scoreboard import Scoreboard
from snake import Snake
from sound import sound_manager

# Game States
STATE_START = "START"
STATE_PLAYING = "PLAYING"
STATE_PAUSED = "PAUSED"
STATE_GAME_OVER = "GAME_OVER"

WALL_BOUNDARY = 270
BASE_SPEED = 0.10
MIN_SPEED = 0.045
SPEED_INCREMENT_SCORE = 4


def draw_arena_border():
    """Draws a sleek neon border framing the playable arena."""
    border = Turtle()
    border.hideturtle()
    border.speed("fastest")
    border.penup()
    border.pensize(2)
    border.color("#1E293B")  # Dark subtle outer stroke
    border.goto(-275, -275)
    border.pendown()
    for _ in range(4):
        border.forward(550)
        border.left(90)
    border.penup()

    # Inner bright accent border
    border.color("#334155")
    border.goto(-273, -273)
    border.pendown()
    for _ in range(4):
        border.forward(546)
        border.left(90)
    border.penup()


def main():
    screen = Screen()
    screen.setup(width=620, height=620)
    screen.bgcolor("#0F172A")  # Modern slate dark background
    screen.title("Snake Arcade Edition")
    screen.tracer(0)

    draw_arena_border()

    snake = Snake()
    food = Food()
    bonus_food = BonusFood()
    scoreboard = Scoreboard()

    current_state = STATE_START
    foods_eaten = 0
    running = True

    scoreboard.show_start_screen()

    # --- Input Handlers ---
    def handle_up():
        if current_state == STATE_PLAYING:
            snake.up()

    def handle_down():
        if current_state == STATE_PLAYING:
            snake.down()

    def handle_left():
        if current_state == STATE_PLAYING:
            snake.left()

    def handle_right():
        if current_state == STATE_PLAYING:
            snake.right()

    def handle_space():
        nonlocal current_state, foods_eaten
        if current_state == STATE_START:
            scoreboard.clear_overlay()
            current_state = STATE_PLAYING
            sound_manager.play_pause()
        elif current_state == STATE_PLAYING:
            scoreboard.show_pause_screen()
            current_state = STATE_PAUSED
            sound_manager.play_pause()
        elif current_state == STATE_PAUSED:
            scoreboard.clear_overlay()
            current_state = STATE_PLAYING
            sound_manager.play_pause()
        elif current_state == STATE_GAME_OVER:
            # Restart game
            scoreboard.reset()
            snake.reset()
            food.refresh(snake.segments)
            bonus_food.hide()
            foods_eaten = 0
            current_state = STATE_PLAYING
            sound_manager.play_pause()

    def toggle_pause():
        nonlocal current_state
        if current_state == STATE_PLAYING:
            scoreboard.show_pause_screen()
            current_state = STATE_PAUSED
            sound_manager.play_pause()
        elif current_state == STATE_PAUSED:
            scoreboard.clear_overlay()
            current_state = STATE_PLAYING
            sound_manager.play_pause()

    def on_window_close():
        nonlocal running
        running = False
        try:
            screen.bye()
        except Exception:
            pass

    # Safe window close hook
    try:
        screen._root.protocol("WM_DELETE_WINDOW", on_window_close)
    except Exception:
        pass

    # Key Bindings (Arrows + WASD + Controls)
    screen.listen()
    screen.onkey(handle_up, "Up")
    screen.onkey(handle_up, "w")
    screen.onkey(handle_up, "W")

    screen.onkey(handle_down, "Down")
    screen.onkey(handle_down, "s")
    screen.onkey(handle_down, "S")

    screen.onkey(handle_left, "Left")
    screen.onkey(handle_left, "a")
    screen.onkey(handle_left, "A")

    screen.onkey(handle_right, "Right")
    screen.onkey(handle_right, "d")
    screen.onkey(handle_right, "D")

    screen.onkey(handle_space, "space")
    screen.onkey(toggle_pause, "p")
    screen.onkey(toggle_pause, "P")

    # Game Loop
    try:
        while running:
            screen.update()

            if current_state == STATE_PLAYING:
                # Calculate speed and level
                speed_level = 1 + (scoreboard.score // SPEED_INCREMENT_SCORE)
                delay = max(MIN_SPEED, BASE_SPEED - (speed_level - 1) * 0.007)
                time.sleep(delay)

                snake.move()

                # 1. Normal Food Collision
                if snake.head.distance(food) < 18:
                    food.refresh(snake.segments)
                    snake.extend()
                    foods_eaten += 1
                    scoreboard.increase_score(points=1, level=speed_level)
                    sound_manager.play_eat()

                    # Intermittently spawn bonus golden apple
                    if foods_eaten % 5 == 0 and not bonus_food.active:
                        bonus_food.spawn(snake.segments, food)

                # 2. Bonus Food Check
                if bonus_food.active:
                    bonus_food.check_expiration()
                    if bonus_food.active and snake.head.distance(bonus_food) < 20:
                        bonus_food.hide()
                        snake.extend()
                        scoreboard.increase_score(points=5, level=speed_level)
                        sound_manager.play_bonus()

                # 3. Wall Collision
                if (
                    abs(snake.head.xcor()) > WALL_BOUNDARY
                    or abs(snake.head.ycor()) > WALL_BOUNDARY
                ):
                    is_new_high = scoreboard.check_and_save_high_score()
                    bonus_food.hide()
                    scoreboard.show_game_over(is_new_record=is_new_high)
                    if is_new_high:
                        sound_manager.play_high_score()
                    else:
                        sound_manager.play_game_over()
                    current_state = STATE_GAME_OVER

                # 4. Self/Tail Collision
                for segment in snake.segments[1:]:
                    if snake.head.distance(segment) < 10:
                        is_new_high = scoreboard.check_and_save_high_score()
                        bonus_food.hide()
                        scoreboard.show_game_over(is_new_record=is_new_high)
                        if is_new_high:
                            sound_manager.play_high_score()
                        else:
                            sound_manager.play_game_over()
                        current_state = STATE_GAME_OVER
                        break

            else:
                # Idle tick when paused / at start / game over
                time.sleep(0.05)

    except (turtle.Terminator, Exception):
        # Graceful exit without Tkinter error tracebacks
        pass


if __name__ == "__main__":
    main()
