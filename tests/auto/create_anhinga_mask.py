"""
Use Nano Banana Pro (Gemini image model) to generate a full segmentation mask for anhinga.
Ask for all segments (bird, grass, pond/water) with distinct colors, labels, and color ranges.
"""
import io
import os
import time
from google import genai
from google.genai import types
from PIL import Image, ImageOps

# Load API key
with open(os.path.expanduser("~/.env")) as f:
    for line in f:
        if line.startswith("GEMINI_API_KEY="):
            api_key = line.strip().split("=", 1)[1]
            break

client = genai.Client(api_key=api_key)

# Load anhinga image and apply EXIF orientation
im = Image.open("images/anhinga/anhinga.jpeg")
im = ImageOps.exif_transpose(im)
w, h = im.size
print(f"Anhinga image size (after EXIF transpose): {w} x {h}")

prompt = (
    "Create a detailed segmentation mask of this photograph. "
    "Identify all major regions and paint each with a distinct flat solid color. "
    "The regions should include the anhinga bird, the grass/vegetation, "
    "and any water/pond visible. Cover the entire image — no region should be left black. "
    "Use flat solid colors only. Do not include any text, labels, or outlines in the image. "
    "After generating the image, list each segment with its label, RGB color, and a colorRule "
    "with threshold values (r_gt, r_lt, g_gt, g_lt, b_gt, b_lt) that uniquely identify that color."
)

print("Requesting segmentation mask from Gemini (Nano Banana Pro)...")

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
for part in response.parts:
    if part.inline_data is not None:
        image_data = part.inline_data.data
        mask_image = Image.open(io.BytesIO(image_data))
        print(f"  Received mask: {mask_image.size}")
        if mask_image.size != (w, h):
            print(f"  Resizing to {w}x{h}")
            mask_image = mask_image.resize((w, h), Image.NEAREST)
        mask_image.save("images/anhinga/segmentation_mask.png")
        print(f"  Saved images/anhinga/segmentation_mask.png")
    elif part.text:
        print("\n--- Gemini segment labels and color ranges ---")
        print(part.text)
        print("--- End ---")

print("\nDone.")
