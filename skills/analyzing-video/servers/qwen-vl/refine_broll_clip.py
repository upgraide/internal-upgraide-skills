#!/usr/bin/env python3
"""
B-roll Clip Refinement (Tier 2) - Single Clip Processing

Refines a single B-roll clip's timestamps to frame-accurate precision.
Extracts ±10-20s window around identified timestamp and analyzes at 10 FPS.

Can incorporate human feedback about what's wrong with the clip.

Usage:
    python refine_broll_clip.py <source_video> <start_time> <end_time> <description> [feedback] [window_padding]

Arguments:
    source_video: Path to source video file
    start_time: Approximate start time in seconds (from Tier 1)
    end_time: Approximate end time in seconds (from Tier 1)
    description: What the clip should show (context for analysis)
    feedback: Optional - Human feedback about what's wrong (e.g., "starts in middle, missing beginning")
    window_padding: Optional - Seconds to extract around clip (default: 20)

Example:
    python refine_broll_clip.py inputs/source.mp4 83 88 "AI tool interface animation"

    # With feedback
    python refine_broll_clip.py inputs/source.mp4 83 88 "AI tool interface animation" "starts too late, missing beginning"

    # With custom window
    python refine_broll_clip.py inputs/source.mp4 83 88 "AI tool interface animation" "" 15
"""

import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

from qwen_client import QwenClient


def create_refinement_prompt(
    description: str,
    approx_start: float,
    approx_end: float,
    human_feedback: Optional[str] = None
) -> str:
    """
    Create prompt for precise timestamp refinement with optional human feedback.

    Args:
        description: What the B-roll should show
        approx_start: Approximate start from Tier 1
        approx_end: Approximate end from Tier 1
        human_feedback: Optional human feedback about what's wrong

    Returns:
        Formatted prompt string
    """
    feedback_section = ""
    if human_feedback:
        feedback_section = f"""

⚠️ HUMAN FEEDBACK: "{human_feedback}"
Pay special attention to this feedback and adjust your analysis accordingly."""

    return f"""TASK: Find EXACT start and end timestamps for this B-roll clip.

CONTEXT: This clip should show: "{description}"

Initial estimate: {approx_start}s to {approx_end}s{feedback_section}

REQUIREMENTS:
✓ Clean start: Animation/content must be fully visible from first frame (no partial/cut-off start)
✓ Clean end: Must stop BEFORE any other content/scene appears
✓ No humans: No people visible at any point
✓ Complete content: Show the full animation/demo from start to finish
✓ Matches description: Content must match what was described

CRITICAL INSTRUCTIONS:
- This video is a ±{20}s window around the estimated time
- Give timestamps RELATIVE TO THIS VIDEO (starting from 0:00)
- Be frame-accurate at 10 FPS analysis
- If you're uncertain, indicate lower confidence

Return JSON only (no markdown, no explanation):
{{
  "timestamp": {{
    "start_seconds": 5.2,
    "end_seconds": 10.7
  }},
  "validation": {{
    "clean_start": true,
    "clean_end": true,
    "no_humans": true,
    "complete_content": true,
    "matches_description": true,
    "confidence": 0.95,
    "issues": []
  }},
  "description": "What you see in the clip"
}}

If any check fails, set to false and explain in "issues" array.
Confidence: 0.0 (uncertain) to 1.0 (very certain)."""


