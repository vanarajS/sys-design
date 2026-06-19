"""Bonus food system for Snake Game"""

import random
from enum import Enum
from typing import Optional, List, Tuple
from snake_game.core.snake_game import Point


class BonusFoodType(Enum):
    """Types of bonus foods with their effects"""
    LIGHTNING = "lightning"     # Teleport to random safe location
    SHIELD = "shield"           # 5 seconds invincibility
    GHOST = "ghost"             # 5 seconds pass through self
    MAGNET = "magnet"           # Next 3 foods auto-attract
    FREEZE = "freeze"           # 50% speed for 8 seconds
    RAINBOW = "rainbow"         # 2x points for next 5 foods
    BOMB = "bomb"               # Clear 3x3 area
    MIRROR = "mirror"           # Mirror snake for 10 seconds


class BonusFood:
    """Represents a bonus food item with special effects"""
    
    def __init__(self, grid_size: int):
        self.grid_size = grid_size
        self.position: Optional[Point] = None
        self.type: Optional[BonusFoodType] = None
        self.spawn_time: float = 0
        self.duration: float = 5.0  # Bonus food appears for 5 seconds
        
        # Visual properties for each bonus type
        self.bonus_properties = {
            BonusFoodType.LIGHTNING: {
                "color": "#FFD700",
                "symbol": "⚡",
                "effect_duration": 0,  # Instant effect
                "description": "Teleport to safety"
            },
            BonusFoodType.SHIELD: {
                "color": "#87CEEB",
                "symbol": "🛡️",
                "effect_duration": 5000,  # 5 seconds
                "description": "Invincibility"
            },
            BonusFoodType.GHOST: {
                "color": "#F8F8FF",
                "symbol": "👻",
                "effect_duration": 5000,  # 5 seconds
                "description": "Pass through self"
            },
            BonusFoodType.MAGNET: {
                "color": "#DC143C",
                "symbol": "🧲",
                "effect_duration": 0,  # Effect lasts for 3 foods
                "description": "Auto-attract food"
            },
            BonusFoodType.FREEZE: {
                "color": "#00CED1",
                "symbol": "❄️",
                "effect_duration": 8000,  # 8 seconds
                "description": "Slow motion"
            },
            BonusFoodType.RAINBOW: {
                "color": "#FF69B4",
                "symbol": "🌈",
                "effect_duration": 0,  # Effect lasts for 5 foods
                "description": "Double points"
            },
            BonusFoodType.BOMB: {
                "color": "#FF4500",
                "symbol": "💣",
                "effect_duration": 0,  # Instant effect
                "description": "Clear area"
            },
            BonusFoodType.MIRROR: {
                "color": "#C0C0C0",
                "symbol": "🪞",
                "effect_duration": 10000,  # 10 seconds
                "description": "Mirror snake"
            }
        }
    
    def spawn(self, snake_body: List[Point], regular_food_pos: Point) -> bool:
        """Spawn a bonus food at a random location"""
        # Choose random bonus type
        self.type = random.choice(list(BonusFoodType))
        
        # Find available positions (not on snake or regular food)
        available_positions = []
        for x in range(self.grid_size):
            for y in range(self.grid_size):
                point = Point(x, y)
                if point not in snake_body and point != regular_food_pos:
                    available_positions.append(point)
        
        if available_positions:
            self.position = random.choice(available_positions)
            import time
            self.spawn_time = time.time()
            return True
        return False
    
    def is_expired(self) -> bool:
        """Check if bonus food has expired"""
        if self.position is None:
            return True
        import time
        return (time.time() - self.spawn_time) > self.duration
    
    def consume(self) -> Tuple[BonusFoodType, dict]:
        """Consume the bonus food and return its type and properties"""
        if self.type:
            bonus_type = self.type
            properties = self.bonus_properties[bonus_type].copy()
            self.position = None
            self.type = None
            return bonus_type, properties
        return None, {}
    
    def get_time_remaining(self) -> float:
        """Get time remaining before bonus expires"""
        if self.position is None:
            return 0
        import time
        elapsed = time.time() - self.spawn_time
        return max(0, self.duration - elapsed)
    
    def get_info(self) -> dict:
        """Get current bonus food information"""
        if self.position and self.type:
            return {
                "position": [self.position.x, self.position.y],
                "type": self.type.value,
                "properties": self.bonus_properties[self.type],
                "time_remaining": self.get_time_remaining()
            }
        return None