"""Core snake game logic"""

import random
from typing import List, Tuple, Optional
from snake_game.core.bonus_food import BonusFood, BonusFoodType
from snake_game.core.power_ups import PowerUpManager


class Point:
    """Represents a point on the game grid"""
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y
    
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y
    
    def __hash__(self):
        return hash((self.x, self.y))


class Snake:
    """Represents the snake in the game"""
    def __init__(self, grid_size: int):
        self.grid_size = grid_size
        self.body = [Point(grid_size // 2, grid_size // 2)]
        self.direction = Point(1, 0)
        self.grow_segments = 0
    
    def move(self):
        """Move the snake in current direction"""
        new_head = Point(
            self.body[0].x + self.direction.x,
            self.body[0].y + self.direction.y
        )
        
        self.body.insert(0, new_head)
        
        if self.grow_segments > 0:
            self.grow_segments -= 1
        else:
            self.body.pop()
    
    def change_direction(self, new_direction: Point):
        """Change snake direction if not moving backwards"""
        if len(self.body) > 1:
            current_direction = self.direction
            opposite_direction = Point(-current_direction.x, -current_direction.y)
            if new_direction != opposite_direction:
                self.direction = new_direction
        else:
            self.direction = new_direction
    
    def grow(self):
        """Add segments to snake"""
        self.grow_segments += 1
    
    def get_head(self) -> Point:
        """Get head position"""
        return self.body[0]
    
    def check_collision(self) -> bool:
        """Check if snake collided with walls or itself"""
        head = self.get_head()
        
        # Wall collision
        if head.x < 0 or head.x >= self.grid_size:
            return True
        if head.y < 0 or head.y >= self.grid_size:
            return True
        
        # Self collision
        if head in self.body[1:]:
            return True
        
        return False


class Food:
    """Represents food in the game"""
    def __init__(self, grid_size: int):
        self.grid_size = grid_size
        self.position: Optional[Point] = None
    
    def generate(self, snake_body: List[Point]):
        """Generate new food position (not on snake)"""
        available_positions = []
        
        for x in range(self.grid_size):
            for y in range(self.grid_size):
                point = Point(x, y)
                if point not in snake_body:
                    available_positions.append(point)
        
        if available_positions:
            self.position = random.choice(available_positions)
        else:
            self.position = None
    
    def get_position(self) -> Optional[Point]:
        """Get current food position"""
        return self.position


class SnakeGame:
    """Main game controller"""
    def __init__(self, grid_size: int = 20):
        self.grid_size = grid_size
        self.snake = Snake(grid_size)
        self.food = Food(grid_size)
        self.bonus_food = BonusFood(grid_size)
        self.power_up_manager = PowerUpManager()
        self.score = 0
        self.high_score = 0
        self.game_running = False
        self.game_paused = False
        self.consecutive_foods = 0
        self.foods_for_bonus = 5
        self.generate_food()
    
    def start_game(self):
        """Start or restart the game"""
        if self.score > self.high_score:
            self.high_score = self.score
        
        self.snake = Snake(self.grid_size)
        self.food = Food(self.grid_size)
        self.bonus_food = BonusFood(self.grid_size)
        self.power_up_manager = PowerUpManager()
        self.score = 0
        self.consecutive_foods = 0
        self.game_running = True
        self.game_paused = False
        self.generate_food()
    
    def pause_game(self):
        """Pause/unpause the game"""
        self.game_paused = not self.game_paused
    
    def reset_game(self):
        """Reset game to initial state"""
        if self.score > self.high_score:
            self.high_score = self.score
        
        self.start_game()
        self.game_running = False
    
    def move_snake(self):
        """Move snake if game is running"""
        if not self.game_running or self.game_paused:
            return
        
        # Update power-ups
        self.power_up_manager.update()
        
        # Check if bonus food expired
        if self.bonus_food.position and self.bonus_food.is_expired():
            self.bonus_food.position = None
            self.bonus_food.type = None
        
        # Handle magnet effect
        if self.power_up_manager.magnet_active and self.food.position:
            head = self.snake.get_head()
            food_pos = self.food.position
            distance = abs(head.x - food_pos.x) + abs(head.y - food_pos.y)
            
            # Auto-move food closer if within magnet range
            if distance <= self.power_up_manager.active_powerups[BonusFoodType.MAGNET].magnet_range:
                if head.x < food_pos.x:
                    self.food.position.x -= 1
                elif head.x > food_pos.x:
                    self.food.position.x += 1
                elif head.y < food_pos.y:
                    self.food.position.y -= 1
                elif head.y > food_pos.y:
                    self.food.position.y += 1
        
        self.snake.move()
        
        # Check collisions with power-up effects
        if not self.power_up_manager.invincible:
            if self.snake.check_collision():
                # Check if ghost mode allows self-collision
                head = self.snake.get_head()
                if head in self.snake.body[1:] and self.power_up_manager.can_pass_self:
                    pass  # Continue playing
                else:
                    self.game_running = False
                    return
        
        # Check regular food collision
        if self.food.get_position() and self.snake.get_head() == self.food.get_position():
            self.snake.grow()
            points = 10 * int(self.power_up_manager.points_multiplier)
            self.score += points
            self.consecutive_foods += 1
            self.power_up_manager.on_food_collected()
            
            # Check if should spawn bonus food
            if self.consecutive_foods >= self.foods_for_bonus:
                self.spawn_bonus_food()
                self.consecutive_foods = 0
            
            self.generate_food()
        
        # Check bonus food collision
        if self.bonus_food.position and self.snake.get_head() == self.bonus_food.position:
            self.consume_bonus_food()
        
        # Update mirror snake if active
        if BonusFoodType.MIRROR in self.power_up_manager.active_powerups:
            mirror_positions = self.power_up_manager.update_mirror_snake(
                self.snake.body, self.snake.direction, self.grid_size
            )
            
            # Check if mirror snake collected food
            if self.food.position and mirror_positions:
                if self.food.position in mirror_positions:
                    points = 10 * int(self.power_up_manager.points_multiplier)
                    self.score += points
                    self.generate_food()
    
    def change_direction(self, direction: Point):
        """Change snake direction"""
        self.snake.change_direction(direction)
    
    def generate_food(self):
        """Generate new food"""
        # Include bonus food position in occupied spaces
        occupied = self.snake.body.copy()
        if self.bonus_food.position:
            occupied.append(self.bonus_food.position)
        self.food.generate(occupied)
    
    def spawn_bonus_food(self):
        """Spawn a bonus food item"""
        food_pos = self.food.position if self.food.position else Point(-1, -1)
        self.bonus_food.spawn(self.snake.body, food_pos)
    
    def consume_bonus_food(self):
        """Consume bonus food and activate its effect"""
        bonus_type, properties = self.bonus_food.consume()
        
        if bonus_type == BonusFoodType.LIGHTNING:
            # Teleport to safe position
            new_pos = self.power_up_manager.get_teleport_position(
                self.grid_size, self.snake.body, self.food.position
            )
            if new_pos:
                # Move head to new position
                self.snake.body[0] = new_pos
        
        elif bonus_type == BonusFoodType.BOMB:
            # Clear 3x3 area around snake
            self.snake.body = self.power_up_manager.apply_bomb_effect(
                self.snake.get_head(), self.snake.body
            )
        
        else:
            # Activate other power-ups
            self.power_up_manager.activate_powerup(bonus_type, properties)
        
        # Bonus food gives extra points
        self.score += 50
    
    def get_game_speed(self) -> int:
        """Get current game speed with power-up effects"""
        base_speed = 100  # milliseconds
        return int(base_speed / self.power_up_manager.speed_multiplier)
    
    def get_game_state(self) -> dict:
        """Get current game state"""
        state = {
            'snake': [[point.x, point.y] for point in self.snake.body],
            'food': [self.food.position.x, self.food.position.y] if self.food.position else None,
            'score': self.score,
            'high_score': self.high_score,
            'game_running': self.game_running,
            'game_paused': self.game_paused,
            'consecutive_foods': self.consecutive_foods,
            'game_speed': self.get_game_speed(),
            'power_ups': self.power_up_manager.get_active_effects()
        }
        
        # Add bonus food info if present
        bonus_info = self.bonus_food.get_info()
        if bonus_info:
            state['bonus_food'] = bonus_info
        
        # Add mirror snake positions if active
        if self.power_up_manager.mirror_snake_positions:
            state['mirror_snake'] = [[p.x, p.y] for p in self.power_up_manager.mirror_snake_positions]
        
        return state