#!/usr/bin/env python3
"""
Beat Detection Tool for Video Editing

Analyzes audio to extract beat timestamps for precise cut synchronization.
Outputs beat markers that can be used directly in video compositions.

Usage:
    python detect-beats.py <audio_file> [--output timeline.json] [--fps 30]
"""

import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np


def detect_beats(audio_path: str, fps: int = 30) -> dict:
    """
    Analyze audio file and extract beat information.

    Returns:
        dict with tempo, beats, and recommended cut points
    """
    print(f"[Loading] {audio_path}...")
    y, sr = librosa.load(audio_path)
    duration = librosa.get_duration(y=y, sr=sr)

    print(f"[Analyzing] Duration: {duration:.2f}s, Sample rate: {sr}Hz")

    # Detect tempo and beats
    print("[Detecting] Tempo and beats...")
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    # Handle tempo as array (newer librosa versions)
    if hasattr(tempo, '__len__'):
        tempo = float(tempo[0]) if len(tempo) > 0 else 120.0
    else:
        tempo = float(tempo)

    # Detect onsets (more precise than beats - catches transients)
    print("[Detecting] Onsets/transients...")
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # Detect strong beats (downbeats) using beat strength
    print("[Analyzing] Beat strength...")
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)

    # Get beat strengths
    beat_strengths = []
    for frame in beat_frames:
        if frame < len(onset_env):
            beat_strengths.append(float(onset_env[frame]))
        else:
            beat_strengths.append(0.0)

    # Normalize strengths
    if beat_strengths:
        max_strength = max(beat_strengths)
        if max_strength > 0:
            beat_strengths = [s / max_strength for s in beat_strengths]

    # Create beat objects with frame numbers
    beats = []
    for i, (time, strength) in enumerate(zip(beat_times, beat_strengths)):
        beats.append({
            "index": i,
            "time": round(float(time), 3),
            "frame": int(round(float(time) * fps)),
            "strength": round(strength, 3),
            "is_strong": strength > 0.7  # Mark strong beats
        })

    # Find recommended cut points (strong beats, evenly spaced)
    strong_beats = [b for b in beats if b["is_strong"]]

    # Also calculate measures (assuming 4/4 time)
    beats_per_measure = 4
    measures = []
    for i in range(0, len(beats), beats_per_measure):
        measure_beats = beats[i:i + beats_per_measure]
        if measure_beats:
            measures.append({
                "measure": i // beats_per_measure + 1,
                "start_time": measure_beats[0]["time"],
                "start_frame": measure_beats[0]["frame"],
                "beats": measure_beats
            })

    result = {
        "audio_file": str(audio_path),
        "duration_seconds": round(duration, 3),
        "duration_frames": int(round(duration * fps)),
        "fps": fps,
        "tempo_bpm": round(tempo, 1),
        "beat_interval_seconds": round(60.0 / tempo, 3),
        "beat_interval_frames": int(round((60.0 / tempo) * fps)),
        "total_beats": len(beats),
        "total_strong_beats": len(strong_beats),
        "beats": beats,
        "strong_beats": strong_beats,
        "measures": measures,
        "onsets": [{"time": round(float(t), 3), "frame": int(round(float(t) * fps))} for t in onset_times[:50]]  # First 50 onsets
    }

    return result


