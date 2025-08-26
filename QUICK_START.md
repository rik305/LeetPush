# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start the System
```bash
python start.py
```
This will:
- Create extension icons
- Set up the Git repository
- Start the backend server

### 3. Load Chrome Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select this folder
4. The extension icon should appear in your toolbar

## 🎯 How It Works

1. **Solve a LeetCode problem** as usual
2. **Submit your solution** - when it's accepted:
   - ✅ Extension detects success
   - 💾 Code is automatically saved to `leetcode_solutions/solutions.py`
   - 🔄 Git commit and push happens automatically
   - 📊 Statistics are updated

## 📁 What Gets Created

```
leetcode_solutions/
├── solutions.py           # Your saved solutions
├── solutions_history.json # Metadata
└── .git/                 # Git repository
```

## 🔧 Troubleshooting

**Extension not working?**
- Check backend is running: `python leetcode_backend.py`
- Test connection: Click extension icon → "Test Backend Connection"

**Git push fails?**
- Set up remote: `cd leetcode_solutions && git remote add origin <your-repo>`

**Need help?**
- Run tests: `python test_extension.py`
- Check logs in browser console (F12)

## 🎉 You're Ready!

Go solve some LeetCode problems - your solutions will be automatically saved! 🚀
