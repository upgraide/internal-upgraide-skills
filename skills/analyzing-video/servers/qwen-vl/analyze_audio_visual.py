#!/usr/bin/env python3
"""
Audio-Visual Style Analysis (Qwen3-Omni)

Analyzes reference videos with audio understanding to extract:
- Speech-to-visual synchronization patterns
- Background music and beat alignment
- Audio cues that trigger visual changes
- Voiceover timing relative to B-roll

Requires qwen3-omni-flash model (audio-aware).
Model automatically analyzes audio from video.

Usage:
    python analyze_audio_visual.py <video_url_or_txt_file> [output_path]

    video_url_or_txt_file: Video URL (http/https) or path to .txt file containing URL
    output_path: Optional file path for output (defaults to stdout)

Example:
    # Using txt file with video URL
    echo "https://cdn.example.com/video.mp4" > inputs/reference-url.txt
    python analyze_audio_visual.py inputs/reference-url.txt outputs/audio-visual-blueprint.json

    # Using URL directly
    python analyze_audio_visual.py "https://cdn.example.com/video.mp4" outputs/audio-visual-blueprint.json
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any
import subprocess

from qwen_client import QwenClient


# Audio-visual analysis prompt template
AUDIO_VISUAL_PROMPT = """Analyze this video's audio-visual synchronization for Instagram Reels production.

Focus on understanding the RELATIONSHIP between audio and visuals:

Provide a detailed analysis in JSON format with the following structure:

{
  "speech_sync": {
    "cut_on_speech": <boolean>,
    "pause_visual_style": "<what happens during pauses>",
    "emphasis_timing": "<when visuals emphasize speech>",
    "word_to_visual_delay": <seconds, typically 0-0.3>
  },
  "music_sync": {
    "beat_aligned_cuts": <boolean>,
    "bpm_estimate": <number or null if no music>,
    "music_genre": "<genre>",
    "intensity_changes": [
      {"timestamp": <seconds>, "change": "<description>"}
    ]
  },
  "audio_visual_correlation": {
    "audio_driven_edits": <0.0-1.0, percentage of cuts driven by audio>,
    "strong_sync_moments": [
      {"timestamp": <seconds>, "audio": "<what you hear>", "visual": "<what you see>"}
    ],
    "audio_cues": [
      {"type": "<sfx|music|speech>", "triggers": "<visual change>"}
    ]
  },
  "pacing": {
    "avg_shot_length": <seconds>,
    "rhythm": "<slow|medium|fast>",
    "audio_influences_pace": <boolean>
  },
  "voiceover_patterns": {
    "continuous": <boolean>,
    "timed_with_broll": <boolean>,
    "silence_duration_avg": <seconds>
  }
}

IMPORTANT:
- Actually LISTEN to the audio, don't just guess from visuals
- Detect real music beats, not visual rhythm
- Identify actual speech timing, not lip movements
- Note discrepancies between audio and visual pace

Be specific and objective. Use measurements where possible."""


def analyze_audio_visual_style(video_url: str) -> Dict[str, Any]:
    """
    Analyze reference video audio-visual correlation using Qwen3-Omni.

    Args:
        video_url: Video URL (http/https)

    Returns:
        Audio-visual blueprint dict

    Raises:
        Exception: If analysis fails
    """
    # Validate URL format
    if not video_url.startswith(('http://', 'https://')):
        raise ValueError(
            f"Video must be http/https URL. Got: {video_url}\n"
            "For local files, upload to remote URL first (Supabase, S3, etc.)"
        )

    print(f"Analyzing audio-visual style for: {video_url}", file=sys.stderr)

    # Initialize client (retry logic handled internally)
    client = QwenClient()

    # Analyze video (audio automatically analyzed by model)
    print("Sending request to Qwen3-Omni (audio-visual model)...", file=sys.stderr)

    audio_visual_data = client.analyze_video_structured(
        video_path=video_url,
        prompt=AUDIO_VISUAL_PROMPT,
        model="qwen3-omni-flash"
    )

    # Construct final blueprint
    blueprint = {
        "video_url": video_url,
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "model_used": "qwen3-omni-flash",
        **audio_visual_data
    }

    # Validate structure
    required_keys = ["speech_sync", "music_sync", "audio_visual_correlation", "pacing"]
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
        print("Usage: python analyze_audio_visual.py <video_url_or_txt_file> [output_path]", file=sys.stderr)
        print("\nExamples:", file=sys.stderr)
        print("  # Using txt file with video URL", file=sys.stderr)
        print("  echo 'https://cdn.example.com/video.mp4' > inputs/reference-url.txt", file=sys.stderr)
        print("  python analyze_audio_visual.py inputs/reference-url.txt outputs/audio-visual-blueprint.json", file=sys.stderr)
        print("\n  # Using URL directly", file=sys.stderr)
        print('  python analyze_audio_visual.py "https://cdn.example.com/video.mp4" outputs/audio-visual-blueprint.json', file=sys.stderr)
        sys.exit(1)

    video_input = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        # Read video URL from txt file if needed
        if video_input.endswith('.txt'):
            txt_file = Path(video_input)
            if not txt_file.exists():
                raise FileNotFoundError(f"Text file not found: {video_input}")
            video_url = txt_file.read_text().strip()
            print(f"Read video URL from {video_input}: {video_url}", file=sys.stderr)
        else:
            video_url = video_input

        # Analyze video
        blueprint = analyze_audio_visual_style(video_url)

        # Output results
        json_output = json.dumps(blueprint, indent=2)

        if output_path:
            # Save to file
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(json_output)
            print(f"Audio-visual blueprint saved to: {output_path}", file=sys.stderr)
        else:
            # Print to stdout for agent consumption
            print(json_output)

        sys.exit(0)

    except Exception as e:
        error_output = {
            "error": str(e),
            "video_input": video_input
        }
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
