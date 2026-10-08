"""
Renders page 1 of certificate PDFs to PNG at 150 dpi (1240 x 1754 for A4), the same
resolution as the existing authentic previews in source-assets/images/certificates.

Only used for certificates whose existing preview is too small to read in the viewer
(the 600 px 2019/2020/EKO-2021 previews). Pure rasterisation of the original PDF: no OCR,
no edits, no re-typesetting.

    pip install pymupdf        (tooling only, not a site dependency)
    python scripts/render-certificate-scans.py

Output: ../source-assets/images/certificates-rendered/<pdf name>.png
Then run `npm run assets`, which prefers these renders over the small previews.
"""
import pathlib
import pymupdf  # PyMuPDF

SITE = pathlib.Path(__file__).resolve().parent.parent
SRC = SITE.parent / "source-assets"
PDFS = SRC / "pdfs" / "certificates"
PREVIEWS = SRC / "images" / "certificates"
OUT = SRC / "images" / "certificates-rendered"
MIN_WIDTH = 1200

def webp_width(path: pathlib.Path) -> int:
    """Width from the WEBP header (VP8, VP8L or VP8X); MuPDF cannot open WEBP."""
    b = path.read_bytes()[:40]
    kind = b[12:16]
    if kind == b"VP8X":
        return 1 + int.from_bytes(b[24:27], "little")
    if kind == b"VP8L":
        return 1 + (int.from_bytes(b[21:23], "little") & 0x3FFF)
    if kind == b"VP8 ":
        return int.from_bytes(b[26:28], "little") & 0x3FFF
    raise ValueError(f"unknown WEBP chunk in {path.name}")


OUT.mkdir(exist_ok=True)
count = 0
for pdf in sorted(PDFS.glob("*/*.pdf")):
    preview = PREVIEWS / f"{pdf.stem}-preview.webp"
    if preview.exists():
        if webp_width(preview) >= MIN_WIDTH:
            continue
    doc = pymupdf.open(pdf)
    pix = doc[0].get_pixmap(dpi=150, alpha=False)
    pix.save(OUT / f"{pdf.stem}.png")
    count += 1
    print(f"{pdf.name}: {pix.width}x{pix.height}")
print(f"rendered {count}")
