#!/usr/bin/env python3
"""
Reference Video Narrative Analysis

Analyzes viral video narrative structure to extract:
- Opening hook patterns
- Information reveal pacing
- Retention techniques
- Storyline progression
- CTA placement and effectiveness

Outputs structured JSON for script creation.

Usage:
    python analyze_narrative.py <video_path> [output_path]
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

from qwen_client import QwenVLClient


# Narrative analysis prompt template
NARRATIVE_ANALYSIS_PROMPT = """Analyze this viral video's narrative structure and retention techniques for Instagram Reels.

Provide a detailed analysis in JSON format with the following structure:

{
  "opening_hook": {
    "first_3_seconds": "<exact opening line/visual>",
    "hook_type": "<question|bold_claim|curiosity_gap|problem_statement|shocking_fact>",
    "emotional_trigger": "<FOMO|curiosity|desire|urgency|disbelief>",
    "specificity": "<specific numbers, names, or details used>"
  },
  "storyline_structure": {
    "format": "<tutorial|reveal|listicle|before_after|comparison>",
    "act_1": "<0-X seconds: what happens>",
    "act_2": "<X-Y seconds: what happens>",
    "act_3": "<Y-end: what happens>",
    "information_density": "<low|medium|high>",
    "progression_type": "<linear|buildup|reveal_based>"
  },
  "retention_techniques": [
    {
      "technique": "<name of technique>",
      "timestamp": "<when it appears>",
      "description": "<how it's used>",
      "effectiveness": "<high|medium|low>"
    }
  ],
  "value_delivery": {
    "primary_value": "<what viewer gets>",
    "proof_points": ["<specific metrics, examples, or evidence>"],
    "credibility_signals": ["<authority, specificity, or social proof>"]
  },
  "call_to_action": {
    "type": "<comment|follow|link|multi_step>",
    "placement": "<early|middle|end>",
    "engagement_trigger": "<exact CTA phrase>",
    "incentive": "<what viewer gets for acting>"
  },
  "script_rhythm": {
    "sentence_length": "<short|medium|varied>",
    "pacing": "<rapid_fire|measured|building>",
    "word_economy": "<ultra_concise|conversational|detailed>",
    "power_words": ["<high-impact words used>"]
  }
}

Focus on:
1. How does the video grab attention in first 3 seconds?
2. What keeps viewers watching (retention loops, curiosity gaps)?
3. How is information revealed (all at once vs. gradual)?
4. What specific techniques create FOMO or urgency?
5. How does the CTA integrate naturally?
6. What makes the script feel "viral" vs. "ad-like"?

Be specific. Quote exact phrases. Identify timestamps where possible."""


def analyze_narrative(video_path: str) -> Dict[str, Any]:
    """
    Analyze reference video narrative using Qwen VL.

    Args:
        video_path: Path to reference video

    Returns:
        Narrative analysis dict

    Raises:
        Exception: If analysis fails
    """
    # Validate input
    video_file = Path(video_path)
    if not video_file.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    print(f"Analyzing narrative for: {video_path}", file=sys.stderr)

    # Initialize client (retry logic handled internally)
    client = QwenVLClient()

    # Analyze video (returns parsed JSON)
    print("Sending request to Qwen VL...", file=sys.stderr)
    narrative_data = client.analyze_video_structured(
        video_path=str(video_file.absolute()),
        prompt=NARRATIVE_ANALYSIS_PROMPT
    )

    # Construct final analysis
    analysis = {
        "video_path": str(video_file.absolute()),
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        **narrative_data
    }

    # Validate structure
    required_keys = [
        "opening_hook",
        "storyline_structure",
        "retention_techniques",
        "value_delivery",
        "call_to_action",
        "script_rhythm"
    ]
    for key in required_keys:
        if key not in analysis:
            print(
                f"Warning: Missing '{key}' in model response. Using defaults.",
                file=sys.stderr
            )
            analysis[key] = {}

    return analysis


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python analyze_narrative.py <video_path> [output_path]", file=sys.stderr)
        sys.exit(1)

    video_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    try:
        # Analyze video
        analysis = analyze_narrative(video_path)

        # Output results
        json_output = json.dumps(analysis, indent=2)

        if output_path:
            # Save to file
            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)
            output_file.write_text(json_output)
            print(f"Narrative analysis saved to: {output_path}", file=sys.stderr)
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
