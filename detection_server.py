"""
ViewGuard Detection Server
Real-time person detection using YOLOv8
"""

import asyncio
import json
import cv2
import numpy as np
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import base64
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="ViewGuard Detection Server")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 model (nano version for speed, can upgrade to yolov8s.pt or yolov8m.pt for accuracy)
model = YOLO('yolov8n.pt')  # Will auto-download on first run

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

    async def send_detections(self, websocket: WebSocket, detections: Dict):
        await websocket.send_json(detections)

manager = ConnectionManager()


def detect_persons(frame: np.ndarray, confidence_threshold: float = 0.5) -> List[Dict]:
    """
    Detect persons in a frame using YOLOv8
    Returns list of detections with bbox and confidence
    """
    # Run inference
    results = model(frame, verbose=False, classes=[0])  # class 0 is 'person' in COCO dataset

    detections = []

    # Process results
    for result in results:
        boxes = result.boxes
        for box in boxes:
            # Get box coordinates
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0])

            # Filter by confidence threshold
            if confidence >= confidence_threshold:
                # Convert to [x, y, width, height] format
                width = x2 - x1
                height = y2 - y1

                detections.append({
                    "bbox": [float(x1), float(y1), float(width), float(height)],
                    "score": confidence
                })

    return detections


def frame_to_base64(frame: np.ndarray) -> str:
    """Convert frame to base64 encoded JPEG"""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return base64.b64encode(buffer).decode('utf-8')


@app.get("/")
async def root():
    return {
        "service": "ViewGuard Detection Server",
        "status": "running",
        "model": "YOLOv8n",
        "endpoints": {
            "websocket": "/ws",
            "health": "/health"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": True}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time detection

    Expected message format from client:
    {
        "type": "frame",
        "data": "base64_encoded_image",
        "camera_id": 1,
        "confidence": 0.5
    }

    Response format:
    {
        "camera_id": 1,
        "detections": [
            {
                "bbox": [x, y, width, height],
                "score": 0.85
            }
        ],
        "timestamp": "2025-11-08T12:00:00"
    }
    """
    await manager.connect(websocket)

    try:
        while True:
            # Receive frame from client
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "frame":
                # Decode base64 image
                img_data = base64.b64decode(message["data"])
                np_arr = np.frombuffer(img_data, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                if frame is not None:
                    # Get confidence threshold from message or use default
                    confidence = message.get("confidence", 0.5)

                    # Detect persons
                    detections = detect_persons(frame, confidence)

                    # Send results back
                    response = {
                        "camera_id": message.get("camera_id", 0),
                        "detections": detections,
                        "frame_width": frame.shape[1],
                        "frame_height": frame.shape[0],
                        "timestamp": message.get("timestamp", "")
                    }

                    await manager.send_detections(websocket, response)
                else:
                    logger.warning("Failed to decode frame")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"Error in websocket: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting ViewGuard Detection Server...")
    logger.info("Loading YOLOv8 model...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
