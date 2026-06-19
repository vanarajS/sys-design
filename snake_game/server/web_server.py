"""Web server for Snake Game using Flask"""

import os
from flask import Flask, render_template, send_from_directory
from snake_game.config.settings import Settings


class SnakeGameServer:
    """Main web server for the Snake Game"""
    
    def __init__(self, port: int = 5000):
        self.port = port
        self.app = self._create_app()
        self._setup_routes()
    
    def _create_app(self) -> Flask:
        """Create and configure Flask app"""
        server_dir = os.path.dirname(os.path.abspath(__file__))
        static_dir = os.path.join(server_dir, '..', 'static')
        templates_dir = os.path.join(server_dir, '..', 'templates')
        
        app = Flask(__name__, 
                   static_folder=static_dir,
                   template_folder=templates_dir)
        return app
    
    def _setup_routes(self):
        """Setup URL routes for the application"""
        
        @self.app.route('/')
        def index():
            """Serve the main game page"""
            from snake_game.config.settings import Settings
            settings = Settings()
            return render_template('index.html', colors=settings.colors)
        
        @self.app.route('/api/colors')
        def get_colors():
            """API endpoint for color scheme"""
            from snake_game.config.settings import Settings
            settings = Settings()
            return settings.colors
    
    def start(self):
        """Start the web server"""
        print(f"🐍 Snake Game server starting on http://localhost:{self.port}")
        self.app.run(debug=True, port=self.port, host="0.0.0.0")