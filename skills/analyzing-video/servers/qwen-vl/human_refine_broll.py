#!/usr/bin/env python3
"""
B-roll Human Refinement (Tier 3) - Interactive Correction

Interactive refinement when automatic extraction needs human correction.
Shows the extracted clip and asks specific questions to get precise timestamps.

Usage:
    python human_refine_broll.py <window_clip_path> <window_start> <model_start> <model_end> <description>

Arguments:
    window_clip_path: Path to extracted window clip
    window_start: When the window starts in original video (seconds)
    model_start: Model's suggested start time (relative to window, starts at 0)
    model_end: Model's suggested end time (relative to window)
    description: What the clip should show

Example:
    python human_refine_broll.py workspace/clip_window.mp4 63 5.2 10.7 "AI tool interface animation"
"""

import sys
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, Any


def display_clip_info(
    window_clip: str,
    window_start: float,
    model_start: float,
    model_end: float,
    description: str
) -> None:
    """
    Display clip information for human review.

    Args:
        window_clip: Path to extracted window clip
        window_start: When window starts in original video
        model_start: Model's start (relative to window)
        model_end: Model's end (relative to window)
        description: What clip should show
    """
    absolute_start = window_start + model_start
    absolute_end = window_start + model_end
    duration = model_end - model_start

    print(f"\n{'='*70}", file=sys.stderr)
    print(f"B-ROLL CLIP NEEDS HUMAN REFINEMENT", file=sys.stderr)
    print(f"{'='*70}", file=sys.stderr)
    print(f"\nDescription: {description}", file=sys.stderr)
    print(f"\nExtracted window clip:", file=sys.stderr)
    print(f"  📁 {window_clip}", file=sys.stderr)
    print(f"  ⏱️  Window covers: {window_start:.1f}s - {window_start + 40:.1f}s (±20s)", file=sys.stderr)
    print(f"\nModel's best guess:", file=sys.stderr)
    print(f"  In original video: {absolute_start:.2f}s - {absolute_end:.2f}s", file=sys.stderr)
    print(f"  Duration: {duration:.2f}s", file=sys.stderr)
    print(f"\n{'='*70}", file=sys.stderr)
    print(f"\n⚠️  WATCH THE CLIP FIRST: {window_clip}", file=sys.stderr)
    print(f"    Use a video player to review the extracted window", file=sys.stderr)
    print(f"{'='*70}\n", file=sys.stderr)


def get_human_feedback() -> Dict[str, Any]:
    """
    Interactive Q&A to get human corrections.

    Returns:
        Dict with human's corrections and feedback
    """
    print("Please answer the following questions:\n")

    # Question 1: Is the clip usable at all?
    print("1. Is this clip usable?")
    print("   [y] Yes, with corrections")
    print("   [n] No, completely wrong clip")
    print("   [s] Skip this clip for now")

    usable = input("\nYour choice: ").lower().strip()

    if usable == 'n':
        reason = input("\nWhy is it wrong? (for learning): ")
        return {
            "action": "reject",
            "reason": reason,
            "corrected_timestamp": None
        }

    if usable == 's':
        return {
            "action": "skip",
            "reason": "User chose to skip",
            "corrected_timestamp": None
        }

    # Question 2: What's wrong with current timestamps?
    print("\n2. What's wrong with the model's timestamps?")
    print("   [s] Starts too late (missing beginning)")
    print("   [e] Ends too late (includes extra content)")
    print("   [b] Both start and end need correction")
    print("   [o] Other issue")
    print("   [g] Actually looks good, accept it")

    issue_type = input("\nYour choice: ").lower().strip()

    if issue_type == 'g':
        return {
            "action": "accept",
            "reason": "Human approved model's timestamps",
            "corrected_timestamp": None
        }

    # Question 3: Provide specific timestamps
    print("\n3. Provide corrected timestamps (in seconds, relative to the WINDOW CLIP)")
    print(f"   Window clip starts at 0:00")
    print(f"   Model suggested: {model_start:.2f}s - {model_end:.2f}s")

    if issue_type in ['s', 'b']:
        new_start = input(f"\nCorrect start time (seconds): ").strip()
        try:
            new_start = float(new_start)
        except ValueError:
            print("Invalid input, using model's start time")
            new_start = model_start
    else:
        new_start = model_start

    if issue_type in ['e', 'b']:
        new_end = input(f"Correct end time (seconds): ").strip()
        try:
            new_end = float(new_end)
        except ValueError:
            print("Invalid input, using model's end time")
            new_end = model_end
    else:
        new_end = model_end

    # Question 4: Additional feedback
    feedback = input("\nAdditional feedback (optional, for learning): ").strip()

    return {
        "action": "refine",
        "issue_type": issue_type,
        "corrected_timestamp": {
            "start_seconds": new_start,
            "end_seconds": new_end
        },
        "feedback": feedback or None
    }


