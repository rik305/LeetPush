#!/usr/bin/env python3
"""
Startup script for LeetCode Solution Saver
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import flask_cors
        print("✓ Python dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def create_icons():
    """Create extension icons if they don't exist"""
    icon_files = ["icon16.png", "icon48.png", "icon128.png"]
    
    if not all(os.path.exists(f) for f in icon_files):
        print("Creating extension icons...")
        if run_command("python create_icons.py", "Creating icons"):
            print("✓ Icons created successfully")
        else:
            print("⚠ Icons creation failed, but continuing...")

def main():
    print("LeetCode Solution Saver - Startup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create icons if needed
    create_icons()
    
    # Run setup if needed
    if not os.path.exists("leetcode_solutions"):
        print("\nFirst time setup...")
        if not run_command("python setup.py", "Running setup"):
            print("Setup failed. Please run setup.py manually.")
            sys.exit(1)
    
    print("\n" + "=" * 40)
    print("Starting backend server...")
    print("Server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 40)
    
    try:
        # Start the backend server
        subprocess.run([sys.executable, "leetcode_backend.py"])
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")

if __name__ == "__main__":
    main()
