"""Extract local PDF text for editorial review; never generates or publishes lessons.

Requires PyMuPDF (python -m pip install pymupdf).
Run from the repository: python scripts/extract-course-pdfs.py
Sparse pages must be read visually before setting reviewed=true in the manifest.
"""
from pathlib import Path
import hashlib
import json
import pymupdf

root = Path(__file__).resolve().parent.parent / "content" / "sources"
output = root / "extracted"
output.mkdir(parents=True, exist_ok=True)
manifest_path = root / "manifest.json"
previous = {item["file"]: item for item in json.loads(manifest_path.read_text(encoding="utf-8"))} if manifest_path.exists() else {}
manifest = []
for pdf in sorted(root.rglob("*.pdf")):
    relative = pdf.relative_to(root).as_posix()
    digest = hashlib.sha256(pdf.read_bytes()).hexdigest()
    # Hash suffix avoids collisions between equal filenames in different subjects.
    text_path = output / (pdf.stem + "-" + hashlib.sha256(relative.encode()).hexdigest()[:8] + ".txt")
    with pymupdf.open(pdf) as document:
        pages = [page.get_text(sort=True) for page in document]
    text = "\n\n".join(f"--- PAGE {index + 1} ---\n{page}" for index, page in enumerate(pages))
    old = previous.get(relative, {})
    # Reuse the original extraction filename when the reviewed document is unchanged.
    if old.get("sha256") == digest and old.get("text"):
        text_path = root / old["text"]
    text_path.write_text(text, encoding="utf-8")
    reviewed = bool(old.get("reviewed")) and old.get("sha256") == digest
    manifest.append({
        "file": relative, "pages": len(pages), "characters": len(text),
        "text": text_path.relative_to(root).as_posix(), "sha256": digest,
        "sparsePages": [i + 1 for i, page in enumerate(pages) if len(page.strip()) < 80],
        "reviewed": reviewed, "reviewMethod": old.get("reviewMethod", "pending") if reviewed else "pending",
    })
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(manifest)} PDFs extracted. Review sparse pages visually before integration.")
