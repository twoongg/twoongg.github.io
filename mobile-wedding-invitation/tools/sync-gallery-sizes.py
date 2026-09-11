#!/usr/bin/env python3
"""갤러리 <a> 태그의 data-size 를 실제 이미지 파일 크기에 맞춰 갱신합니다.

왜 필요한가
-----------
index.html 의 갤러리 항목은 이렇게 생겼습니다.

    <a href="upload/gallery/photo_1.jpg" style="background: url(...)"
       data-size="1200x900">

이 data-size 는 두 곳에서 쓰입니다.

  1. PhotoSwipe — 확대 화면에서 이미지를 그릴 박스 크기.
     값이 실제와 다르면 사진이 늘어나거나 찌그러집니다.
  2. css/aesthetic.css + js/aesthetic.js — 매스너리 타일의 비율.
     값이 실제와 다르면 타일 비율이 어긋나 사진이 잘립니다.

사진을 새로 교체하면 이 값이 옛 사진 기준으로 남으므로, 교체 후 반드시
이 스크립트를 한 번 돌려주세요.

사용법
------
    python3 tools/sync-gallery-sizes.py            # 실제로 수정
    python3 tools/sync-gallery-sizes.py --dry-run  # 바뀔 내용만 출력

외부 패키지 없이 JPEG/PNG 헤더를 직접 읽습니다.
"""

import argparse
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "index.html"

# <a href="..." ... data-size="WxH" ...>
LINK_RE = re.compile(
    r'(<a\s[^>]*?href="(?P<href>[^"]+\.(?:jpe?g|png))"[^>]*?data-size=")'
    r'(?P<size>[^"]*)'
    r'(")',
    re.IGNORECASE,
)


def png_size(fp):
    """PNG 는 첫 청크(IHDR)에 가로/세로가 들어 있습니다."""
    fp.seek(16)
    width, height = struct.unpack(">II", fp.read(8))
    return width, height


def jpeg_size(fp):
    """JPEG 는 SOF(Start Of Frame) 마커를 찾아야 크기를 알 수 있습니다."""
    fp.seek(2)  # SOI(0xFFD8) 건너뛰기
    while True:
        byte = fp.read(1)
        if not byte:
            return None
        if byte != b"\xff":
            continue
        # 0xFF 가 연달아 나오는 패딩은 건너뜁니다
        marker = fp.read(1)
        while marker == b"\xff":
            marker = fp.read(1)
        if not marker:
            return None
        code = marker[0]

        # 길이 필드가 없는 마커들
        if code in (0xD8, 0x01) or 0xD0 <= code <= 0xD7:
            continue

        length_bytes = fp.read(2)
        if len(length_bytes) < 2:
            return None
        (length,) = struct.unpack(">H", length_bytes)

        # SOF0~SOF15 (단, 0xC4 DHT / 0xC8 / 0xCC DAC 는 프레임이 아님)
        if 0xC0 <= code <= 0xCF and code not in (0xC4, 0xC8, 0xCC):
            fp.read(1)  # precision
            height, width = struct.unpack(">HH", fp.read(4))
            return width, height

        fp.seek(length - 2, 1)


def image_size(path):
    try:
        with path.open("rb") as fp:
            head = fp.read(8)
            fp.seek(0)
            if head.startswith(b"\x89PNG\r\n\x1a\n"):
                return png_size(fp)
            if head.startswith(b"\xff\xd8"):
                return jpeg_size(fp)
    except OSError as exc:
        print(f"  ! 읽기 실패 {path}: {exc}", file=sys.stderr)
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="수정하지 않고 결과만 출력")
    args = parser.parse_args()

    if not INDEX.exists():
        print(f"index.html 을 찾을 수 없습니다: {INDEX}", file=sys.stderr)
        return 1

    html = INDEX.read_text(encoding="utf-8")
    stats = {"changed": 0, "same": 0, "missing": 0}

    def replace(match):
        href = match.group("href")
        old = match.group("size")
        path = ROOT / href

        if not path.exists():
            print(f"  ? 파일 없음        {href}")
            stats["missing"] += 1
            return match.group(0)

        size = image_size(path)
        if size is None:
            print(f"  ? 크기를 못 읽음   {href}")
            stats["missing"] += 1
            return match.group(0)

        new = f"{size[0]}x{size[1]}"
        if new == old:
            stats["same"] += 1
            return match.group(0)

        print(f"  · {href}: {old} -> {new}")
        stats["changed"] += 1
        return match.group(1) + new + match.group(4)

    updated = LINK_RE.sub(replace, html)

    print(
        f"\n갱신 {stats['changed']}건 / 그대로 {stats['same']}건 / 확인불가 {stats['missing']}건"
    )

    if args.dry_run:
        print("--dry-run 이라 파일은 수정하지 않았습니다.")
    elif stats["changed"]:
        INDEX.write_text(updated, encoding="utf-8")
        print(f"{INDEX.name} 을 수정했습니다.")
    else:
        print("바뀐 값이 없어 파일을 건드리지 않았습니다.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
