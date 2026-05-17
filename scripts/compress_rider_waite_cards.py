#!/usr/bin/env python3
"""
Compress public/cards/*.jpg and public/card-back.png for faster web delivery.

First run copies originals to card-backup-original/ (not deployed; gitignored).
Re-run is safe: backup is skipped if it already exists.

Restore:  npm run restore:cards
Requires: pip install pillow
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Missing Pillow. Install: pip install pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
CARDS_DIR = ROOT / "public" / "cards"
BACKUP_DIR = ROOT / "card-backup-original"
CARD_BACK = ROOT / "public" / "card-back.png"

MAX_EDGE = 1024
JPEG_QUALITY = 82


def backup_if_needed() -> None:
    backup_cards = BACKUP_DIR / "cards"
    backup_back = BACKUP_DIR / "card-back.png"
    if backup_cards.is_dir() and backup_back.is_file():
        print(f"Backup already exists: {BACKUP_DIR}/ (skipped copy)")
        return
    if not CARDS_DIR.is_dir():
        print(f"Missing {CARDS_DIR}", file=sys.stderr)
        sys.exit(1)
    if not CARD_BACK.is_file():
        print(f"Missing {CARD_BACK}", file=sys.stderr)
        sys.exit(1)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    if backup_cards.exists():
        shutil.rmtree(backup_cards)
    shutil.copytree(CARDS_DIR, backup_cards)
    shutil.copy2(CARD_BACK, backup_back)
    print(f"Backed up originals → {BACKUP_DIR}/")


def dir_size_mb(path: Path) -> float:
    total = sum(f.stat().st_size for f in path.rglob("*") if f.is_file())
    return total / (1024 * 1024)


def compress_jpegs() -> int:
    paths = sorted(CARDS_DIR.glob("*.jpg"))
    if len(paths) != 78:
        print(f"Warning: expected 78 JPGs, found {len(paths)}", file=sys.stderr)
    for p in paths:
        with Image.open(p) as img:
            rgb = img.convert("RGB")
            rgb.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
            rgb.save(p, "JPEG", quality=JPEG_QUALITY, optimize=True)
    return len(paths)


def compress_card_back() -> None:
    with Image.open(CARD_BACK) as img:
        w, h = img.size
        if max(w, h) > MAX_EDGE:
            img = img.copy()
            img.thumbnail((MAX_EDGE, MAX_EDGE), Image.Resampling.LANCZOS)
        img.save(CARD_BACK, "PNG", optimize=True, compress_level=9)


def main() -> None:
    before_cards = dir_size_mb(CARDS_DIR)
    before_back = CARD_BACK.stat().st_size / (1024 * 1024)

    backup_if_needed()
    n = compress_jpegs()
    compress_card_back()

    after_cards = dir_size_mb(CARDS_DIR)
    after_back = CARD_BACK.stat().st_size / (1024 * 1024)

    print(f"Compressed {n} card faces (max edge {MAX_EDGE}px, quality {JPEG_QUALITY})")
    print(f"  cards/: {before_cards:.1f} MB → {after_cards:.1f} MB")
    print(f"  card-back.png: {before_back:.2f} MB → {after_back:.2f} MB")
    print("To revert: npm run restore:cards")


if __name__ == "__main__":
    main()
