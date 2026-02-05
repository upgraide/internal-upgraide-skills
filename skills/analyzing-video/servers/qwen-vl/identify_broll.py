#!/usr/bin/env python3
"""
B-roll Clip Identification

Analyzes source videos to identify visually interesting moments suitable for B-roll.
Scores clips based on relevance to script keywords.

Outputs structured JSON to stdout for agent consumption.

Usage:
    python identify_broll.py <source_videos_dir> <script_keywords> [output_path]

    script_keywords: Comma-separated keywords for relevance scoring
    output_path: Optional file path for output (defaults to stdout)

Example:
    python identify_broll.py inputs/source-videos/ "ai,automation,productivity" workspace/broll-clips.json
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
import glob

from qwen_client import QwenVLClient


# B-roll identification prompt template
def create_broll_prompt(keywords: List[str]) -> str:
    """
    Create B-roll identification prompt with script keywords.

    Args:
        keywords: List of relevant keywords from script

    Returns:
        Formatted prompt string
    """
    keywords_str = ", ".join(keywords)

    return f"""Analyze this video to identify visually interesting moments suitable for B-roll footage in an Instagram Reel.

Script keywords for relevance: {keywords_str}

Provide a JSON response with the following structure:

{{
  "clips": [
    {{
      "start_time": <seconds>,
      "end_time": <seconds>,
      "duration": <seconds>,
      "description": "<what's shown in the clip>",
      "tags": ["<relevant tags>"],
      "visual_quality": "<low|medium|high>",
      "relevance_notes": "<why this relates to keywords>"
    }}
  ]
}}

Identify 5-15 clips that:
1. Are 3-10 seconds long
2. Show clear, visually interesting moments
3. Have high visual quality (sharp, well-lit, stable)
4. Relate to the script keywords if possible
5. Could work as standalone B-roll inserts

For each clip, include:
- Precise start/end times in seconds
- Clear description of visual content
- Relevant tags
- Visual quality assessment
- Notes on relevance to keywords