def extract_video_window(
    source_video: str,
    center_time: float,
    padding: int,
    output_path: str
) -> Dict[str, Any]:
    """
    Extract ±padding window around center time using ffmpeg at 10 FPS.

    Args:
        source_video: Path to source video
        center_time: Center timestamp in seconds
        padding: Seconds to extract before/after
        output_path: Where to save extracted clip

    Returns:
        Dict with extraction metadata
    """
    start_time = max(0, center_time - padding)
    duration = padding * 2

    # Ensure output directory exists
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    # ffmpeg command: extract window at 10 FPS for precise VL analysis
    cmd = [
        'ffmpeg',
        '-y',  # Overwrite
        '-ss', str(start_time),
        '-i', source_video,
        '-t', str(duration),
        '-r', '10',  # 10 FPS for analysis
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        output_path
    ]

    print(f"Extracting window: {start_time:.1f}s - {start_time + duration:.1f}s @ 10 FPS", file=sys.stderr)

    try:
        subprocess.run(cmd, capture_output=True, text=True, check=True)

        return {
            "extracted_clip": output_path,
            "window_start": start_time,
            "window_end": start_time + duration,
            "duration": duration,
            "fps": 10,
            "success": True
        }

    except subprocess.CalledProcessError as e:
        raise Exception(f"ffmpeg extraction failed: {e.stderr}")


