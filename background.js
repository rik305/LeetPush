// Background script for LeetCode Solution Saver
class BackgroundHandler {
    constructor() {
        this.backendUrl = 'http://localhost:9999';
        this.init();
    }

    init() {
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'solutionCompleted') {
                this.handleSolutionCompleted(request.data, sendResponse);
                return true; // Keep message channel open for async response
            }
        });

        console.log('LeetCode Solution Saver: Background script initialized');
    }

    async handleSolutionCompleted(solutionData, sendResponse) {
        try {
            console.log('Processing solution:', solutionData);
            
            // Send solution data to backend
            const response = await fetch(`${this.backendUrl}/save-solution`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(solutionData)
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                sendResponse({ success: true, message: result.message });
            } else {
                sendResponse({ success: false, error: result.error || 'Failed to save solution' });
            }
        } catch (error) {
            console.error('Error saving solution:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
}

// Initialize background handler
new BackgroundHandler();
