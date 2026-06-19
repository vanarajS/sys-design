"""Power-up management system for Snake Game"""

import time
from typing import Dict, List, Optional, Tuple
from snake_game.core.bonus_food import BonusFoodType
from snake_game.core.snake_game import Point
import random


class PowerUp:
    """Represents an active power-up effect"""
    
    def __init__(self, power_type: BonusFoodType, duration: float = 0, count: int = 0):
        self.type = power_type
        self.start_time = time.time()
        self.duration = duration / 1000.0  # Convert ms to seconds
        self.count = count  # For count-based effects (magnet, rainbow)
        self.active = True
        
        # Special properties for specific power-ups
        self.magnet_range = 5  # Grid cells
        self.mirror_snake = None  # For mirror effect
        self.shield_active = False
        self.ghost_active = False
        self.speed_multiplier = 1.0
        self.points_multiplier = 1.0
    
    def is_expired(self) -> bool:
        """Check if power-up has expired"""
        if self.duration > 0:
            return (time.time() - self.start_time) > self.duration
        elif self.count > 0:
            return self.count <= 0
        return not self.active
    
    def get_time_remaining(self) -> float:
        """Get remaining time for duration-based power-ups"""
        if self.duration > 0:
            elapsed = time.time() - self.start_time
            return max(0, self.duration - elapsed)
        return 0
    
    def decrement_count(self):
        """Decrement count for count-based power-ups"""
        if self.count > 0:
            self.count -= 1