def refine_clip(
    source_video: str,
    approx_start: float,
    approx_end: float,
    description: str,
    human_feedback: Optional[str] = None,
    window_padding: int = 20,
    workspace_dir: str = "workspace/broll-refinement"
) -> Dict[str, Any]:
    """
    Refine a single B-roll clip's timestamps with optional human feedback.

    Args:
        source_video: Path to source video
        approx_start: Approximate start time (seconds)
        approx_end: Approximate end time (seconds)
        description: What the clip should show
        human_feedback: Optional feedback about what's wrong
        window_padding: Seconds to extract around clip (default: 20)
        workspace_dir: Directory for intermediate files

    Returns:
        Refined clip data with validation
    """
    center_time = (approx_start + approx_end) / 2

    print(f"\n{'='*60}", file=sys.stderr)
    print(f"REFINING B-ROLL CLIP", file=sys.stderr)
    print(f"{'='*60}", file=sys.stderr)
    print(f"Source: {source_video}", file=sys.stderr)
    print(f"Tier 1 estimate: {approx_start:.1f}s - {approx_end:.1f}s", file=sys.stderr)
    print(f"Description: {description}", file=sys.stderr)
    if human_feedback:
        print(f"Human feedback: {human_feedback}", file=sys.stderr)
    print(f"{'='*60}\n", file=sys.stderr)

    # Create workspace
    Path(workspace_dir).mkdir(parents=True, exist_ok=True)

    # Generate unique filename for this refinement
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    clip_id = f"refine_{timestamp}"
    window_output = f"{workspace_dir}/{clip_id}_window.mp4"

    # Step 1: Extract ±padding window
    print("Step 1: Extracting video window...", file=sys.stderr)
    extraction_result = extract_video_window(
        source_video=source_video,
        center_time=center_time,
        padding=window_padding,
        output_path=window_output
    )

    # Step 2: Analyze window with Qwen VL at 10 FPS
    print("Step 2: Analyzing at 10 FPS for precision...", file=sys.stderr)

    client = QwenClient()
    prompt = create_refinement_prompt(
        description=description,
        approx_start=approx_start,
        approx_end=approx_end,
        human_feedback=human_feedback
    )

    try:
        response = client.analyze_video_structured(
            video_path=window_output,
            prompt=prompt
        )

        # Step 3: Convert timestamps from window-relative to original video absolute
        window_start = extraction_result["window_start"]

        refined_start = response["timestamp"]["start_seconds"] + window_start
        refined_end = response["timestamp"]["end_seconds"] + window_start
        refined_duration = refined_end - refined_start

        # Step 4: Validate results
        validation = response["validation"]
        all_checks_pass = all([
            validation.get("clean_start", False),
            validation.get("clean_end", False),
            validation.get("no_humans", False),
            validation.get("complete_content", False),
            validation.get("matches_description", False)
        ])

        confidence = validation.get("confidence", 0.5)

        print(f"\n{'='*60}", file=sys.stderr)
        print(f"REFINEMENT COMPLETE", file=sys.stderr)
        print(f"{'='*60}", file=sys.stderr)
        print(f"Refined timestamp: {refined_start:.2f}s - {refined_end:.2f}s ({refined_duration:.2f}s)", file=sys.stderr)
        print(f"Confidence: {confidence:.2f}", file=sys.stderr)
        print(f"All checks pass: {all_checks_pass}", file=sys.stderr)

        if validation.get("issues"):
            print(f"Issues: {', '.join(validation['issues'])}", file=sys.stderr)

        print(f"{'='*60}\n", file=sys.stderr)

        # Step 5: Build result
        result = {
            "source_video": source_video,
            "tier1_estimate": {
                "start": approx_start,
                "end": approx_end
            },
            "tier2_refined": {
                "start": refined_start,
                "end": refined_end,
                "duration": refined_duration
            },
            "extraction_window": {
                "clip_path": window_output,
                "window_start": window_start,
                "window_end": extraction_result["window_end"],
                "padding_used": window_padding,
                "fps": 10
            },
            "validation": {
                "all_checks_pass": all_checks_pass,
                "confidence": confidence,
                "issues": validation.get("issues", []),
                "checks": {
                    "clean_start": validation.get("clean_start", False),
                    "clean_end": validation.get("clean_end", False),
                    "no_humans": validation.get("no_humans", False),
                    "complete_content": validation.get("complete_content", False),
                    "matches_description": validation.get("matches_description", False)
                }
            },
            "model_description": response.get("description", ""),
            "human_feedback": human_feedback,
            "analyzed_at": datetime.utcnow().isoformat() + "Z"
        }

        return result

    except Exception as e:
        import traceback
        print(f"\n✗ ERROR: {str(e)}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)

        return {
            "source_video": source_video,
            "tier1_estimate": {
                "start": approx_start,
                "end": approx_end
            },
            "tier2_refined": None,
            "error": str(e),
            "extraction_window": extraction_result if extraction_result else {},
            "validation": {
                "all_checks_pass": False,
                "confidence": 0.0,
                "issues": [f"Analysis failed: {str(e)}"]
            },
            "analyzed_at": datetime.utcnow().isoformat() + "Z"
        }


def main():
    """CLI entry point."""
    if len(sys.argv) < 5:
        print("Usage: python refine_broll_clip.py <source_video> <start_time> <end_time> <description> [feedback] [window_padding]", file=sys.stderr)
        print("\nExamples:", file=sys.stderr)
        print('  python refine_broll_clip.py inputs/source.mp4 83 88 "AI tool interface"', file=sys.stderr)
        print('  python refine_broll_clip.py inputs/source.mp4 83 88 "AI tool interface" "starts too late"', file=sys.stderr)
        print('  python refine_broll_clip.py inputs/source.mp4 83 88 "AI tool interface" "" 15', file=sys.stderr)
        sys.exit(1)

    source_video = sys.argv[1]
    approx_start = float(sys.argv[2])
    approx_end = float(sys.argv[3])
    description = sys.argv[4]
    human_feedback = sys.argv[5] if len(sys.argv) > 5 and sys.argv[5] else None
    window_padding = int(sys.argv[6]) if len(sys.argv) > 6 else 20

    # Validate source video exists
    if not Path(source_video).exists():
        print(f"Error: Source video not found: {source_video}", file=sys.stderr)
        sys.exit(1)

    try:
        # Refine clip
        result = refine_clip(
            source_video=source_video,
            approx_start=approx_start,
            approx_end=approx_end,
            description=description,
            human_feedback=human_feedback,
            window_padding=window_padding
        )

        # Output JSON to stdout for agent consumption
        print(json.dumps(result, indent=2))

        # Exit with success if refinement worked
        if result.get("tier2_refined") and result["validation"]["confidence"] >= 0.7:
            sys.exit(0)
        else:
            sys.exit(2)  # Exit code 2 = needs more refinement

    except Exception as e:
        import traceback
        error_output = {
            "error": str(e),
            "source_video": source_video,
            "approx_start": approx_start,
            "approx_end": approx_end
        }
        print(json.dumps(error_output), file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
