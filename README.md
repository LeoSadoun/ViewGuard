# VigilantAI — Live Surveillance System

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
5. **Actions**: User can `Dismiss` or `Report false positive`

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
- **Tailwind CSS** with custom design tokens
- **shadcn/ui** components
- **Lucide React** icons

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

```bash
npm install
npm run dev
```

## License

MIT
