#!/usr/bin/env python3
"""Run the Snake Game server"""

import sys
import os

# Add the snake_game directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from snake_game.main import main

if __name__ == "__main__":
    print("Starting Snake Game on port 5000...")
    main()
