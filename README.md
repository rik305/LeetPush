# LeetCode Solution Saver Chrome Extension

A Chrome extension that automatically detects when you successfully complete a LeetCode problem and saves your solution to a Python file, then pushes it to Git.

## Features

- 🔍 **Automatic Detection**: Detects when a LeetCode problem is successfully completed
- 💾 **Auto-Save**: Automatically saves your solution code to a Python file
- 📝 **Smart Formatting**: Adds question number, title, and timestamp as comments
- 🔄 **Git Integration**: Automatically commits and pushes solutions to Git
- 📊 **Statistics**: Track your progress with daily and total solution counts
- 🌐 **Web Interface**: View all saved solutions in a web browser

## Installation

### 1. Clone or Download this Repository

```bash
git clone <repository-url>
cd leetcode-solution-saver
```

### 2. Run the Setup Script

```bash
python setup.py
```

This will:
- Install required Python dependencies
- Create a `leetcode_solutions` directory
- Initialize a Git repository
- Set up the necessary files

### 3. Start the Backend Server

```bash
python leetcode_backend.py
```

The server will start on `http://localhost:5000`

### 4. Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this directory (the one containing `manifest.json`)
5. The extension should now appear in your extensions list

## Usage

### Basic Usage

1. **Start the backend server** (if not already running):
   ```bash
   python leetcode_backend.py
   ```

2. **Go to LeetCode** and solve a problem as usual

3. **Submit your solution** - when it's accepted, the extension will automatically:
   - Detect the successful submission
   - Extract your code
   - Save it to `leetcode_solutions/solutions.py`
   - Commit and push to Git

### Extension Popup

Click the extension icon to:
- Test backend connection
- View saved solutions
- See statistics (solutions saved today, total solutions)

### Viewing Solutions

- **Web Interface**: Visit `http://localhost:5000/solutions` to view all solutions in a formatted web page
- **Direct File**: Check `leetcode_solutions/solutions.py` for the raw Python file

## File Structure

```
leetcode-solution-saver/
├── manifest.json              # Chrome extension manifest
├── content.js                 # Content script for LeetCode detection
├── background.js              # Background script for communication
├── popup.html                 # Extension popup interface
├── popup.js                   # Popup functionality
├── leetcode_backend.py        # Flask backend server
├── requirements.txt           # Python dependencies
├── setup.py                   # Setup script
├── README.md                  # This file
└── leetcode_solutions/        # Generated solutions directory
    ├── solutions.py           # All saved solutions
    ├── solutions_history.json # Solution metadata
    └── .git/                  # Git repository
```

## Configuration

### Git Repository Setup

After running `setup.py`, you can connect to a remote repository:

```bash
cd leetcode_solutions
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Customizing Solution Format

Edit the `get_solution_template()` function in `leetcode_backend.py` to customize how solutions are formatted.

## Troubleshooting

### Extension Not Detecting Submissions

1. Make sure the backend server is running (`python leetcode_backend.py`)
2. Check the browser console for any error messages
3. Verify the extension is enabled and has permissions for LeetCode

### Git Push Fails

1. Ensure you have a remote repository configured
2. Check your Git credentials are set up correctly
3. Verify you have write access to the repository

### Backend Connection Issues

1. Check that the Flask server is running on port 5000
2. Verify no firewall is blocking localhost connections
3. Check the browser console for CORS errors

## Development

### Adding New Features

- **Content Script** (`content.js`): Modify LeetCode detection logic
- **Background Script** (`background.js`): Change communication with backend
- **Backend** (`leetcode_backend.py`): Add new API endpoints or modify file handling

### Testing

1. Make changes to the extension files
2. Go to `chrome://extensions/`
3. Click the refresh icon on your extension
4. Test on LeetCode

## Requirements

- Python 3.7+
- Chrome browser
- Git installed and configured
- Internet connection for LeetCode access

## Dependencies

- Flask (web server)
- Flask-CORS (cross-origin requests)
- Git (version control)

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues and enhancement requests!
