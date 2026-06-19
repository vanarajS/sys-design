"""Configuration settings for the Snake Game"""

import os
from typing import Dict, Any


class Settings:
    """Server and game configuration settings"""
    
    def __init__(self):
        self.port = int(os.getenv("PORT", 5000))
        self.host = os.getenv("HOST", "localhost")
        self.debug = os.getenv("DEBUG", "false").lower() == "true"
        
        # Game settings
        self.grid_size = 20
        self.canvas_width = 600
        self.canvas_height = 600
        self.game_speed = 100  # milliseconds between moves
        
        # Cool color scheme - Neon cyberpunk palette
        self.colors = {
            "background": "#0a0a0a",
            "grid": "#1a1a2e",
            "snake_head": "#00ffff",
            "snake_body": "#0088cc",
            "food": "#ff00ff",
            "text": "#ffffff",
            "accent": "#ff006e",
            "power_up": "#fff700"
        }
    
    def get_color(self, name: str) -> str:
        """Get color by name"""
        return self.colors.get(name, "#ffffff")
