#!/usr/bin/env python3
"""Scene text recognition using RapidOCR for Panini sticker codes."""
import sys
import json


def main():
    if len(sys.argv) < 2:
        print("[]")
        return

    try:
        from rapidocr_onnxruntime import RapidOCR
    except ImportError:
        print("[]")
        return

    engine = RapidOCR()
    result, _ = engine(sys.argv[1])

    if not result:
        print("[]")
        return

    detections = [
        {"text": text, "confidence": round(float(conf), 4)}
        for _, text, conf in result
    ]
    detections.sort(key=lambda d: d["confidence"], reverse=True)
    print(json.dumps(detections))


if __name__ == "__main__":
    main()
