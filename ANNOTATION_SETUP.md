# Video Annotation Setup Guide

This guide explains how to automatically generate person detection bounding boxes for your surveillance videos.

## Option 1: Using YOLO (Recommended - Most Accurate)

### Step 1: Install Dependencies

```bash
pip install opencv-python numpy
```

### Step 2: Download YOLO Model Files

```bash
# Download YOLOv3 weights (~250MB)
wget https://pjreddie.com/media/files/yolov3.weights

# Download YOLOv3 config
wget https://raw.githubusercontent.com/pjreddie/darknet/master/cfg/yolov3.cfg

# Download class names
wget https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names
```

### Step 3: Run the Script

```bash
python generate_annotations.py
```

This will:
- Process all 22 videos in `/home/leo/code/footage/`
- Detect people in each frame
- Generate JSON files in `public/annotations/` with bounding boxes
- Take approximately 20-40 minutes total

### Step 4: Add Event Annotations Manually

Open each generated JSON file and add your events. Example:

```json
{
  "videoFile": "Burglary003_x264.mp4",
  "category": "burglary",
  "duration": 45.2,
  "detections": [
    // Auto-generated person detections (don't edit these)
  ],
  "events": [
    // ADD YOUR EVENTS HERE:
    {
      "time": 8.5,
      "type": "THEFT",
      "confidence": 92,
      "boundingBox": {
        "x": 30,
        "y": 25,
        "width": 20,
        "height": 35
      }
    }
  ]
}
```

Event types: `THEFT`, `FIGHT`, `VANDALISM`, `SHOPLIFTING`

## Option 2: Using OpenCV Haar Cascades (Faster but Less Accurate)

If YOLO is too slow, I can create a lighter version using Haar Cascades. Let me know!

## What You Get

- **Green boxes**: Automatically track all people in videos
- **Colored boxes**: You manually add when/where incidents happen
- **Smooth playback**: No performance impact (all pre-processed)

## Next Steps

After generating annotations, I'll update the frontend to:
1. Load annotation JSON files
2. Display green boxes synchronized with video playback
3. Trigger notifications when events occur
4. Show event boxes (red/orange/yellow) at the right times
