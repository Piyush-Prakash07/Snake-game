from turtle import Turtle
import random
import time

GRID_STEP = 20
MIN_COORD = -260
MAX_COORD = 260


class Food(Turtle):
    """Standard food item that spawns on a 20px grid and avoids the snake body."""

    def __init__(self):
        super().__init__()
        self.shape("circle")
        self.penup()
        self.shapesize(stretch_len=0.6, stretch_wid=0.6)
        self.color("#FF4C4C")  # Neon coral / red
        self.speed("fastest")
        self.refresh()

    def refresh(self, snake_segments=None):
        """Move food to a random grid coordinate not occupied by the snake."""
        occupied = set()
        if snake_segments:
            for segment in snake_segments:
                occupied.add((round(segment.xcor() / 20) * 20, round(segment.ycor() / 20) * 20))

        possible_coords = [
            (x, y)
            for x in range(MIN_COORD, MAX_COORD + 1, GRID_STEP)
            for y in range(MIN_COORD, MAX_COORD + 1, GRID_STEP)
            if (x, y) not in occupied
        ]

        if possible_coords:
            new_x, new_y = random.choice(possible_coords)
        else:
            new_x = random.randrange(MIN_COORD, MAX_COORD + 1, GRID_STEP)
            new_y = random.randrange(MIN_COORD, MAX_COORD + 1, GRID_STEP)

        self.goto(new_x, new_y)


class BonusFood(Turtle):
    """Temporary golden apple that appears intermittently with bonus points."""

    def __init__(self):
        super().__init__()
        self.shape("circle")
        self.penup()
        self.shapesize(stretch_len=0.9, stretch_wid=0.9)
        self.color("#FFD700")  # Shiny gold
        self.speed("fastest")
        self.active = False
        self.spawn_time = 0
        self.duration = 6.0  # Disappears after 6 seconds
        self.hide()

    def hide(self):
        """Move offscreen and deactivate."""
        self.active = False
        self.goto(1000, 1000)

    def spawn(self, snake_segments=None, normal_food=None):
        """Spawn the golden apple on an empty grid position."""
        occupied = set()
        if snake_segments:
            for segment in snake_segments:
                occupied.add((round(segment.xcor() / 20) * 20, round(segment.ycor() / 20) * 20))
        if normal_food:
            occupied.add((round(normal_food.xcor() / 20) * 20, round(normal_food.ycor() / 20) * 20))

        possible_coords = [
            (x, y)
            for x in range(MIN_COORD, MAX_COORD + 1, GRID_STEP)
            for y in range(MIN_COORD, MAX_COORD + 1, GRID_STEP)
            if (x, y) not in occupied
        ]

        if possible_coords:
            new_x, new_y = random.choice(possible_coords)
            self.goto(new_x, new_y)
            self.active = True
            self.spawn_time = time.time()

    def check_expiration(self):
        """Check if time expired for the bonus food."""
        if self.active and (time.time() - self.spawn_time > self.duration):
            self.hide()
            return True
        return False
