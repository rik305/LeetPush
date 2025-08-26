// Popup script for LeetCode Solution Saver
document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const testConnectionBtn = document.getElementById('testConnection');
    const viewSolutionsBtn = document.getElementById('viewSolutions');
    const todayCountSpan = document.getElementById('todayCount');
    const totalCountSpan = document.getElementById('totalCount');

    // Test backend connection
    testConnectionBtn.addEventListener('click', async () => {
        try {
            statusDiv.textContent = 'Testing connection...';
            statusDiv.className = 'status info';
            
            const response = await fetch('http://localhost:9999/health');
            const result = await response.json();
            
            if (response.ok) {
                statusDiv.textContent = 'Backend connected successfully!';
                statusDiv.className = 'status success';
            } else {
                throw new Error(result.error || 'Connection failed');
            }
        } catch (error) {
            statusDiv.textContent = 'Backend connection failed: ' + error.message;
            statusDiv.className = 'status error';
        }
    });

    // View saved solutions
    viewSolutionsBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('http://localhost:9999/solutions');
    
            if (response.ok) {
                // Only check that the server responded
                chrome.tabs.create({ url: 'http://localhost:9999/solutions' });
            } else {
                statusDiv.textContent = 'Failed to load solutions: ' + response.status;
                statusDiv.className = 'status error';
            }
        } catch (error) {
            statusDiv.textContent = 'Failed to load solutions: ' + error.message;
            statusDiv.className = 'status error';
        }
    });

    // Load statistics
    async function loadStats() {
        try {
            const response = await fetch('http://localhost:9999/stats');
            const result = await response.json();
            
            if (response.ok) {
                todayCountSpan.textContent = result.today_count || 0;
                totalCountSpan.textContent = result.total_count || 0;
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    // Load stats on popup open
    loadStats();
});
