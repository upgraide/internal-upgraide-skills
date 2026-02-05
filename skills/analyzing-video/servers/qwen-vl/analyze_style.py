#!/usr/bin/env python3
"""
Reference Video Style Analysis

Analyzes a reference video to extract:
- Pacing and rhythm patterns
- Visual style characteristics
- Text overlay patterns
- Audio sync characteristics

Outputs structured JSON to stdout for agent consumption.

Usage:
    python analyze_style.py <video_path> [output_path]

    If output_path provided, saves to file. Otherwise prints to stdout.
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from qwen_client import QwenVLClient


# Style analysis prompt template
STYLE_ANALYSIS_PROMPT = """Analyze this video's stylistic characteristics for Instagram Reels production.

Provide a detailed analysis in JSON format with the following structure:

{
  "pacing": {
    "avg_shot_length": <number in seconds>,
    "rhythm": "<slow|medium|fast>",
    "transitions": ["<transition types>"],
    "cuts_per_minute": <number>
  },
  "visual_style": {
    "color_grading": "<description>",
    "framing": ["<framing types>"],
    "camera_movement": "<description>",
    "lighting": "<description>"
  },
  "text_overlays": {
    "frequency": "<none|low|medium|high>",
    "style": "<description>",
    "timing": "<description>",
    "position": "<description>"
  },
  "audio_sync": {
    "beat_aligned": <boolean>,
    "music_style": "<description>"
  }
}

Focus on:
1. How quickly the video cuts between scenes/shots
2. Visual aesthetic and color treatment
3. How text appears and when (synced to speech? always visible?)
4. Music/audio pacing and alignment with visuals

Be specific and objective. Use measurements where possible."""


def get_video_duration(video_path: str) -> float:
    """
    Get video duration using ffprobe if available.
    Falls back to 0.0 if ffprobe not found.

    Args:
        video_path: Path to video file

    Returns:
        Duration in seconds
    """
    import subprocess

    try:
        result = subprocess.run(
            [
                'ffprobe',
                '-v', 'error',
                '-show_entries', 'format=duration',
                '-of', 'default=noprint_wrappers=1:nokey=1',
                video_path
            ],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return float(result.stdout.strip())
    except (subprocess.TimeoutExpired, FileNotFoundError, ValueError):
        pass

    return 0.0


def analyze_style(video_path: str) -> Dict[str, Any]:
    """
    Analyze reference video style using Qwen VL.

    Args:
        video_path: Path to reference video

    Returns:
        Style blueprint dict

    Raises:
        Exception: If analysis fails
    """
    # Validate input
    video_file = Path(video_path)
    if not video_file.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    print(f"Analyzing style for: {video_path}", file=sys.stderr)

    # Initialize client (retry logic handled internally)
    client = QwenVLClient()

    # Analyze video (returns parsed JSON)
    print("Sending request to Qwen VL...", file=sys.stderr)
    style_data = client.analyze_video_structured(
        video_path=str(video_file.absolute()),
        prompt=STYLE_ANALYSIS_PROMPT
    )

    # Get video duration
    duration = get_video_duration(str(video_file.absolute()))

    # Construct final blueprint
    blueprint = {
        "video_path": str(video_file.absolute()),
        "duration": duration,
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        **style_data
    }

    # Validate structure
    required_keys = ["pacing", "visual_style", "text_overlays", "audio_sync"]
    for key in required_keys:
        if key not in blueprint:
            print(
                f"Warning: Missing '{key}' in model response. Using defaults.",
                file=sys.stderr
            )
            blueprint[key] = {}

    return blueprint


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python analyze_style.py <video_path> [output_path]", file=sys.stderr)
        sys.exit(1)

    video_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        # Analyze video
        blueprint = analyze_style(video_path)

        # Output results
        json_output = json.dumps(blueprint, indent=2)

        if output_path:
            # Save to file
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(json_output)
            print(f"Style blueprint saved to: {output_path}", file=sys.stderr)
        else:
            # Print to stdout for agent consumption
            print(json_output)

        sys.exit(0)

    except Exception as e:
        error_output = {
            "error": str(e),
            "video_path": video_path
        }
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