class PowerUpManager:
    """Manages all active power-ups in the game"""
    
    def __init__(self):
        self.active_powerups: Dict[BonusFoodType, PowerUp] = {}
        self.speed_multiplier = 1.0
        self.points_multiplier = 1.0
        self.invincible = False
        self.can_pass_self = False
        self.magnet_active = False
        self.mirror_snake_positions: List[Point] = []
    
    def activate_powerup(self, power_type: BonusFoodType, properties: dict):
        """Activate a new power-up"""
        duration = properties.get("effect_duration", 0)
        
        if power_type == BonusFoodType.LIGHTNING:
            # Instant effect - handled separately
            return
        
        elif power_type == BonusFoodType.SHIELD:
            powerup = PowerUp(power_type, duration)
            powerup.shield_active = True
            self.invincible = True
            
        elif power_type == BonusFoodType.GHOST:
            powerup = PowerUp(power_type, duration)
            powerup.ghost_active = True
            self.can_pass_self = True
            
        elif power_type == BonusFoodType.MAGNET:
            powerup = PowerUp(power_type, count=3)
            self.magnet_active = True
            
        elif power_type == BonusFoodType.FREEZE:
            powerup = PowerUp(power_type, duration)
            powerup.speed_multiplier = 0.5
            self.speed_multiplier = 0.5
            
        elif power_type == BonusFoodType.RAINBOW:
            powerup = PowerUp(power_type, count=5)
            powerup.points_multiplier = 2.0
            self.points_multiplier = 2.0
            
        elif power_type == BonusFoodType.BOMB:
            # Instant effect - handled separately
            return
            
        elif power_type == BonusFoodType.MIRROR:
            powerup = PowerUp(power_type, duration)
            # Initialize mirror snake positions
            self.mirror_snake_positions = []
        
        else:
            return
        
        # Store the power-up
        self.active_powerups[power_type] = powerup
    
    def update(self):
        """Update all active power-ups and remove expired ones"""
        expired_powerups = []
        
        for power_type, powerup in self.active_powerups.items():
            if powerup.is_expired():
                expired_powerups.append(power_type)
        
        # Remove expired power-ups and reset their effects
        for power_type in expired_powerups:
            self.deactivate_powerup(power_type)
    
    def deactivate_powerup(self, power_type: BonusFoodType):
        """Deactivate a power-up and reset its effects"""
        if power_type in self.active_powerups:
            powerup = self.active_powerups[power_type]
            
            if power_type == BonusFoodType.SHIELD:
                self.invincible = False
            elif power_type == BonusFoodType.GHOST:
                self.can_pass_self = False
            elif power_type == BonusFoodType.MAGNET:
                self.magnet_active = False
            elif power_type == BonusFoodType.FREEZE:
                self.speed_multiplier = 1.0
            elif power_type == BonusFoodType.RAINBOW:
                self.points_multiplier = 1.0
            elif power_type == BonusFoodType.MIRROR:
                self.mirror_snake_positions = []
            
            del self.active_powerups[power_type]
    
    def on_food_collected(self):
        """Called when food is collected to update count-based power-ups"""
        for powerup in self.active_powerups.values():
            if powerup.type in [BonusFoodType.MAGNET, BonusFoodType.RAINBOW]:
                powerup.decrement_count()
    
    def get_teleport_position(self, grid_size: int, snake_body: List[Point], 
                            food_pos: Point) -> Optional[Point]:
        """Get a safe random position for lightning teleport"""
        safe_positions = []
        
        # Find all safe positions (not on snake, food, or edges)
        for x in range(2, grid_size - 2):
            for y in range(2, grid_size - 2):
                point = Point(x, y)
                if point not in snake_body and point != food_pos:
                    # Check if surrounding cells are also safe
                    surrounding_safe = True
                    for dx in [-1, 0, 1]:
                        for dy in [-1, 0, 1]:
                            check_point = Point(x + dx, y + dy)
                            if check_point in snake_body:
                                surrounding_safe = False
                                break
                        if not surrounding_safe:
                            break
                    
                    if surrounding_safe:
                        safe_positions.append(point)
        
        return random.choice(safe_positions) if safe_positions else None
    
    def apply_bomb_effect(self, snake_head: Point, snake_body: List[Point]) -> List[Point]:
        """Apply bomb effect - clear 3x3 area around snake head"""
        segments_to_remove = []
        
        for i, segment in enumerate(snake_body[1:], 1):  # Skip head
            # Check if segment is within 3x3 area
            if abs(segment.x - snake_head.x) <= 1 and abs(segment.y - snake_head.y) <= 1:
                segments_to_remove.append(i)
        
        # Remove segments from tail to head to maintain indices
        for i in reversed(segments_to_remove):
            if i < len(snake_body):
                snake_body.pop(i)
        
        return snake_body
    
    def update_mirror_snake(self, snake_body: List[Point], direction: Point, 
                          grid_size: int) -> List[Point]:
        """Update mirror snake position"""
        if BonusFoodType.MIRROR not in self.active_powerups:
            return []
        
        # Initialize mirror snake if empty
        if not self.mirror_snake_positions:
            # Start mirror snake at opposite corner
            head = snake_body[0]
            mirror_x = grid_size - 1 - head.x
            mirror_y = grid_size - 1 - head.y
            self.mirror_snake_positions = [Point(mirror_x, mirror_y)]
        else:
            # Move mirror snake in opposite direction
            new_head = Point(
                self.mirror_snake_positions[0].x - direction.x,
                self.mirror_snake_positions[0].y - direction.y
            )
            
            # Wrap around edges
            new_head.x = new_head.x % grid_size
            new_head.y = new_head.y % grid_size
            
            self.mirror_snake_positions.insert(0, new_head)
            if len(self.mirror_snake_positions) > 5:  # Keep mirror snake short
                self.mirror_snake_positions.pop()
        
        return self.mirror_snake_positions
    
    def get_active_effects(self) -> dict:
        """Get information about all active power-ups"""
        effects = {
            "speed_multiplier": self.speed_multiplier,
            "points_multiplier": self.points_multiplier,
            "invincible": self.invincible,
            "can_pass_self": self.can_pass_self,
            "magnet_active": self.magnet_active,
            "active_powerups": []
        }
        
        for power_type, powerup in self.active_powerups.items():
            effect_info = {
                "type": power_type.value,
                "time_remaining": powerup.get_time_remaining(),
                "count_remaining": powerup.count if powerup.count > 0 else 0
            }
            effects["active_powerups"].append(effect_info)
        
        return effects