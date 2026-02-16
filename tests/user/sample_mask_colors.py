"""
Sample the segmentation mask to find exact RGB values for each segment
and generate colorRules for the manifest.

Paul Fishwick and Claude Code
"""
import os
import json
from PIL import Image
from collections import Counter

MASK_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "segmentation_mask.png")

mask = Image.open(MASK_PATH).convert("RGB")
w, h = mask.size
print(f"Mask size: {w} x {h}")

# Count all unique colors
pixels = list(mask.getdata())
color_counts = Counter(pixels)

print(f"\nUnique colors: {len(color_counts)}")
print("\nTop colors (by pixel count):")
for color, count in color_counts.most_common(20):
    pct = 100.0 * count / len(pixels)
    print(f"  RGB({color[0]:3d}, {color[1]:3d}, {color[2]:3d})  →  {count:>8d} pixels  ({pct:5.1f}%)")

# Expected mapping based on visual inspection
segment_map = {
    "Yellow → Quinces": lambda r, g, b: r > 200 and g > 200 and b < 50,
    "Red → Apples": lambda r, g, b: r > 200 and g < 50 and b < 50,
    "Green → Small Birds": lambda r, g, b: r < 50 and g > 200 and b < 50,
    "Blue → Partridge": lambda r, g, b: r < 50 and g < 50 and b > 200,
    "Cyan → Cardoon": lambda r, g, b: r < 50 and g > 200 and b > 200,
    "Magenta → Root Vegetables": lambda r, g, b: r > 200 and g < 50 and b > 200,
    "White → Stone Ledge": lambda r, g, b: r > 200 and g > 200 and b > 200,
    "Black → Dark Void": lambda r, g, b: r < 50 and g < 50 and b < 50,
}

print("\n--- Segment Pixel Counts ---")
for name, test_fn in segment_map.items():
    count = sum(c for (r, g, b), c in color_counts.items() if test_fn(r, g, b))
    pct = 100.0 * count / len(pixels)
    print(f"  {name}: {count:>8d} pixels ({pct:5.1f}%)")

# Generate colorRules
print("\n--- Suggested colorRules for manifest.json ---")
rules = [
    {"label": "Quinces", "dir": "quinces", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_gt": 200, "g_gt": 200, "b_lt": 50}},
    {"label": "Apples", "dir": "apples", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_gt": 200, "g_lt": 50, "b_lt": 50}},
    {"label": "Small Birds", "dir": "smallbirds", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_lt": 50, "g_gt": 200, "b_lt": 50}},
    {"label": "Partridge", "dir": "partridge", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_lt": 50, "g_lt": 50, "b_gt": 200}},
    {"label": "Cardoon", "dir": "cardoon", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_lt": 50, "g_gt": 200, "b_gt": 200}},
    {"label": "Root Vegetables", "dir": "rootvegetables", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_gt": 200, "g_lt": 50, "b_gt": 200}},
    {"label": "Stone Ledge", "dir": "stoneledge", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_gt": 200, "g_gt": 200, "b_gt": 200}},
    {"label": "Dark Void", "dir": "darkvoid", "lenses": ["language", "art", "math", "engineering", "science", "history"],
     "colorRule": {"r_lt": 50, "g_lt": 50, "b_lt": 50}},
]

print(json.dumps(rules, indent=2))
