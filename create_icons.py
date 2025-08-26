#!/usr/bin/env python3
"""
Create simple placeholder icons for the Chrome extension
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, text="LC"):
    """Create a simple icon with the given size"""
    # Create a new image with a blue background
    img = Image.new('RGB', (size, size), color='#007bff')
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font, fallback to basic if not available
    try:
        font_size = size // 3
        font = ImageFont.truetype("Arial", font_size)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position to center it
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw white text
    draw.text((x, y), text, fill='white', font=font)
    
    return img

def main():
    """Create icons for different sizes"""
    sizes = [16, 48, 128]
    
    for size in sizes:
        icon = create_icon(size)
        filename = f"icon{size}.png"
        icon.save(filename)
        print(f"Created {filename}")

if __name__ == "__main__":
    main()
