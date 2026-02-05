#!/usr/bin/env python3
"""
Ask any question about a video using Qwen VL.

Usage:
    python ask.py <video_path> "<question>"
    python ask.py <video_path> "<question>" --model qwen3-omni-flash

Examples:
    python ask.py video.mp4 "What happens in this video?"
    python ask.py video.mp4 "Describe the pacing and editing style"
    python ask.py video.mp4 "At what timestamps does B-roll appear?"
"""

import sys
import json
from pathlib import Path

# Add parent directory to path for qwen_client import
sys.path.insert(0, str(Path(__file__).parent.parent / "servers" / "qwen-vl"))

from qwen_client import QwenClient


def main():
    if len(sys.argv) < 3:
        print("Usage: python ask.py <video_path> \"<question>\" [--model MODEL]", file=sys.stderr)
        print("\nModels:", file=sys.stderr)
        print("  qwen3-vl-235b-a22b-thinking  (default, local video files)", file=sys.stderr)
        print("  qwen3-omni-flash             (requires http/https URL)", file=sys.stderr)
        sys.exit(1)

    video_path = sys.argv[1]
    question = sys.argv[2]

    # Parse optional model argument
    model = "qwen3-vl-235b-a22b-thinking"
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        if idx + 1 < len(sys.argv):
            model = sys.argv[idx + 1]

    # Validate video exists for local files
    if not video_path.startswith(('http://', 'https://')):
        if not Path(video_path).exists():
            print(json.dumps({"error": f"Video not found: {video_path}"}), file=sys.stderr)
            sys.exit(1)

    try:
        print(f"[Analyzing] {Path(video_path).name}...", file=sys.stderr, flush=True)
        client = QwenClient()
        print(f"[Sending to API] This may take 30-60s for video processing...", file=sys.stderr, flush=True)
        response = client.analyze_video(video_path, question, model)
        print("[Done]", file=sys.stderr, flush=True)
        print(response)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
