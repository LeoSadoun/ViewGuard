#!/usr/bin/env python3
"""
YOLOv8-based Bounding Box Generator
Generates pre-computed bounding box JSON files for videos with person detection.
"""

import cv2
import json
import os
from pathlib import Path
from ultralytics import YOLO
import numpy as np

def generate_bounding_boxes(video_path: str, output_dir: str, frame_interval: int = 15):
    """
    Generate bounding boxes for a video using YOLOv8.

    Args:
        video_path: Path to the input video file
        output_dir: Directory to save the JSON output
        frame_interval: Process every Nth frame (default: 15)
    """
    video_name = Path(video_path).name
    print(f"\n{'='*60}")
    print(f"Processing: {video_name}")
    print(f"{'='*60}")

    # Load YOLOv8 small model
    print("Loading YOLOv8 small model...")
    model = YOLO("yolov8s.pt")

    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video {video_path}")
        return None

    # Get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    print(f"Video Info:")
    print(f"  Resolution: {width}x{height}")
    print(f"  FPS: {fps:.2f}")
    print(f"  Total Frames: {total_frames}")
    print(f"  Frame Interval: {frame_interval}")

    # Initialize data structure
    video_data = {
        "video_info": {
            "name": video_name,
            "width": width,
            "height": height,
            "fps": fps,
            "total_frames": total_frames,
            "frame_interval": frame_interval
        },
        "frames": {}
    }

    # Variables for tracking
    frame_count = 0
    last_boxes = []
    last_confidences = []

    print("\nProcessing frames...")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Check if this is a keyframe (frame to process)
        is_keyframe = (frame_count % frame_interval == 0)

        if is_keyframe:
            # Run YOLOv8 detection
            results = model.predict(
                frame,
                classes=[0],  # Only detect person (class 0 in COCO)
                conf=0.2,     # Confidence threshold
                iou=0.2,      # IoU threshold for NMS
                verbose=False
            )

            # Extract bounding boxes and confidences
            boxes = []
            confidences = []

            if len(results) > 0 and results[0].boxes is not None:
                # Get boxes in xyxy format [x1, y1, x2, y2]
                xyxy_boxes = results[0].boxes.xyxy.cpu().numpy()
                confs = results[0].boxes.conf.cpu().numpy()

                for box, conf in zip(xyxy_boxes, confs):
                    # Ensure boxes stay within frame bounds
                    x1 = max(0, min(int(box[0]), width))
                    y1 = max(0, min(int(box[1]), height))
                    x2 = max(0, min(int(box[2]), width))
                    y2 = max(0, min(int(box[3]), height))

                    boxes.append([x1, y1, x2, y2])
                    confidences.append(float(conf))

            # Update last known boxes
            last_boxes = boxes
            last_confidences = confidences
        else:
            # Interpolate: reuse last detected boxes
            boxes = last_boxes
            confidences = last_confidences

        # Store frame data
        video_data["frames"][str(frame_count)] = {
            "boxes": boxes,
            "confidences": confidences,
            "is_keyframe": is_keyframe
        }

        frame_count += 1

        # Progress indicator
        if frame_count % 100 == 0:
            progress = (frame_count / total_frames) * 100
            print(f"  Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")

    cap.release()

    print(f"\n✅ Processing complete!")
    print(f"  Total frames processed: {frame_count}")
    print(f"  Keyframes: {frame_count // frame_interval + 1}")

    # Save to JSON
    output_file = Path(output_dir) / f"{Path(video_name).stem}_boxes.json"
    with open(output_file, 'w') as f:
        json.dump(video_data, f, indent=2)

    print(f"💾 Saved: {output_file}")

    return video_data

def main():
    """Main function to process all videos in the videos directory."""
    # Paths
    videos_dir = Path(__file__).parent.parent / "public" / "videos"
    output_dir = Path(__file__).parent.parent / "public" / "bounding_boxes"

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    print("="*60)
    print("YOLOv8 Bounding Box Generator")
    print("="*60)
    print(f"Videos directory: {videos_dir}")
    print(f"Output directory: {output_dir}")

    # Find all MP4 files (recursively)
    video_files = []
    for pattern in ['**/*.mp4', '**/*.MP4']:
        video_files.extend(videos_dir.glob(pattern))

    # Filter out files ending with _boxes.mp4
    video_files = [v for v in video_files if not v.name.endswith('_boxes.mp4')]

    print(f"\nFound {len(video_files)} videos to process\n")

    if not video_files:
        print("⚠️  No video files found!")
        return

    # Process each video
    for i, video_path in enumerate(video_files, 1):
        print(f"\n[{i}/{len(video_files)}]")
        try:
            generate_bounding_boxes(str(video_path), str(output_dir), frame_interval=15)
        except Exception as e:
            print(f"❌ Error processing {video_path.name}: {e}")
            import traceback
            traceback.print_exc()
            continue

    print("\n" + "="*60)
    print("✅ All videos processed!")
    print("="*60)
    print(f"\nBounding box files saved to: {output_dir}")
    print("\nNext steps:")
    print("1. Use the React component to display bounding boxes")
    print("2. The JSON files are ready to be fetched by your frontend")

if __name__ == "__main__":
    main()
