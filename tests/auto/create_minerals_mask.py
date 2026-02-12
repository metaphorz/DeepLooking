"""Create a blank (all black) segmentation mask for minerals placeholder."""
from PIL import Image

im = Image.open("images/minerals/minerals.jpeg")
w, h = im.size
print(f"Minerals image size: {w} x {h}")

mask = Image.new("RGB", (w, h), (0, 0, 0))
mask.save("images/minerals/segmentation_mask.png")
print(f"Saved blank mask: images/minerals/segmentation_mask.png")