Be selective - only include clips that would actually work well as B-roll."""


def calculate_relevance_score(clip: Dict[str, Any], keywords: List[str]) -> float:
    """
    Calculate relevance score for a clip based on keywords.

    Scores based on:
    - Keyword matches in tags (0.5 weight)
    - Keyword matches in description (0.3 weight)
    - Visual quality (0.2 weight)

    Args:
        clip: Clip dict with tags, description, visual_quality
        keywords: List of script keywords

    Returns:
        Relevance score (0.0 to 1.0)
    """
    score = 0.0
    # Ensure keywords are strings (handle if they're nested lists)
    keywords_flat = []
    for k in keywords:
        if isinstance(k, list):
            keywords_flat.extend([str(item).lower().strip() for item in k])
        else:
            keywords_flat.append(str(k).lower().strip())
    keywords_lower = keywords_flat

    # Check tags (0.5 weight)
    tags = clip.get("tags", [])
    # Ensure tags are strings
    tags_lower = [str(t).lower() if not isinstance(t, str) else t.lower() for t in tags]
    tag_matches = sum(1 for kw in keywords_lower if any(kw in tag for tag in tags_lower))
    tag_score = min(tag_matches / max(len(keywords_lower), 1), 1.0) * 0.5

    # Check description (0.3 weight)
    description = clip.get("description", "").lower()
    desc_matches = sum(1 for kw in keywords_lower if kw in description)
    desc_score = min(desc_matches / max(len(keywords_lower), 1), 1.0) * 0.3

    # Visual quality (0.2 weight)
    quality_map = {"high": 1.0, "medium": 0.6, "low": 0.3}
    quality = clip.get("visual_quality", "medium")
    quality_score = quality_map.get(quality, 0.6) * 0.2

    score = tag_score + desc_score + quality_score

    return round(score, 2)


def identify_broll_clips(
    video_path: str,
    keywords: List[str],
    client: QwenVLClient
) -> List[Dict[str, Any]]:
    """
    Identify B-roll clips in a single video.

    Args:
        video_path: Path to source video
        keywords: Script keywords for relevance
        client: QwenVLClient instance

    Returns:
        List of clip dicts with relevance scores
    """
    print(f"Analyzing: {video_path}", file=sys.stderr)

    # Create prompt
    prompt = create_broll_prompt(keywords)

    # Analyze video
    try:
        response = client.analyze_video_structured(
            video_path=video_path,
            prompt=prompt
        )
    except Exception as e:
        import traceback
        print(f"Error analyzing {video_path}: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return []

    # Extract clips
    clips = response.get("clips", [])

    # Add metadata and calculate relevance scores
    for clip in clips:
        clip["source_video"] = video_path
        clip["duration"] = clip.get("end_time", 0) - clip.get("start_time", 0)
        clip["relevance_score"] = calculate_relevance_score(clip, keywords)
        clip["recommended"] = clip["relevance_score"] >= 0.7

    return clips


def analyze_source_videos(
    source_dir: str,
    keywords: List[str]
) -> Dict[str, Any]:
    """
    Analyze all source videos in a directory.

    Args:
        source_dir: Directory containing source videos
        keywords: Script keywords for relevance

    Returns:
        B-roll clips dict with all identified clips
    """
    source_path = Path(source_dir)
    if not source_path.exists():
        raise FileNotFoundError(f"Source directory not found: {source_dir}")

    # Find all video files
    video_extensions = ['*.mp4', '*.mov', '*.avi', '*.mkv', '*.webm']
    video_files = []
    for ext in video_extensions:
        video_files.extend(glob.glob(str(source_path / ext)))

    if not video_files:
        raise ValueError(f"No video files found in: {source_dir}")

    print(f"Found {len(video_files)} video(s) to analyze", file=sys.stderr)

    # Initialize client
    client = QwenVLClient()

    # Analyze each video
    all_clips = []
    for video_file in video_files:
        clips = identify_broll_clips(video_file, keywords, client)
        all_clips.extend(clips)

    # Sort by relevance score (descending)
    all_clips.sort(key=lambda c: c["relevance_score"], reverse=True)

    # Calculate statistics
    high_quality_clips = sum(1 for c in all_clips if c["recommended"])
    avg_relevance = sum(c["relevance_score"] for c in all_clips) / max(len(all_clips), 1)

    # Construct output
    result = {
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "script_keywords": keywords,
        "source_videos": video_files,
        "clips": all_clips,
        "total_clips": len(all_clips),
        "high_quality_clips": high_quality_clips,
        "avg_relevance": round(avg_relevance, 2)
    }

    return result


def main():
    """CLI entry point."""
    if len(sys.argv) < 3:
        print(
            "Usage: python identify_broll.py <source_videos_dir> <script_keywords> [output_path]",
            file=sys.stderr
        )
        print("\nExample:", file=sys.stderr)
        print("  python identify_broll.py inputs/source-videos/ \"ai,productivity,tools\"", file=sys.stderr)
        sys.exit(1)

    source_dir = sys.argv[1]
    keywords_str = sys.argv[2]
    output_path = sys.argv[3] if len(sys.argv) > 3 else None

    # Parse keywords
    keywords = [k.strip() for k in keywords_str.split(',')]

    try:
        # Analyze source videos
        result = analyze_source_videos(source_dir, keywords)

        # Output results
        json_output = json.dumps(result, indent=2)

        if output_path:
            # Save to file
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(json_output)
            print(f"B-roll clips saved to: {output_path}", file=sys.stderr)
            print(f"Total clips: {result['total_clips']}", file=sys.stderr)
            print(f"High-quality clips (score >= 0.7): {result['high_quality_clips']}", file=sys.stderr)
        else:
            # Print to stdout for agent consumption
            print(json_output)

        sys.exit(0)

    except Exception as e:
        error_output = {
            "error": str(e),
            "source_dir": source_dir,
            "keywords": keywords
        }
        print(json.dumps(error_output), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
