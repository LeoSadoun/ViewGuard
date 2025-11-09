#!/usr/bin/env python3
"""
Video Annotation Generator
Processes video files and generates JSON annotations with person detection bounding boxes.
"""

import cv2
import json
import os
import sys
from pathlib import Path

def process_video(video_path, output_dir):
    """
    Process a video file and generate annotations with person detections.

    Args:
        video_path: Path to the video file
        output_dir: Directory to save the annotation JSON
    """
    print(f"\nProcessing: {video_path}")

    # Load YOLO model for person detection
    # Using YOLOv3 - you can switch to YOLOv4 or YOLOv5 for better accuracy
    try:
        # Download these files if you don't have them:
        # wget https://pjreddie.com/media/files/yolov3.weights
        # wget https://github.com/pjreddie/darknet/blob/master/cfg/yolov3.cfg
        # wget https://github.com/pjreddie/darknet/blob/master/data/coco.names

        net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
        layer_names = net.getLayerNames()
        output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

        # Load COCO class labels
        with open("coco.names", "r") as f:
            classes = [line.strip() for line in f.readlines()]
    except Exception as e:
        print(f"Error loading YOLO model: {e}")
        print("\nPlease download the YOLO model files:")
        print("1. wget https://pjreddie.com/media/files/yolov3.weights")
        print("2. wget https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg")
        print("3. wget https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names")
        return None

    # Open video
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return None

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / fps if fps > 0 else 0
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    print(f"Duration: {duration:.2f}s, Resolution: {width}x{height}, FPS: {fps:.2f}")

    detections = []
    frame_count = 0

    # Process every 5th frame to speed up (adjust as needed)
    frame_skip = 5

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1

        # Skip frames for performance
        if frame_count % frame_skip != 0:
            continue

        current_time = frame_count / fps

        # Detect objects in frame
        blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        net.setInput(blob)
        outs = net.forward(output_layers)

        # Process detections
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = scores.argmax()
                confidence = scores[class_id]

                # Only keep "person" class (class_id 0) with confidence > 0.5
                if class_id == 0 and confidence > 0.5:
                    # Get bounding box coordinates
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)

                    # Convert to top-left corner coordinates
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)

                    # Convert to percentages
                    x_percent = (x / width) * 100
                    y_percent = (y / height) * 100
                    w_percent = (w / width) * 100
                    h_percent = (h / height) * 100

                    detections.append({
                        "time": round(current_time, 2),
                        "type": "PERSON",
                        "confidence": round(float(confidence) * 100, 1),
                        "boundingBox": {
                            "x": round(x_percent, 1),
                            "y": round(y_percent, 1),
                            "width": round(w_percent, 1),
                            "height": round(h_percent, 1)
                        }
                    })

        # Progress indicator
        if frame_count % (frame_skip * 10) == 0:
            progress = (frame_count / total_frames) * 100
            print(f"Progress: {progress:.1f}%", end='\r')

    cap.release()
    print(f"\nDetected {len(detections)} person instances")

    # Determine category from path
    video_name = video_path.name
    parent_dir = video_path.parent.name

    category_map = {
        'burglary': 'burglary',
        'fight': 'fight',
        'shoplifting': 'shoplifting',
        'vandalism': 'vandalism'
    }

    category = category_map.get(parent_dir.replace('usable_', ''), 'unknown')

    # Create annotation object
    annotation = {
        "videoFile": video_name,
        "category": category,
        "duration": round(duration, 2),
        "detections": detections,
        "events": []  # User will manually add these
    }

    # Save to JSON
    output_file = output_dir / f"{video_path.stem}.json"
    with open(output_file, 'w') as f:
        json.dump(annotation, f, indent=2)

    print(f"Saved annotations to: {output_file}")
    return annotation

def main():
    # Paths
    footage_dir = Path("/home/leo/code/footage")
    output_dir = Path("/home/leo/code/vigilant-ai-stream/public/annotations")

    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)

    # Find all video files
    video_categories = ['usable_burglary', 'usable_fight', 'usable_shoplift', 'usable_vandalism']

    all_videos = []
    for category in video_categories:
        category_dir = footage_dir / category
        if category_dir.exists():
            videos = list(category_dir.glob("*.mp4"))
            all_videos.extend(videos)

    print(f"Found {len(all_videos)} videos to process")

    if not all_videos:
        print("No videos found!")
        return

    # Process each video
    for i, video_path in enumerate(all_videos, 1):
        print(f"\n[{i}/{len(all_videos)}]")
        try:
            process_video(video_path, output_dir)
        except Exception as e:
            print(f"Error processing {video_path}: {e}")
            continue

    print("\n" + "="*50)
    print("Processing complete!")
    print(f"Annotations saved to: {output_dir}")
    print("\nNext steps:")
    print("1. Review the generated JSON files")
    print("2. Manually add 'events' array with your incident timestamps:")
    print('   {"time": 8.5, "type": "THEFT", "confidence": 92, "boundingBox": {...}}')

if __name__ == "__main__":
    main()
