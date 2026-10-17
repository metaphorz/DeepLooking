"""
Add a submission ZIP from the staging page (stage.html) to a gallery.

Usage:
    python3 import_submission.py <zip> --gallery <GalleryFolder> [--id <image_id>] [--replace]
    python3 import_submission.py <zip> --new-gallery "Name" --author "Author(s)" [--gallery <Folder>]

Checks the ZIP, copies its image directory into galleries/<GalleryFolder>/<id>/, appends
<id> to that gallery's gallery.json, and for a new gallery adds it to galleries.json.
Refuses to overwrite an existing image directory unless --replace is given.
submission.json is kept next to the manifest as a record of who made it and how.
Nothing is committed: look it over (./start), then commit and push.

Paul Fishwick and Claude Code
"""
import argparse
import io
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).parent
GALLERIES = ROOT / "galleries"


def camel(s):
    """"Roger Malina and Tina Chen" -> "RogerMalinaAndTinaChen" """
    return "".join(w[:1].upper() + w[1:] for w in re.split(r"[^A-Za-z0-9]+", s) if w)


def rule_box(rule):
    box = {c: [0, 255] for c in "rgb"}
    for k, v in rule.items():
        c, op = k[0], k[2:]
        if op == "gt":
            box[c][0] = max(box[c][0], int(v) + 1)
        else:
            box[c][1] = min(box[c][1], int(v) - 1)
    return box


def valid_rule(rule):
    return (isinstance(rule, dict) and rule and all(
        re.fullmatch(r"[rgb]_(gt|lt)", k) and isinstance(v, (int, float)) for k, v in rule.items()))


def rules_overlap(a, b):
    ba, bb = rule_box(a), rule_box(b)
    return all(max(ba[c][0], bb[c][0]) <= min(ba[c][1], bb[c][1]) for c in "rgb")


def read_zip(path):
    """Return (files {relative path: bytes}, manifest, submission or None)."""
    with zipfile.ZipFile(path) as z:
        names = [n for n in z.namelist() if not n.endswith("/") and not n.startswith("__MACOSX/")]
        manifests = sorted((n for n in names if n == "manifest.json" or n.endswith("/manifest.json")), key=len)
        if not manifests:
            sys.exit("This ZIP has no manifest.json, so it is not a Deep Looking submission.")
        prefix = manifests[0][: -len("manifest.json")]
        files = {}
        for n in names:
            if n.startswith(prefix):
                rel = n[len(prefix):]
                if rel.startswith("/") or ".." in Path(rel).parts:
                    sys.exit(f"Unsafe path in ZIP: {n}")
                files[rel] = z.read(n)
    manifest = json.loads(files["manifest.json"])
    submission = json.loads(files["submission.json"]) if "submission.json" in files else None
    return files, manifest, submission


def front_matter(text):
    meta = {}
    for line in text.split("\n"):
        if not line.strip():
            break
        key, sep, val = line.partition(":")
        if sep:
            meta[key.strip()] = val.strip()
    return meta


def check(files, m):
    """Problems that block an import, and warnings to read."""
    errors, warnings = [], []
    for k in ("id", "title", "image", "mask"):
        if not m.get(k):
            errors.append(f'manifest.json has no "{k}".')
    sizes = {}
    for k in ("image", "mask"):
        name = m.get(k)
        if name and name not in files:
            errors.append(f"Missing {k} file {name}.")
        elif name:
            try:
                sizes[k] = Image.open(io.BytesIO(files[name])).size
            except Exception:
                errors.append(f"{name} is not a readable image.")
    if m.get("segments") and len(set(sizes.values())) > 1:
        errors.append(f"Mask is {sizes['mask']} but the image is {sizes['image']}; hover would be misaligned.")
    segs = m.get("segments", [])
    for i, s in enumerate(segs):
        if not valid_rule(s.get("colorRule")):
            errors.append(f'"{s.get("label")}" has no valid colorRule.')
        for o in segs[i + 1:]:
            if s.get("label") == o.get("label"):
                errors.append(f'Two segments are labelled "{s["label"]}".')
            if valid_rule(s.get("colorRule")) and valid_rule(o.get("colorRule")) and rules_overlap(s["colorRule"], o["colorRule"]):
                errors.append(f'colorRules of "{s["label"]}" and "{o["label"]}" overlap.')
    lens_files = [(s["label"], f'{s["dir"]}/{lens}', f'{s["dir"]}.md') for s in segs for lens in s.get("lenses", [])]
    lens_files += [("Whole image", f"wholeimage/{lens}", "wholeimage.md") for lens in m.get("imageLenses", [])]
    for where, d, md in lens_files:
        p = f"{d}/{md}"
        if p not in files:
            errors.append(f"{where}: {p} missing.")
            continue
        text = files[p].decode("utf-8", "replace")
        meta = front_matter(text)
        body = text.split("\n\n", 1)[1].strip() if "\n\n" in text else ""
        if not meta.get("title"):
            warnings.append(f"{where} / {d.split('/')[-1]}: no title.")
        if not body:
            warnings.append(f"{where} / {d.split('/')[-1]}: no text.")
        if meta.get("image") and f"{d}/{meta['image']}" not in files:
            errors.append(f"{where}: image {d}/{meta['image']} missing.")
    return errors, warnings


