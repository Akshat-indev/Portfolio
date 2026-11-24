"""
High-DPI Seamless Word-Filled Character Animation Generator (1280 x 1920)
=========================================================================
Generates a razor-sharp looping vertical code-stream animation natively at
1280 x 1920 (2x base resolution, 2.78x desktop CSS size, universally within
GPU/browser VP9 decode limits) clipped strictly to the alpha silhouette of
`assets/Port_FullBody.png`.

Sharpness & playback engineering:
  - Native 24px FreeType monospace rasterization with explicit letter tracking
  - Exact integer vertical scroll step (5 px/frame -> 960px over 192 frames)
    and integer horizontal sway -> zero bilinear resampling blur on glyphs
  - Bounding-box NumPy compositing for fast high-resolution rendering
  - Web-optimized VP9 alpha encoding (-crf 24, yuva420p, -auto-alt-ref 0, -g 48)

Outputs (in `generated/word-character/`):
  - akshat-word-character.webm          (1280x1920 VP9 + yuva420p genuine alpha)
  - akshat-word-character-preview.mp4   (H.264 preview over #101016 dark canvas)
  - akshat-word-character-preview.png   (Transparent RGBA preview frame)

Usage:
  python scripts/generate_word_character.py
"""

from __future__ import annotations

import math
import os
import subprocess
import sys
import time
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# ---------------------------------------------------------------------------
# High-DPI Web-Safe Configuration (2x native resolution: 1280 x 1920)
# ---------------------------------------------------------------------------
REPO_ROOT = Path(__file__).resolve().parent.parent
SOURCE_IMAGE = REPO_ROOT / "assets" / "Port_FullBody.png"
OUTPUT_DIR = REPO_ROOT / "generated" / "word-character"

WEBM_OUT = OUTPUT_DIR / "akshat-word-character.webm"
MP4_OUT = OUTPUT_DIR / "akshat-word-character-preview.mp4"
PNG_OUT = OUTPUT_DIR / "akshat-word-character-preview.png"

WIDTH = 1280
HEIGHT = 1920
FPS = 24
TOTAL_FRAMES = 192  # 8.00s @ 24 FPS -> 960 / 192 = 5.0 px/frame EXACT integer step!

# Vertical tile geometry: 30 unique rows x 32px = 960px (exact half of 1920px).
# Scrolling upward by 5 px/frame (120 px/s = 3.75 rows/s) wraps seamlessly with
# ZERO fractional sub-pixel blur on any frame.
ROW_PITCH = 32
TILE_ROWS = 30
TILE_HEIGHT = ROW_PITCH * TILE_ROWS  # 960px
STRIP_WIDTH = 2560  # 2x WIDTH seamless horizontal strip per row
FONT_SIZE = 23
LETTER_TRACKING = 1  # Crisp inter-character breathing room in 2x pixels

# Dark preview backdrop matching portfolio chrome (#101016)
DARK_BG_RGB = np.array([16, 16, 22], dtype=np.float32)

# Curated technical vocabulary (AI/ML, Software Engineering, Systems/Infrastructure)
TERMS: list[str] = [
    # AI / Machine Learning
    "NEURAL NETWORKS",
    "TRANSFORMERS",
    "INFERENCE",
    "EMBEDDINGS",
    "VECTOR SEARCH",
    "ATTENTION",
    "BACKPROPAGATION",
    "MODEL EVALUATION",
    "RETRIEVAL",
    "AGENT SYSTEMS",
    "ORCHESTRATION",
    "TRAINING DATA",
    "TOKENIZATION",
    "KV CACHE",
    "GRADIENT DESCENT",
    # Software Engineering
    "TYPESCRIPT",
    "JAVASCRIPT",
    "PYTHON",
    "C++",
    "REACT",
    "FASTAPI",
    "NODE.JS",
    "API DESIGN",
    "DATA STRUCTURES",
    "ALGORITHMS",
    "SYSTEM DESIGN",
    "DISTRIBUTED SYSTEMS",
    "STATE MACHINE",
    "GRAPHQL",
    "ASYNCIO",
    # Systems / Infrastructure
    "LINUX KERNEL",
    "MEMORY MANAGEMENT",
    "CONCURRENCY",
    "EVENT STREAMS",
    "FAULT TOLERANCE",
    "DOCKER",
    "POSTGRESQL",
    "OBSERVABILITY",
    "DATA PIPELINES",
    "NETWORK PROTOCOLS",
    "LOW LATENCY",
    "PROCESS SCHEDULING",
    "ZERO-COPY",
    "LOCK-FREE",
    "RAFT CONSENSUS",
    "CACHE COHERENCE",
    "SHARDING",
    "GRPC",
]

