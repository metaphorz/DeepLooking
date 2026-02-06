"""
Use Nano Banana Pro (Gemini image model) to generate a segmentation mask image.
The mask is used directly as a pixel-lookup table for hover detection.
"""
import os
from google import genai
from google.genai import types
from PIL import Image

# Load API key
with open(os.path.expanduser("~/.env")) as f:
    for line in f:
        if line.startswith("VITE_GEMINI_API_KEY="):
            api_key = line.strip().split("=", 1)[1]
            break

client = genai.Client(api_key=api_key)

# Load artwork image
im = Image.open("artwork.jpeg")
w, h = im.size
print(f"Artwork size: {w} x {h}")

# Step 1: Generate segmentation mask image via Nano Banana
prompt = "create detailed segmentation of this image. Use flat solid colors only, no text or labels."

print("Requesting segmentation mask from Gemini image model...")

# Use Nano Banana Pro
models_to_try = ["gemini-3-pro-image-preview"]

for model_name in models_to_try:
    try:
        print(f"  Trying model: {model_name}")
        response = client.models.generate_content(
            model=model_name,
            contents=[prompt, im],
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE']
            )
        )

        # Extract and save the segmentation mask
        for part in response.parts:
            if part.inline_data is not None:
                mask_image = part.as_image()
                # Resize mask to match artwork dimensions for pixel-perfect alignment
                if hasattr(mask_image, 'size') and mask_image.size != (w, h):
                    print(f"  Mask is {mask_image.size}, resizing to {w}x{h}")
                    mask_image = mask_image.resize((w, h), Image.NEAREST)
                mask_image.save("outputs/segmentation_mask.png")
                print(f"  Saved segmentation mask")
                break
        else:
            print(f"  No image in response from {model_name}")
            continue
        break  # Success
    except Exception as e:
        print(f"  Error with {model_name}: {e}")
        continue

# Step 2: Generate poem-inspired images for each region
poems = {
    "boardwalk": """My breath, turned smoke, is rising on the air.
In the background, not completely in focus,
lies the resort itself (the sea unseen),
a mise-en-scène of small shops, baths, hotels,
lining the boardwalk; a few scattered figures,
fading to haze, to blur, loom in the distance,
early walkers like us, although it seems
we have the boardwalk largely to ourselves.""",
    "marsh": """Where band-neck'd partridges roost in a ring on the ground with their heads out,
Where burial coaches enter the arch'd gates of a cemetery,
Where winter wolves bark amid wastes of snow and icicled trees,
Where the yellow-crown'd heron comes to the edge of the marsh at night and feeds upon small crabs,
Where the splash of swimmers and divers cools the warm noon""",
    "sky": """Of Chambers as the Cedars –
Impregnable of eye –
And for an everlasting Roof
The Gambrels of the Sky""",
    "water": """Water, water, every where,
And all the boards did shrink;
Water, water, every where,
Nor any drop to drink"""
}

print("\nGenerating poem-inspired images...")
for keyword, poem_text in poems.items():
    outpath = f"outputs/poem_{keyword}.png"
    prompt = f"Create a painterly artistic illustration inspired by this poem:\n{poem_text}"
    print(f"  Generating image for '{keyword}'...")
    try:
        response = client.models.generate_content(
            model="gemini-3-pro-image-preview",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=['IMAGE']
            )
        )
        for part in response.parts:
            if part.inline_data is not None:
                poem_img = part.as_image()
                poem_img.save(outpath)
                print(f"  Saved {outpath}")
                break
        else:
            print(f"  No image in response for {keyword}")
    except Exception as e:
        print(f"  Error generating {keyword}: {e}")

print("\nDone. The mask image is used directly as a pixel-lookup table in index.html.")
print("Color mapping: Black=Sky, Green=Vegetation, Red=Boardwalk, Blue=Water")
print("Poem images saved to outputs/poem_*.png")
