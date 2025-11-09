# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ViewGuard (formerly VigilantAI) is an AI-powered CCTV monitoring dashboard with real-time threat detection. The application displays a 3×3 grid of camera feeds with automated person detection using TensorFlow.js and event detection overlays.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (typically runs on http://localhost:8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Lint code
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Person Detection System

The application uses **TensorFlow.js with COCO-SSD** for real-time person detection:

- **Singleton Model Loader** (`src/utils/modelLoader.ts`): Critical pattern that loads the TensorFlow model once and shares it across all 9 camera feeds. This prevents the "operation aborted" error that occurs when multiple components try to load the model simultaneously.

- **Detection Hook** (`src/hooks/usePersonDetection.ts`): Custom hook that:
  - Uses the singleton loader to get the model instance
  - Runs detection every 300ms (configurable)
  - Filters for "person" class detections
  - Applies confidence threshold (default 0.4-0.5)
  - Returns bounding boxes in pixel coordinates

- **Green vs Colored Boxes**:
  - **Green boxes**: Real-time AI-detected people (drawn from `personDetections` state)
  - **Red/Orange/Yellow boxes**: Simulated threat events (drawn from `detection` prop with risk-based colors)

### Video Management

Videos are stored in `public/videos/` organized by category (burglary, fight, shoplifting, vandalism).

- **Multi-video Cycling** (`src/config/videoSources.ts`): Each camera maps to an array of 2-3 videos that automatically cycle when one ends using the `onEnded` event
- **CCTVTile Component**: Manages video playback, detection overlays, and cycling logic
- **CameraModal Component**: Full-screen view with same detection capabilities

### State Management

Two React Context providers manage global state:

- **NotificationsContext** (`src/contexts/NotificationsContext.tsx`):
  - Simulates threat detection events every 5 seconds with 15% probability
  - Generates random detections (THEFT, FIGHT, ROBBERY, FALL, VANDALISM)
  - Shows toast notifications except on landing page
  - Tracks high-risk count for analytics

- **ReportsContext** (`src/contexts/ReportsContext.tsx`):
  - Stores user-reported incidents
  - Created when user clicks "Report" button on notifications
  - Used for Reports page display

### Detection Types

The system recognizes five threat types:
- `THEFT` - Unauthorized item removal
- `FIGHT` - Physical altercation
- `VANDALISM` - Property damage
- `ROBBERY` - Armed or forced theft (note: this is in code but not mentioned in current video files)
- `FALL` - Person falling (note: this is in code but not mentioned in current video files)

### Routing Structure

- `/` (Landing) - Welcome page
- `/monitor` (Index) - Main 3×3 CCTV grid with live detection
- `/realtime` - Placeholder for future AI integration
- `/upload` - Video upload functionality
- `/reports` - View all reported incidents
- `/analytics` - Detection statistics and charts

## Design System

Uses Tailwind CSS with custom design tokens for a cyberpunk CCTV aesthetic:

- **Primary**: Neon Teal (`hsl(176 100% 41%)`)
- **Alert Colors**: Risk-based (red/orange/yellow)
- **Effects**: Glassmorphism, scanlines, film grain overlays
- **Components**: shadcn/ui (Radix UI primitives)

## Key Implementation Notes

1. **TensorFlow Model Loading**: Always use the singleton `modelLoader` from `src/utils/modelLoader.ts`. Never call `cocoSsd.load()` directly in components.

2. **Video Element Refs**: Detection requires access to the video element via `videoRef`. Ensure the ref is properly passed to `usePersonDetection` hook.

3. **Coordinate Conversion**: Person detections return pixel coordinates `[x, y, width, height]` which must be converted to percentages based on video element dimensions for responsive positioning.

4. **Detection Intervals**: The 300ms detection interval balances responsiveness with performance. Can be adjusted per-camera via hook parameters.

5. **Video Paths**: Videos are served from `public/videos/` and referenced as `/videos/category/filename.mp4` in `videoSources.ts`.

6. **Branch Management**: The `frontend` branch contains the latest code. The `main` branch is for pull requests.