# Palette (crisp off-white & light grey + restrained cyan & magenta accents)
OFF_WHITE = (246, 247, 252)
LIGHT_GREY = (212, 215, 228)
CYAN_ACCENT = (26, 204, 255)
MAGENTA_ACCENT = (252, 100, 244)


def load_monospace_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = (
        [
            r"C:\Windows\Fonts\consolab.ttf",
            r"C:\Windows\Fonts\CascadiaMono.ttf",
            r"C:\Windows\Fonts\consola.ttf",
        ]
        if bold
        else [
            r"C:\Windows\Fonts\CascadiaMono.ttf",
            r"C:\Windows\Fonts\consola.ttf",
            r"C:\Windows\Fonts\CascadiaCode.ttf",
        ]
    )
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()  # type: ignore[return-value]


def measure_tracked_text(
    draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, tracking: int
) -> tuple[int, int, int]:
    """Return (width, height, y_offset) for monospace text rendered with explicit tracking."""
    if not text:
        return 0, 0, 0
    total_w = 0
    for idx, ch in enumerate(text):
        adv = int(round(draw.textlength(ch, font=font)))
        total_w += adv + (tracking if idx < len(text) - 1 else 0)
    bbox = draw.textbbox((0, 0), text, font=font)
    return total_w, bbox[3] - bbox[1], bbox[1]


def draw_tracked_text(
    draw: ImageDraw.ImageDraw,
    pos: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int, int],
    tracking: int,
) -> None:
    x, y = pos
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += int(round(draw.textlength(ch, font=font))) + tracking


def load_character_maps(source_path: Path) -> dict[str, object]:
    """Load source PNG at 1920x2880 and precompute silhouette alpha, bounding box, and tint maps."""
    if not source_path.exists():
        raise FileNotFoundError(
            f"Source full-body character PNG not found at: {source_path}"
        )

    img = Image.open(source_path).convert("RGBA")
    if img.size != (WIDTH, HEIGHT):
        img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)

    arr = np.asarray(img, dtype=np.float32)
    r, g, b, a = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2], arr[:, :, 3]
    alpha_norm = a / 255.0

    # Tight bounding box of non-zero silhouette pixels to speed up per-frame compositing
    ys, xs = np.nonzero(a > 0)
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0, x1 = int(xs.min()), int(xs.max()) + 1

    # Slice maps strictly to silhouette bounding box
    alpha_box = alpha_norm[y0:y1, x0:x1]
    luma_box = (0.2126 * r[y0:y1, x0:x1] + 0.7152 * g[y0:y1, x0:x1] + 0.0722 * b[y0:y1, x0:x1]) / 255.0

    # Subtle cyan & magenta highlight masks from the original character
    cyan_raw = np.clip((b[y0:y1, x0:x1] - r[y0:y1, x0:x1] - 28.0) / 110.0, 0.0, 1.0) * np.clip(
        (g[y0:y1, x0:x1] - 85.0) / 110.0, 0.0, 1.0
    )
    mag_raw = np.clip((r[y0:y1, x0:x1] - g[y0:y1, x0:x1] - 32.0) / 110.0, 0.0, 1.0) * np.clip(
        (b[y0:y1, x0:x1] - g[y0:y1, x0:x1] - 20.0) / 110.0, 0.0, 1.0
    )

    cyan_box = (
        np.asarray(
            Image.fromarray((cyan_raw * 255).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(radius=4.0)
            ),
            dtype=np.float32,
        )
        / 255.0
    )
    mag_box = (
        np.asarray(
            Image.fromarray((mag_raw * 255).astype(np.uint8)).filter(
                ImageFilter.GaussianBlur(radius=4.0)
            ),
            dtype=np.float32,
        )
        / 255.0
    )

    brightness_box = (0.76 + 0.40 * np.power(luma_box, 0.72))[:, :, None]
    cyan_w = (cyan_box * 0.74)[:, :, None]
    mag_w = (mag_box * 0.76)[:, :, None]

    # Pre-compute linear tint multipliers: rgb_out = rgb_in * scale_map + add_map
    cyan_col = np.array(CYAN_ACCENT, dtype=np.float32)[None, None, :]
    mag_col = np.array(MAGENTA_ACCENT, dtype=np.float32)[None, None, :]

    scale_map = brightness_box * (1.0 - cyan_w) * (1.0 - mag_w)
    add_map = cyan_col * cyan_w * (1.0 - mag_w) + mag_col * mag_w

    return {
        "bbox": (x0, y0, x1, y1),
        "alpha_box": alpha_box,
        "scale_map": scale_map,
        "add_map": add_map,
    }