def main():
    ap = argparse.ArgumentParser(description="Add a stage.html submission ZIP to a gallery.")
    ap.add_argument("zip", type=Path)
    ap.add_argument("--gallery", help="gallery folder under galleries/ (existing, or the folder for --new-gallery)")
    ap.add_argument("--new-gallery", metavar="NAME", help="create a new gallery with this display name")
    ap.add_argument("--author", help="author(s) of the new gallery")
    ap.add_argument("--id", help="image id (folder name) to use instead of the one in the ZIP")
    ap.add_argument("--replace", action="store_true", help="overwrite an existing image directory")
    ap.add_argument("--check", action="store_true", help="only check the ZIP; change nothing")
    a = ap.parse_args()

    files, m, sub = read_zip(a.zip.expanduser())
    errors, warnings = check(files, m)
    print(f"Submission: {m.get('title')}  (id {m.get('id')})")
    if sub:
        print(f"  from {sub.get('contributor', '?')}, created {sub.get('created', '?')}")
        print(f"  suggested gallery: {sub.get('gallery')}")
    for w in warnings:
        print("  warning:", w)
    for e in errors:
        print("  ERROR:", e)
    if errors:
        sys.exit("Not imported. Fix the problems (e.g. open the ZIP in stage.html) and export again.")
    if a.check:
        print("Checks passed.")
        return

    image_id = a.id or m["id"]
    if not re.fullmatch(r"[a-z0-9_-]+", image_id):
        sys.exit(f'Image id "{image_id}" must be lowercase letters, digits, - or _ (use --id).')

    galleries_path = ROOT / "galleries.json"
    galleries = json.loads(galleries_path.read_text())
    if a.new_gallery:
        if not a.author:
            sys.exit("--new-gallery needs --author.")
        folder = a.gallery or camel(a.new_gallery) + "_" + camel(a.author)
        if any(g["id"] == folder for g in galleries) or (GALLERIES / folder).exists():
            sys.exit(f"Gallery {folder} already exists; use --gallery {folder} without --new-gallery.")
    else:
        if not a.gallery:
            sys.exit("Give --gallery <folder> (or --new-gallery NAME --author AUTHOR).")
        folder = a.gallery
        if not any(g["id"] == folder for g in galleries):
            sys.exit(f"No gallery {folder} in galleries.json. Known: {', '.join(g['id'] for g in galleries)}")

    gdir = GALLERIES / folder
    dest = gdir / image_id
    if dest.exists() and not a.replace:
        sys.exit(f"{dest.relative_to(ROOT)} already exists; add --replace to overwrite it.")

    if a.new_gallery:
        gdir.mkdir(parents=True)
        (gdir / "gallery.json").write_text("[]\n")
        galleries.append({"id": folder, "name": a.new_gallery, "author": a.author})
        galleries_path.write_text(json.dumps(galleries, indent=2, ensure_ascii=False) + "\n")
        print(f"Created gallery {folder} and added it to galleries.json")

    if dest.exists():
        shutil.rmtree(dest)
    m["id"] = image_id
    files["manifest.json"] = (json.dumps(m, indent=2, ensure_ascii=False) + "\n").encode()
    for rel, data in files.items():
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(data)

    gj = gdir / "gallery.json"
    ids = json.loads(gj.read_text())
    if image_id not in ids:
        ids.append(image_id)
        gj.write_text(json.dumps(ids) + "\n")
    print(f"Added {dest.relative_to(ROOT)} ({len(files)} files) and listed it in {gj.relative_to(ROOT)}")
    print("Next: ./start to look it over, then commit and push.")


if __name__ == "__main__":
    main()
