# ViewGuard — Live Surveillance System

AI-powered CCTV monitoring dashboard with real-time threat detection.

## Features

- **3×3 CCTV Grid**: Live feeds from 9 cameras with simulated detection events
- **AI Detection Overlays**: Bounding boxes with risk-based color coding (red/orange/yellow)
- **Real-time Notifications**: Persistent alerts panel with actionable buttons
- **Modal Expansion**: Click any tile to view full-screen feed with timeline
- **Accessibility**: Keyboard navigation, ARIA labels, AA color contrast
- **Data Export**: JSON export of all logged alerts and timestamps

## Detection Types

- `THEFT` — Unauthorized item removal
- `FIGHT` — Physical altercation
- `ROBBERY` — Armed or forced theft
- `FALL` — Person falling (injury risk)

## Alert Lifecycle

1. **Detection**: AI overlays appear with fade+scale animation
2. **Notification**: Alert added to right panel, toast shown
3. **Highlight**: Camera tile border pulses briefly
4. **Auto-clear**: Detection overlay disappears after 8 seconds
5. **Actions**: User can `Dismiss` or `Report` to alert security

## Keyboard Shortcuts

- `Enter` / `Space`: Expand focused camera tile
- `Esc`: Close expanded modal
- `Tab`: Navigate between tiles and buttons

## Settings

- **Auto-acknowledge**: Automatically dismiss alerts after timeout
- **Sensitivity**: Adjust detection threshold (Low/Medium/High)
- **Export Data**: Download JSON file of all alerts

## Sample Alert JSON

```json
{
  "notifications": [
    {
      "cameraId": 4,
      "type": "THEFT",
      "confidence": 92,
      "timestamp": "2025-01-10T14:32:15.000Z"
    }
  ],
  "exportedAt": "2025-01-10T14:35:00.000Z"
}
```

## Tech Stack

- **React** + **TypeScript**
- **Vite** — Fast development server and build tool
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components
- **Lucide React** icons
- **TensorFlow.js** — Real-time person detection with COCO-SSD

## Design System

### Colors (HSL)
- Primary (Neon Teal): `176 100% 41%`
- Accent (Magenta): `327 100% 64%`
- Alert High (Red): `2 100% 60%`
- Alert Medium (Orange): `30 100% 50%`
- Alert Low (Yellow): `50 100% 50%`
- Background: `220 20% 8%`

### Effects
- **Glassmorphism**: `backdrop-blur(10px)` with translucent backgrounds
- **Scanlines**: Repeating gradient overlays for CCTV realism
- **Film Grain**: SVG noise filter at 5% opacity
- **Neon Glow**: Box shadows with HSL alpha for risk levels

## Development

The frontend is built with **Vite**, a modern development server and build tool that provides fast hot module replacement (HMR) and optimized production builds.

### Getting Started

```bash
# Install dependencies
npm install

# Launch the frontend development server (runs on http://localhost:8080)
npm run dev
```

### Available Commands

- `npm run dev` — Start Vite development server on port 8080
- `npm run build` — Build for production
- `npm run build:dev` — Build for development mode
- `npm run preview` — Preview production build locally
- `npm run lint` — Run ESLint code linting

## Deployment

The application is automatically deployed to [https://viewguard.miami/](https://viewguard.miami/) via GitHub Pages using GitHub Actions.

### GitHub Pages Setup

The site uses a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:
- Automatically builds the Vite app on every push to `main` or `frontend` branches
- Deploys the built files to GitHub Pages
- Supports the custom domain `viewguard.miami` (configured via `CNAME` file)

The deployment happens automatically when changes are merged to the main or frontend branch. No manual deployment steps are required.

## License

MIT
