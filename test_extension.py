#!/usr/bin/env python3
"""
Test script for LeetCode Solution Saver
"""

import requests
import json
import time

def test_backend_health():
    """Test if the backend server is running"""
    try:
        response = requests.get('http://localhost:9999/health')
        if response.status_code == 200:
            print("✓ Backend server is running")
            return True
        else:
            print(f"✗ Backend server returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("✗ Backend server is not running")
        print("Please start the server with: python leetcode_backend.py")
        return False

def test_save_solution():
    """Test saving a solution"""
    test_solution = {
        "questionNumber": "1",
        "questionTitle": "Two Sum",
        "questionSlug": "two-sum",
        "code": """def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []""",
        "timestamp": "2024-01-01T12:00:00Z",
        "url": "https://leetcode.com/problems/two-sum/"
    }
    
    try:
        response = requests.post(
            'http://localhost:9999/save-solution',
            json=test_solution,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✓ Solution save test passed")
                return True
            else:
                print(f"✗ Solution save failed: {result.get('error')}")
                return False
        else:
            print(f"✗ Solution save returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Solution save test failed: {e}")
        return False

def test_get_stats():
    """Test getting statistics"""
    try:
        response = requests.get('http://localhost:9999/stats')
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✓ Stats retrieval test passed")
                print(f"  Total solutions: {result.get('total_count', 0)}")
                print(f"  Today's solutions: {result.get('today_count', 0)}")
                return True
            else:
                print(f"✗ Stats retrieval failed: {result.get('error')}")
                return False
        else:
            print(f"✗ Stats retrieval returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Stats retrieval test failed: {e}")
        return False

def main():
    print("LeetCode Solution Saver - Extension Test")
    print("=" * 40)
    
    # Test backend health
    if not test_backend_health():
        return
    
    # Test solution saving
    if not test_save_solution():
        return
    
    # Test stats retrieval
    if not test_get_stats():
        return
    
    print("\n" + "=" * 40)
    print("✓ All tests passed!")
    print("\nExtension is ready to use.")
    print("Next steps:")
    print("1. Load the extension in Chrome")
    print("2. Go to LeetCode and solve a problem")
    print("3. Submit your solution - it should be auto-saved!")

if __name__ == "__main__":
    main()