def suggest_cuts(beat_data: dict, num_scenes: int, intro_duration: float = 2.0) -> list:
    """
    Suggest cut points for a given number of scenes.

    Args:
        beat_data: Output from detect_beats()
        num_scenes: Number of scenes/clips to fit
        intro_duration: Duration of first scene in seconds

    Returns:
        List of cut points with timestamps and frames
    """
    beats = beat_data["beats"]
    fps = beat_data["fps"]

    if not beats:
        return []

    # Find the beat closest to intro_duration for first cut
    intro_beat_idx = 0
    for i, beat in enumerate(beats):
        if beat["time"] >= intro_duration:
            intro_beat_idx = i
            break

    # Remaining beats after intro
    remaining_beats = beats[intro_beat_idx:]
    remaining_scenes = num_scenes - 1

    if remaining_scenes <= 0 or not remaining_beats:
        return [{"scene": 1, "start_time": 0, "start_frame": 0, "end_time": beat_data["duration_seconds"], "end_frame": beat_data["duration_frames"]}]

    # Calculate beats per scene
    beats_per_scene = max(1, len(remaining_beats) // remaining_scenes)

    cuts = []

    # First scene (intro)
    cuts.append({
        "scene": 1,
        "label": "intro",
        "start_time": 0,
        "start_frame": 0,
        "end_time": beats[intro_beat_idx]["time"],
        "end_frame": beats[intro_beat_idx]["frame"],
        "duration_seconds": beats[intro_beat_idx]["time"],
        "duration_frames": beats[intro_beat_idx]["frame"]
    })

    # Remaining scenes
    current_beat_idx = intro_beat_idx
    for scene_num in range(2, num_scenes + 1):
        start_beat = beats[current_beat_idx]

        # Find end beat
        next_beat_idx = min(current_beat_idx + beats_per_scene, len(beats) - 1)

        # Prefer strong beats for cuts if available
        for i in range(current_beat_idx + 1, min(current_beat_idx + beats_per_scene + 2, len(beats))):
            if beats[i]["is_strong"]:
                next_beat_idx = i
                break

        if scene_num == num_scenes:
            # Last scene goes to end
            end_time = beat_data["duration_seconds"]
            end_frame = beat_data["duration_frames"]
        else:
            end_time = beats[next_beat_idx]["time"]
            end_frame = beats[next_beat_idx]["frame"]

        cuts.append({
            "scene": scene_num,
            "label": f"scene_{scene_num}",
            "start_time": start_beat["time"],
            "start_frame": start_beat["frame"],
            "end_time": end_time,
            "end_frame": end_frame,
            "duration_seconds": round(end_time - start_beat["time"], 3),
            "duration_frames": end_frame - start_beat["frame"]
        })

        current_beat_idx = next_beat_idx

    return cuts


def main():
    parser = argparse.ArgumentParser(description="Detect beats in audio for video editing")
    parser.add_argument("audio_file", help="Path to audio file (mp3, wav, etc.)")
    parser.add_argument("--output", "-o", help="Output JSON file path", default=None)
    parser.add_argument("--fps", type=int, default=30, help="Video frame rate (default: 30)")
    parser.add_argument("--scenes", type=int, default=None, help="Number of scenes to suggest cuts for")
    parser.add_argument("--intro", type=float, default=2.0, help="Intro scene duration in seconds")

    args = parser.parse_args()

    if not Path(args.audio_file).exists():
        print(f"Error: File not found: {args.audio_file}")
        sys.exit(1)

    # Detect beats
    beat_data = detect_beats(args.audio_file, fps=args.fps)

    # Add suggested cuts if requested
    if args.scenes:
        beat_data["suggested_cuts"] = suggest_cuts(beat_data, args.scenes, args.intro)

    # Output
    output_json = json.dumps(beat_data, indent=2)

    if args.output:
        with open(args.output, "w") as f:
            f.write(output_json)
        print(f"\n[Saved] {args.output}")
    else:
        print("\n" + "=" * 60)
        print("BEAT ANALYSIS RESULTS")
        print("=" * 60)
        print(f"Tempo: {beat_data['tempo_bpm']} BPM")
        print(f"Beat interval: {beat_data['beat_interval_seconds']}s ({beat_data['beat_interval_frames']} frames)")
        print(f"Total beats: {beat_data['total_beats']}")
        print(f"Strong beats: {beat_data['total_strong_beats']}")
        print(f"Duration: {beat_data['duration_seconds']}s ({beat_data['duration_frames']} frames)")

        print("\n[First 10 beats]")
        for beat in beat_data["beats"][:10]:
            strength_bar = "█" * int(beat["strength"] * 10)
            strong_marker = " ★" if beat["is_strong"] else ""
            print(f"  {beat['index']:3d}: {beat['time']:6.2f}s (frame {beat['frame']:4d}) | {strength_bar}{strong_marker}")

        if args.scenes and "suggested_cuts" in beat_data:
            print(f"\n[Suggested cuts for {args.scenes} scenes]")
            for cut in beat_data["suggested_cuts"]:
                print(f"  Scene {cut['scene']}: {cut['start_time']:.2f}s - {cut['end_time']:.2f}s ({cut['duration_seconds']:.2f}s, {cut['duration_frames']} frames)")

    return beat_data


if __name__ == "__main__":
    main()
