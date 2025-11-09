"""
Quick test script to verify the detection server works
This script tests the YOLOv8 model on a sample video
"""

import cv2
from ultralytics import YOLO
import time

def test_detection(video_path: str, max_frames: int = 30):
    """Test person detection on a video file"""

    print("=" * 50)
    print("ViewGuard Detection Test")
    print("=" * 50)
    print(f"\nTesting with: {video_path}")
    print(f"Processing up to {max_frames} frames...\n")

    # Load model
    print("Loading YOLOv8 model...")
    model = YOLO('yolov8n.pt')
    print("✓ Model loaded\n")

    # Open video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"❌ Error: Could not open video file: {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Video info:")
    print(f"  FPS: {fps}")
    print(f"  Total frames: {total_frames}\n")

    frame_count = 0
    detection_count = 0
    total_persons = 0
    start_time = time.time()

    print("Running detection...")
    print("-" * 50)

    while frame_count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        # Run detection
        results = model(frame, verbose=False, classes=[0])  # 0 = person

        # Count detections
        persons_in_frame = 0
        for result in results:
            boxes = result.boxes
            persons_in_frame = len(boxes)
            total_persons += persons_in_frame

            if persons_in_frame > 0:
                detection_count += 1
                # Print detection info
                for box in boxes:
                    confidence = float(box.conf[0])
                    print(f"Frame {frame_count:3d}: Person detected (confidence: {confidence:.2f})")

        frame_count += 1

    cap.release()
    elapsed = time.time() - start_time

    # Print summary
    print("-" * 50)
    print(f"\nTest Summary:")
    print(f"  Frames processed: {frame_count}")
    print(f"  Frames with persons: {detection_count}")
    print(f"  Total persons detected: {total_persons}")
    print(f"  Processing time: {elapsed:.2f}s")
    print(f"  Average FPS: {frame_count / elapsed:.2f}")
    print(f"\n✓ Detection test completed successfully!")


if __name__ == "__main__":
    # Test with a sample video
    # You can change this to any video in your public/videos directory
    test_video = "public/videos/shoplifting/Shoplifting042_x264.mp4"

    print("\nNote: This will download the YOLOv8 model on first run (~6MB)\n")

    try:
        test_detection(test_video, max_frames=50)
    except FileNotFoundError:
        print(f"\n❌ Video file not found: {test_video}")
        print("\nAvailable test videos:")
        print("  - public/videos/burglary/Burglary003_x264.mp4")
        print("  - public/videos/fight/Fighting005_x264.mp4")
        print("  - public/videos/shoplifting/Shoplifting042_x264.mp4")
        print("  - public/videos/vandalism/Vandalism002_x264.mp4")
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        print("\nMake sure you've installed the requirements:")
        print("  pip install -r requirements.txt")
