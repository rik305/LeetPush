#!/usr/bin/env python3
"""
Setup script for LeetCode Solution Saver
"""

import os
import subprocess
import sys

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"Running: {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed: {e}")
        print(f"Error output: {e.stderr}")
        return False

def setup_git_repo():
    """Initialize Git repository in leetcode_solutions directory"""
    solutions_dir = "leetcode_solutions"
    
    if not os.path.exists(solutions_dir):
        os.makedirs(solutions_dir)
    
    os.chdir(solutions_dir)
    
    # Initialize Git repository
    if not run_command("git init", "Initializing Git repository"):
        return False
    
    # Create .gitignore
    with open(".gitignore", "w") as f:
        f.write("# Python\n")
        f.write("__pycache__/\n")
        f.write("*.pyc\n")
        f.write("*.pyo\n")
        f.write("*.pyd\n")
        f.write(".Python\n")
        f.write("env/\n")
        f.write("venv/\n")
        f.write(".env\n")
        f.write(".venv\n")
    
    # Initial commit
    if not run_command("git add .", "Adding files to Git"):
        return False
    
    if not run_command('git commit -m "Initial commit"', "Making initial commit"):
        return False
    
    print("\nGit repository initialized successfully!")
    print("To connect to a remote repository, run:")
    print("  git remote add origin <your-repo-url>")
    print("  git push -u origin main")
    
    os.chdir("..")
    return True

def install_dependencies():
    """Install Python dependencies"""
    return run_command("pip install -r requirements.txt", "Installing Python dependencies")

def main():
    print("LeetCode Solution Saver Setup")
    print("=" * 40)
    
    # Install dependencies
    if not install_dependencies():
        print("Failed to install dependencies. Please check your Python environment.")
        sys.exit(1)
    
    # Setup Git repository
    if not setup_git_repo():
        print("Failed to setup Git repository.")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    print("Setup completed successfully!")
    print("\nNext steps:")
    print("1. Start the backend server: python leetcode_backend.py")
    print("2. Load the Chrome extension:")
    print("   - Open Chrome and go to chrome://extensions/")
    print("   - Enable 'Developer mode'")
    print("   - Click 'Load unpacked' and select this directory")
    print("3. Go to LeetCode and solve problems - solutions will be auto-saved!")

if __name__ == "__main__":
    main()
