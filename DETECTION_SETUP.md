# ViewGuard Python Detection Server Setup

This guide will help you set up the Python-based person detection backend for ViewGuard.

## Overview

The Python detection server uses **YOLOv8** (a state-of-the-art object detection model) instead of TensorFlow.js for much better accuracy and performance. It runs as a separate backend service that communicates with the React frontend via WebSocket.

## Prerequisites

- Python 3.8+ installed
- pip (Python package manager)
- Node.js and npm (for the frontend)

## Installation

### 1. Install Python Dependencies

```bash
# Create a virtual environment (recommended)
python -m venv venv

# Activate the virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Note:** The first time you run the detection server, YOLOv8 will automatically download the model weights (~6MB for the nano version).

### 2. Install Frontend Dependencies

```bash
npm install
```

## Running the Application

You need to run both the Python backend and the React frontend:

### Terminal 1: Start the Python Detection Server

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run the server
python detection_server.py
```

The server will start on `http://localhost:8001`

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8001
```

### Terminal 2: Start the React Frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## How It Works

1. **Video Frame Capture**: The React frontend captures frames from your video elements
2. **Frame Transmission**: Frames are sent to the Python backend via WebSocket (base64 encoded)
3. **Person Detection**: YOLOv8 processes each frame and detects persons
4. **Results Return**: Detection results (bounding boxes + confidence scores) are sent back to the frontend
5. **Visualization**: Green boxes are drawn around detected persons in real-time

## Configuration

### Detection Server (`detection_server.py`)

- **Model**: Default is `yolov8n.pt` (nano - fastest). You can upgrade to:
  - `yolov8s.pt` - Small (better accuracy, slower)
  - `yolov8m.pt` - Medium (even better accuracy, even slower)
  - `yolov8l.pt` - Large (best accuracy, slowest)

  Change line 32: `model = YOLO('yolov8n.pt')`

- **Port**: Default is `8001`. Change in line 177: `uvicorn.run(app, host="0.0.0.0", port=8001)`

### Frontend Hook (`src/hooks/usePersonDetectionPython.ts`)

- **Server URL**: Default is `ws://localhost:8001/ws`
- **Detection Interval**: Default is 300ms (adjust in component)
- **Confidence Threshold**: Default is 0.4-0.5 (adjust in component)

## Troubleshooting

### Python Server Won't Start

1. **Check if Python is installed**: `python --version`
2. **Activate virtual environment**: `source venv/bin/activate`
3. **Install dependencies**: `pip install -r requirements.txt`
4. **Check if port 8001 is available**: `lsof -i :8001` (Linux/Mac)

### Frontend Can't Connect

1. **Verify Python server is running**: Visit `http://localhost:8001` - you should see a JSON response
2. **Check WebSocket URL**: Make sure it's `ws://localhost:8001/ws` (not `wss://`)
3. **Check browser console**: Look for connection errors

### Poor Detection Quality

1. **Upgrade model**: Switch to `yolov8s.pt` or `yolov8m.pt` in `detection_server.py`
2. **Adjust confidence threshold**: Lower it in the component (e.g., from 0.5 to 0.3)
3. **Reduce detection interval**: Process more frames per second (e.g., 200ms instead of 300ms)

### High CPU/Memory Usage

1. **Use smaller model**: Stick with `yolov8n.pt`
2. **Increase detection interval**: Process fewer frames (e.g., 500ms instead of 300ms)
3. **Reduce video resolution**: If videos are 4K, consider 1080p or 720p

## API Reference

### WebSocket Endpoint: `/ws`

**Client → Server (Frame Data)**
```json
{
  "type": "frame",
  "data": "base64_encoded_jpeg_string",
  "camera_id": 1,
  "confidence": 0.5,
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

**Server → Client (Detection Results)**
```json
{
  "camera_id": 1,
  "detections": [
    {
      "bbox": [100, 200, 150, 300],
      "score": 0.85
    }
  ],
  "frame_width": 1920,
  "frame_height": 1080,
  "timestamp": "2025-11-08T12:00:00.000Z"
}
```

## Performance Tips

1. **GPU Acceleration**: If you have an NVIDIA GPU, install CUDA and the GPU version of PyTorch for massive speedup
2. **Batch Processing**: For recorded videos, consider processing in batches offline
3. **Model Selection**: Balance speed vs accuracy based on your hardware
4. **Frame Rate**: Don't send every frame - 3-5 FPS is usually sufficient for person detection

## Next Steps

- Consider adding activity detection (fight, fall, theft) using additional models
- Implement detection recording/logging
- Add alert notifications
- Optimize for production deployment

## Questions?

Check the main project README or open an issue on GitHub.