def build_row_strips() -> list[dict[str, object]]:
    """
    Pre-render 30 distinct, razor-sharp 3x-resolution horizontal word strips
    that wrap seamlessly around STRIP_WIDTH (3840px).
    """
    font_regular = load_monospace_font(FONT_SIZE, bold=False)
    font_bold = load_monospace_font(FONT_SIZE, bold=True)

    strips: list[dict[str, object]] = []
    term_cursor = 0

    for row_idx in range(TILE_ROWS):
        strip_img = Image.new("RGBA", (STRIP_WIDTH, ROW_PITCH), (0, 0, 0, 0))
        draw = ImageDraw.Draw(strip_img)

        use_bold = (row_idx % 2 == 0)
        font = font_bold if use_bold else font_regular
        row_opacity = 0.85 + 0.15 * ((row_idx * 7) % 5) / 4.0

        x = ((row_idx * 91) % 112) - 32
        word_gap = 28 + (row_idx % 3) * 7

        while x < STRIP_WIDTH - 80:
            term = TERMS[term_cursor % len(TERMS)]
            term_cursor += 1 + (row_idx % 2)

            tw, th, y_off = measure_tracked_text(draw, term, font, LETTER_TRACKING)
            if x + tw > STRIP_WIDTH - 32:
                break

            accent_roll = (term_cursor + row_idx * 5) % 21
            if accent_roll == 0:
                color = (*CYAN_ACCENT, 252)
            elif accent_roll == 1:
                color = (*MAGENTA_ACCENT, 252)
            elif (term_cursor + row_idx) % 3 == 0:
                color = (*OFF_WHITE, int(252 * row_opacity))
            else:
                color = (*LIGHT_GREY, int(238 * row_opacity))

            y_pos = max(0, (ROW_PITCH - th) // 2 - y_off)
            draw_tracked_text(draw, (x, y_pos), term, font, color, LETTER_TRACKING)

            # Subtle dot delimiter between terms
            sep_x = x + tw + word_gap // 2 - 4
            if sep_x < STRIP_WIDTH - 20:
                draw.text(
                    (sep_x, y_pos),
                    "·",
                    font=font_regular,
                    fill=(164, 168, 188, int(140 * row_opacity)),
                )

            x += tw + word_gap

        strip_arr = np.asarray(strip_img, dtype=np.uint8)

        # Gentle periodic horizontal sway (exact 1 cycle over 192 frames -> 100% seamless)
        direction = 1.0 if row_idx % 2 == 0 else -1.0
        sway_amp = 16.0 + (row_idx % 5) * 6.0  # 16..40px in 2x space (= 8..20px @ 1x)
        sway_phase = (row_idx / TILE_ROWS) * 2.0 * math.pi

        strips.append(
            {
                "rgba": strip_arr,
                "amp": sway_amp * direction,
                "phase": sway_phase,
            }
        )

    return strips


def render_frame(
    frame_idx: int,
    strips: list[dict[str, object]],
    maps: dict[str, object],
    tile_buf: np.ndarray,
    frame_buf: np.ndarray,
) -> np.ndarray:
    """
    Render one razor-sharp 1920x2880 RGBA frame (uint8) using integer pixel shifts
    (zero bilinear smearing) and bounding-box compositing.
    """
    x0, y0, x1, y1 = maps["bbox"]  # type: ignore[misc]
    alpha_box: np.ndarray = maps["alpha_box"]  # type: ignore[assignment]
    scale_map: np.ndarray = maps["scale_map"]  # type: ignore[assignment]
    add_map: np.ndarray = maps["add_map"]  # type: ignore[assignment]

    t = frame_idx / TOTAL_FRAMES  # [0, 1) exact loop parameter
    y_scroll = (frame_idx * (TILE_HEIGHT // TOTAL_FRAMES)) % TILE_HEIGHT  # Exact 8px/frame!
    box_w = x1 - x0

    # Fill only the [x0:x1] horizontal columns of the 1440px tile buffer using integer shifts
    for row_idx, strip in enumerate(strips):
        rgba: np.ndarray = strip["rgba"]  # type: ignore[assignment]
        amp: float = strip["amp"]  # type: ignore[assignment]
        phase: float = strip["phase"]  # type: ignore[assignment]

        dx = int(round(amp * math.sin(2.0 * math.pi * t + phase)))
        start_col = (x0 - dx) % STRIP_WIDTH
        r0 = row_idx * ROW_PITCH
        r1 = r0 + ROW_PITCH

        if start_col + box_w <= STRIP_WIDTH:
            tile_buf[r0:r1, :, :] = rgba[:, start_col : start_col + box_w, :]
        else:
            first = STRIP_WIDTH - start_col
            tile_buf[r0:r1, :first, :] = rgba[:, start_col:, :]
            tile_buf[r0:r1, first:, :] = rgba[:, : box_w - first, :]

    # Sample scrolled vertical rows strictly inside [y0:y1] via exact integer indexing
    row_indices = (np.arange(y0, y1) + y_scroll) % TILE_HEIGHT
    text_box = tile_buf[row_indices].astype(np.float32)

    rgb = np.clip(text_box[:, :, :3] * scale_map + add_map, 0.0, 255.0)
    final_alpha = np.clip((text_box[:, :, 3] / 255.0) * alpha_box, 0.0, 1.0)

    # Zero RGB wherever alpha is 0 for optimal VP9 alpha compression
    visible = (final_alpha > 0.002)[:, :, None]
    rgb = np.where(visible, rgb, 0.0)

    frame_buf.fill(0)
    frame_buf[y0:y1, x0:x1, :3] = rgb.astype(np.uint8)
    frame_buf[y0:y1, x0:x1, 3] = np.round(final_alpha * 255.0).astype(np.uint8)
    return frame_buf


def main() -> None:
    t0 = time.perf_counter()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

    print(f"Loading source silhouette at {WIDTH}x{HEIGHT}: {SOURCE_IMAGE}")
    maps = load_character_maps(SOURCE_IMAGE)
    x0, y0, x1, y1 = maps["bbox"]  # type: ignore[misc]
    print(f"  Silhouette bbox: x=[{x0}, {x1}) w={x1 - x0}, y=[{y0}, {y1}) h={y1 - y0}")

    strips = build_row_strips()
    tile_buf = np.zeros((TILE_HEIGHT, x1 - x0, 4), dtype=np.uint8)
    frame_buf = np.zeros((HEIGHT, WIDTH, 4), dtype=np.uint8)

    # 1. Web-safe high-DPI transparent VP9 WebM (yuva420p, -g 48 for instant seek/loop, CRF 24)
    webm_cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-pix_fmt", "rgba",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-r", str(FPS),
        "-i", "-",
        "-c:v", "libvpx-vp9",
        "-pix_fmt", "yuva420p",
        "-auto-alt-ref", "0",
        "-g", "48",
        "-b:v", "0",
        "-crf", "24",
        "-deadline", "good",
        "-cpu-used", "3",
        "-row-mt", "1",
        "-tile-columns", "2",
        "-an",
        str(WEBM_OUT),
    ]

    # 2. High-quality H.264 MP4 preview (composited on #101016 dark background, scaled to 960x1440 for nimble preview)
    mp4_cmd = [
        ffmpeg_exe,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-pix_fmt", "rgb24",
        "-s", f"{WIDTH}x{HEIGHT}",
        "-r", str(FPS),
        "-i", "-",
        "-vf", "scale=960:1440:flags=lanczos",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-crf", "18",
        "-preset", "medium",
        "-movflags", "+faststart",
        "-an",
        str(MP4_OUT),
    ]

    print(f"Encoding {TOTAL_FRAMES} frames ({WIDTH}x{HEIGHT} @ {FPS}fps, {TOTAL_FRAMES / FPS:.2f}s)...")
    webm_proc = subprocess.Popen(
        webm_cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )
    mp4_proc = subprocess.Popen(
        mp4_cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE
    )

    assert webm_proc.stdin is not None and mp4_proc.stdin is not None

    # Reusable dark backdrop for MP4 compositing
    comp_buf = np.empty((HEIGHT, WIDTH, 3), dtype=np.uint8)

    for frame_idx in range(TOTAL_FRAMES):
        rgba_frame = render_frame(frame_idx, strips, maps, tile_buf, frame_buf)

        if frame_idx == 0:
            Image.fromarray(rgba_frame, mode="RGBA").save(PNG_OUT, optimize=True)

        webm_proc.stdin.write(rgba_frame.tobytes())

        # Fast compositing onto #101016 for MP4 preview
        comp_buf[:, :, 0] = 16
        comp_buf[:, :, 1] = 16
        comp_buf[:, :, 2] = 22
        a_box = rgba_frame[y0:y1, x0:x1, 3:4].astype(np.float32) / 255.0
        comp_box = (
            rgba_frame[y0:y1, x0:x1, :3].astype(np.float32) * a_box
            + DARK_BG_RGB[None, None, :] * (1.0 - a_box)
        )
        comp_buf[y0:y1, x0:x1, :] = np.clip(comp_box, 0, 255).astype(np.uint8)
        mp4_proc.stdin.write(comp_buf.tobytes())

        if (frame_idx + 1) % 30 == 0:
            elapsed = time.perf_counter() - t0
            print(f"  Rendered {frame_idx + 1}/{TOTAL_FRAMES} frames ({elapsed:.1f}s)...")

    webm_proc.stdin.close()
    mp4_proc.stdin.close()
    _, webm_err = webm_proc.communicate()
    _, mp4_err = mp4_proc.communicate()

    if webm_proc.returncode != 0:
        print("WebM FFmpeg error:\n", webm_err.decode(errors="ignore"), file=sys.stderr)
        sys.exit(1)
    if mp4_proc.returncode != 0:
        print("MP4 FFmpeg error:\n", mp4_err.decode(errors="ignore"), file=sys.stderr)
        sys.exit(1)

    total_time = time.perf_counter() - t0
    print(f"Done in {total_time:.1f}s! Generated high-DPI deliverables:")
    for path in (WEBM_OUT, MP4_OUT, PNG_OUT):
        print(f"  {path} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
