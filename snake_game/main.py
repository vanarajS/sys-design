#!/usr/bin/env python3
"""Main entry point for Snake Game server on port 5000"""

from snake_game.config.settings import Settings
from snake_game.server.web_server import SnakeGameServer


def main():
    """Start the snake game server"""
    settings = Settings()
    server = SnakeGameServer(settings.port)
    server.start()


if __name__ == "__main__":
    print("Starting Snake Game on port 5000...")
    main()