def apply_human_corrections(
    window_start: float,
    human_response: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Apply human corrections to build final result.

    Args:
        window_start: When window starts in original video
        human_response: Human's corrections from interactive session

    Returns:
        Final refined result with absolute timestamps
    """
    if human_response["action"] in ["reject", "skip"]:
        return {
            "final_status": human_response["action"],
            "reason": human_response["reason"],
            "corrected_timestamp": None,
            "usable_by_orchestrator": False
        }

    if human_response["action"] == "accept":
        # Model's timestamps were good
        return {
            "final_status": "accepted_as_is",
            "reason": human_response["reason"],
            "corrected_timestamp": None,
            "usable_by_orchestrator": True
        }

    # Action is "refine" - apply corrections
    corrected = human_response["corrected_timestamp"]

    # Convert from window-relative to absolute timestamps
    absolute_start = window_start + corrected["start_seconds"]
    absolute_end = window_start + corrected["end_seconds"]

    return {
        "final_status": "refined_by_human",
        "corrected_timestamp": {
            "start": absolute_start,
            "end": absolute_end,
            "duration": absolute_end - absolute_start
        },
        "human_feedback": human_response.get("feedback"),
        "issue_type": human_response.get("issue_type"),
        "usable_by_orchestrator": True
    }


def interactive_refinement(
    window_clip: str,
    window_start: float,
    model_start: float,
    model_end: float,
    description: str
) -> Dict[str, Any]:
    """
    Run interactive refinement session with human.

    Args:
        window_clip: Path to extracted window clip
        window_start: When window starts in original video
        model_start: Model's start (relative to window)
        model_end: Model's end (relative to window)
        description: What clip should show

    Returns:
        Complete refinement result with human corrections
    """
    # Display info
    display_clip_info(window_clip, window_start, model_start, model_end, description)

    # Get human feedback
    human_response = get_human_feedback()

    # Apply corrections
    result = apply_human_corrections(window_start, human_response)

    # Add metadata
    result["window_clip"] = window_clip
    result["window_start"] = window_start
    result["model_suggestion"] = {
        "start": window_start + model_start,
        "end": window_start + model_end
    }
    result["description"] = description
    result["refined_at"] = datetime.utcnow().isoformat() + "Z"
    result["refinement_tier"] = "tier3_human"

    return result


def main():
    """CLI entry point."""
    if len(sys.argv) < 6:
        print("Usage: python human_refine_broll.py <window_clip_path> <window_start> <model_start> <model_end> <description>", file=sys.stderr)
        print("\nExample:", file=sys.stderr)
        print('  python human_refine_broll.py workspace/clip_window.mp4 63 5.2 10.7 "AI interface animation"', file=sys.stderr)
        sys.exit(1)

    window_clip = sys.argv[1]
    window_start = float(sys.argv[2])
    model_start = float(sys.argv[3])
    model_end = float(sys.argv[4])
    description = sys.argv[5]

    # Validate window clip exists
    if not Path(window_clip).exists():
        print(f"Error: Window clip not found: {window_clip}", file=sys.stderr)
        print("Run refine_broll_clip.py first to extract the window", file=sys.stderr)
        sys.exit(1)

    try:
        # Run interactive refinement
        result = interactive_refinement(
            window_clip=window_clip,
            window_start=window_start,
            model_start=model_start,
            model_end=model_end,
            description=description
        )

        # Output JSON to stdout for agent consumption
        print(json.dumps(result, indent=2))

        # Exit code based on final status
        if result.get("usable_by_orchestrator"):
            sys.exit(0)  # Success
        else:
            sys.exit(2)  # Rejected/skipped

    except KeyboardInterrupt:
        print("\n\nRefinement cancelled by user", file=sys.stderr)
        error_output = {
            "final_status": "cancelled",
            "error": "User cancelled refinement"
        }
        print(json.dumps(error_output))
        sys.exit(130)

    except Exception as e:
        import traceback
        error_output = {
            "error": str(e),
            "window_clip": window_clip
        }
        print(json.dumps(error_output), file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
