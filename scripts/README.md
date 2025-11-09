# YOLOv8 Bounding Box Generation System

This system generates pre-computed bounding box JSON files for videos using YOLOv8 person detection.

## System Overview

### Architecture
- **Python Backend**: YOLOv8-based detection script that processes videos offline
- **JSON Output**: Pre-computed bounding boxes stored as JSON files
- **React Component**: Displays boxes overlaid on videos in real-time

### Advantages
- ✅ **Accurate**: YOLOv8 is more accurate than browser-based TensorFlow.js
- ✅ **Fast**: Pre-computation means zero runtime cost
- ✅ **Scalable**: Process once, use forever
- ✅ **No Browser Overhead**: Videos play smoothly without ML model running

## Installation

### 1. Install Python Dependencies

```bash
# From the project root
cd /home/leo/code/vigilant-ai-stream

# Install dependencies
pip install -r scripts/requirements_detection.txt
```

This will install:
- `ultralytics>=8.0.0` - YOLOv8 framework
- `opencv-python>=4.8.0` - Video processing
- `torch>=2.0.0` - PyTorch backend
- `numpy>=1.24.0` - Numerical operations

### 2. Download YOLOv8 Model

The script will automatically download `yolov8s.pt` (YOLOv8 small model) on first run.

## Usage

### Generate Bounding Boxes

```bash
# From the project root
python scripts/generate_bounding_boxes.py
```

### What It Does

1. **Scans** all `*.mp4` files in `public/videos/` (recursively)
2. **Processes** each video:
   - Loads YOLOv8 small model (`yolov8s.pt`)
   - Detects people (class 0 from COCO dataset)
   - Processes every 15th frame (keyframes)
   - Interpolates boxes for non-keyframes
   - Confidence threshold: 0.2
   - IoU threshold: 0.2
3. **Outputs** JSON files to `public/bounding_boxes/{video_name}_boxes.json`

### Output Format

```json
{
  "video_info": {
    "name": "Burglary003_x264.mp4",
    "width": 320,
    "height": 240,
    "fps": 30.0,
    "total_frames": 1920,
    "frame_interval": 15
  },
  "frames": {
    "0": {
      "boxes": [[146, 31, 180, 144]],
      "confidences": [0.258],
      "is_keyframe": true
    },
    "1": {
      "boxes": [[146, 31, 180, 144]],
      "confidences": [0.258],
      "is_keyframe": false
    }
  }
}
```

### Box Format
- Boxes are in `[x1, y1, x2, y2]` format (top-left to bottom-right corners)
- Coordinates are in original video pixel space
- All boxes are clipped to stay within frame bounds

## Using the React Component

### Import and Use

```tsx
import BoundingBoxesOverlay from "@/components/BoundingBoxesOverlay";

// In your component
<div className="relative">
  <video ref={videoRef} src="/videos/burglary/Burglary003_x264.mp4" />
  <BoundingBoxesOverlay
    videoRef={videoRef}
    videoSrc="/videos/burglary/Burglary003_x264.mp4"
    enabled={true}
  />
</div>
```

### Component Props

- `videoRef`: React ref to the video element
- `videoSrc`: Path to the video file (must match the generated JSON filename)
- `enabled`: Boolean to enable/disable overlay (default: true)

### How It Works

1. **Loads JSON**: Fetches `/bounding_boxes/{video_name}_boxes.json`
2. **Tracks Time**: Listens to video `timeupdate` events
3. **Calculates Frame**: `currentFrame = Math.floor(currentTime * fps)`
4. **Scales Boxes**: Converts from original video size to display size
5. **Renders**: Displays green boxes with `border-2 border-green-400 bg-green-400/20`

## Configuration

### Frame Interval

Edit `generate_bounding_boxes.py` line 153:

```python
generate_bounding_boxes(str(video_path), str(output_dir), frame_interval=15)
```

- Lower values = more keyframes = smoother tracking = slower processing
- Higher values = fewer keyframes = faster processing = less smooth tracking
- Recommended: 10-20 for good balance

### Detection Thresholds

Edit `generate_bounding_boxes.py` lines 70-73:

```python
results = model.predict(
    frame,
    classes=[0],  # Only detect person
    conf=0.2,     # Lower = more detections
    iou=0.2,      # Lower = detect overlapping people
    verbose=False
)
```

### Model Selection

Edit `generate_bounding_boxes.py` line 31:

```python
model = YOLO("yolov8s.pt")  # Options: yolov8n, yolov8s, yolov8m, yolov8l, yolov8x
```

- `yolov8n` (nano) - Fastest, least accurate
- `yolov8s` (small) - **Recommended** - Good balance
- `yolov8m` (medium) - More accurate, slower
- `yolov8l` (large) - Very accurate, very slow
- `yolov8x` (xlarge) - Best accuracy, slowest

## Performance

### Processing Time
- ~5-10 seconds per video (depending on length and resolution)
- One-time cost - only need to run when videos change

### Output Size
- ~100-500 KB per video JSON file
- Small enough to load quickly in browser

## Troubleshooting

### "No module named 'ultralytics'"
```bash
pip install -r scripts/requirements_detection.txt
```

### "Could not open video"
- Check that video files exist in `public/videos/`
- Ensure videos are valid MP4 files

### "CUDA not available"
- This is fine! Script will use CPU
- For GPU acceleration, install `torch` with CUDA support

### No boxes appearing in frontend
1. Check browser console for fetch errors
2. Verify JSON files exist in `public/bounding_boxes/`
3. Ensure video filename matches JSON filename (without `_boxes.json`)
4. Check that video is playing (component only updates during playback)

## Next Steps

After generating bounding boxes:

1. ✅ JSON files are ready in `public/bounding_boxes/`
2. ✅ React component can display them
3. 🔄 You can now switch from TensorFlow.js to pre-computed boxes for better accuracy

## Comparison: TensorFlow.js vs Pre-computed YOLOv8

| Feature | TensorFlow.js (Current) | Pre-computed YOLOv8 (New) |
|---------|-------------------------|---------------------------|
| Accuracy | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Performance | Medium (runs in browser) | Excellent (zero runtime cost) |
| Setup | None needed | One-time processing |
| Flexibility | Works with any video instantly | Need to pre-process new videos |
| Browser Load | High (ML model running) | None (just reading JSON) |

**Recommendation**: Use pre-computed YOLOv8 for production. It's more accurate and faster!
