"""
Generate segmentation mask for Sánchez Cotán's "Still Life with Game, Vegetables and Fruit" (1602)
using Nano Banana Pro (Gemini gemini-3-pro-image-preview).

Requests 8 segments: quinces, apples, small birds, partridge, cardoon,
root vegetables, stone ledge, and dark void/background.

Outputs:
  - tests/user/segmentation_mask.png  (resized to match artwork)
  - tests/user/segmentation_metadata.txt  (labels, colors, colorRules)

Paul Fishwick and Claude Code
"""
import io
import os
import time
from google import genai
from google.genai import types
from PIL import Image, ImageOps

# Paths
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMAGE_PATH = os.path.join(PROJECT_ROOT, "temp",
    "Juan_Sánchez_Cotán_-_Still_Life_with_Game,_Vegetables_and_Fruit,_1602.jpg")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "tests", "user")
MASK_PATH = os.path.join(OUTPUT_DIR, "segmentation_mask.png")
META_PATH = os.path.join(OUTPUT_DIR, "segmentation_metadata.txt")

# Load API key
with open(os.path.expanduser("~/.env")) as f:
    for line in f:
        if line.startswith("GEMINI_API_KEY="):
            api_key = line.strip().split("=", 1)[1]
            break

client = genai.Client(api_key=api_key)

# Load artwork
im = Image.open(IMAGE_PATH)
im = ImageOps.exif_transpose(im)
w, h = im.size
print(f"Artwork size: {w} x {h}")

prompt = (
    "Create a detailed segmentation mask of this 1602 still life painting by Juan Sánchez Cotán. "
    "Identify and paint each of these 8 regions with a distinct flat solid color:\n"
    "1. Quinces (the yellow citrus fruits hanging upper-left with leaves and branch)\n"
    "2. Apples (the red/green cluster of apples hanging on strings, center-left)\n"
    "3. Small Birds (ALL small dead birds in the painting — both the ones hanging on strings at upper-center AND the group of small birds tied to a stick/pole resting on the stone ledge at lower-left, below the quinces)\n"
    "4. Partridge (the large game bird hanging in the center)\n"
    "5. Cardoon (the large dramatic thistle/celery-like vegetable on the right)\n"
    "6. Root Vegetables (carrots, parsnips, and turnip lying on the stone ledge)\n"
    "7. Stone Ledge (the stone windowsill/frame at bottom and sides)\n"
    "8. Dark Void (the black background behind the hanging objects)\n\n"
    "Cover the entire image — every pixel must belong to one of these 8 regions. "
    "Use flat solid colors only with maximum contrast between regions. "
    "Do not include any text, labels, or outlines in the image.\n\n"
    "After generating the image, list each segment with:\n"
    "- Label name\n"
    "- The exact RGB color used (e.g. R=255, G=0, B=0)\n"
    "- A colorRule using threshold values (r_gt, r_lt, g_gt, g_lt, b_gt, b_lt) "
    "that uniquely identifies that color from all other segment colors."
)

print("Requesting segmentation mask from Nano Banana Pro...")
print("(This may take 30-60 seconds)")

response = None
for attempt in range(3):
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt, im],
            config=types.GenerateContentConfig(
                response_modalities=['TEXT', 'IMAGE']
            )
        )
        break
    except Exception as e:
        print(f"  Attempt {attempt+1} failed: {e}")
        if attempt < 2:
            print("  Waiting 60 seconds before retry...")
            time.sleep(60)

if response is None:
    print("ERROR: All attempts failed")
    exit(1)

# Extract image and text from response
os.makedirs(OUTPUT_DIR, exist_ok=True)
mask_saved = False
text_output = ""

for part in response.parts:
    if part.inline_data is not None:
        image_data = part.inline_data.data
        mask_image = Image.open(io.BytesIO(image_data))
        print(f"  Received mask: {mask_image.size}")
        if mask_image.size != (w, h):
            print(f"  Resizing from {mask_image.size} to {w}x{h}")
            mask_image = mask_image.resize((w, h), Image.NEAREST)
        mask_image.save(MASK_PATH)
        print(f"  Saved: {MASK_PATH}")
        mask_saved = True
    elif part.text:
        text_output += part.text

if text_output:
    print("\n--- Segment Labels and Color Rules ---")
    print(text_output)
    print("--- End ---")
    with open(META_PATH, "w") as f:
        f.write(text_output)
    print(f"  Saved: {META_PATH}")

if not mask_saved:
    print("WARNING: No mask image received in response!")
    print("Full response parts:")
    for i, part in enumerate(response.parts):
        print(f"  Part {i}: text={bool(part.text)}, inline_data={bool(part.inline_data)}")

print("\nDone.")
