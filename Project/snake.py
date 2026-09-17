from turtle import Turtle

STARTING_POSITIONS = [(0, 0), (-20, 0), (-40, 0)]
MOVE_DISTANCE = 20
UP = 90
DOWN = 270
LEFT = 180
RIGHT = 0

HEAD_COLOR = "#00FF7F"  # Spring green
BODY_COLOR_1 = "#00E676"  # Vibrant green
BODY_COLOR_2 = "#00C853"  # Deep green


class Snake:
    def __init__(self):
        self.segments = []
        self.can_turn = True
        self.create_snake()
        self.head = self.segments[0]

    def create_snake(self):
        for index, position in enumerate(STARTING_POSITIONS):
            self.add_segment(position, is_head=(index == 0))

    def add_segment(self, position, is_head=False):
        new_segment = Turtle("square")
        new_segment.penup()
        new_segment.speed("fastest")

        if is_head:
            new_segment.color(HEAD_COLOR)
        else:
            # Alternating subtle gradient for body segments
            color = BODY_COLOR_1 if len(self.segments) % 2 == 0 else BODY_COLOR_2
            new_segment.color(color)

        new_segment.goto(position)
        self.segments.append(new_segment)

    def reset(self):
        for seg in self.segments:
            seg.goto(1000, 1000)
        self.segments.clear()
        self.create_snake()
        self.head = self.segments[0]
        self.can_turn = True

    def extend(self):
        self.add_segment(self.segments[-1].position())

    def move(self):
        for seg_num in range(len(self.segments) - 1, 0, -1):
            new_x = self.segments[seg_num - 1].xcor()
            new_y = self.segments[seg_num - 1].ycor()
            self.segments[seg_num].goto(new_x, new_y)
        self.head.forward(MOVE_DISTANCE)
        # Unlock input for next turn after physics step
        self.can_turn = True

    def up(self):
        if self.can_turn and self.head.heading() != DOWN:
            self.head.setheading(UP)
            self.can_turn = False

    def down(self):
        if self.can_turn and self.head.heading() != UP:
            self.head.setheading(DOWN)
            self.can_turn = False

    def left(self):
        if self.can_turn and self.head.heading() != RIGHT:
            self.head.setheading(LEFT)
            self.can_turn = False

    def right(self):
        if self.can_turn and self.head.heading() != LEFT:
            self.head.setheading(RIGHT)
            self.can_turn = False