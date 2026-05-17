#!/usr/bin/env python3
"""Restore public/cards and card-back.png from card-backup-original/."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CARDS_DIR = ROOT / "public" / "cards"
BACKUP_DIR = ROOT / "card-backup-original"
CARD_BACK = ROOT / "public" / "card-back.png"


def main() -> None:
    backup_cards = BACKUP_DIR / "cards"
    backup_back = BACKUP_DIR / "card-back.png"
    if not backup_cards.is_dir() or not backup_back.is_file():
        print(
            f"No backup at {BACKUP_DIR}/. Run npm run compress:cards first (creates backup).",
            file=sys.stderr,
        )
        sys.exit(1)

    if CARDS_DIR.exists():
        shutil.rmtree(CARDS_DIR)
    shutil.copytree(backup_cards, CARDS_DIR)
    shutil.copy2(backup_back, CARD_BACK)
    print(f"Restored originals from {BACKUP_DIR}/")


if __name__ == "__main__":
    main()
