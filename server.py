#!/usr/bin/env python3
"""
Production server for Twitter AI Reply Assistant
Optimized for Render.com deployment
"""

import os
import sys
sys.path.append('.')

# Import the Flask app from minimal-model.py
import importlib.util
spec = importlib.util.spec_from_file_location("minimal_model", "minimal-model.py")
minimal_model = importlib.util.module_from_spec(spec)
spec.loader.exec_module(minimal_model)
app = minimal_model.app

def run_render_server():
    """Run the production server for Render.com"""
    
    # Get port from environment (required by Render)
    port = int(os.environ.get('PORT', 8000))
    
    print(f"🚀 Starting Render production server on port {port}")
    from waitress import serve
    serve(app, host='0.0.0.0', port=port)

if __name__ == '__main__':
    run_render_server()
