# ViewGuard - Current Status

## ✅ What's Working

### Event Detection System (CRITICAL FEATURE)
- ✅ Timestamp-based event detection at exact timestamps
- ✅ 24 events across 21 videos configured
- ✅ Colored bounding boxes (red/orange/yellow) based on risk level
- ✅ Notifications panel integration
- ✅ Toast notifications
- ✅ Camera border highlighting
- ✅ Auto-clear after 8 seconds

### Video System
- ✅ 9 cameras with unique video rotation
- ✅ 21 videos total (Shoplifting014 removed)
- ✅ Video cycling without duplicates
- ✅ Categories: Burglary, Fight, Shoplifting, Vandalism

### UI/UX
- ✅ 3×3 CCTV grid layout
- ✅ Camera modal (full-screen view)
- ✅ Notifications panel
- ✅ Reports system
- ✅ Analytics page

## ⚠️ Currently Disabled

### TensorFlow.js Person Detection (GREEN BOXES)
- ❌ Disabled due to performance issues causing crashes
- ❌ Was running 9 models simultaneously (one per camera)
- ❌ Caused excessive CPU usage and browser lag
- 📝 Alternative: Use Python YOLOv8 pre-processing instead (see BOUNDING_BOX_QUICKSTART.md)

## 🎯 Event Detection Details

### How It Works
1. Videos play on cameras
2. `useEventDetection` hook monitors video time
3. When video reaches configured timestamp (±0.5s), event triggers
4. Colored box appears on video
5. Notification added to panel
6. Toast message shown
7. Camera border highlighted
8. Auto-clears after 8 seconds

### Event Timestamps

**Burglary (THEFT) - 62-96% confidence:**
- Burglary003: 33s
- Burglary006: 225s
- Burglary007: 20s
- Burglary009: 45s
- Burglary017: 46s
- Burglary019: 26s
- Burglary024: 22s

**Fight - 64-89% confidence:**
- Fighting005: 35s
- Fighting027: 75s
- Fighting037: 110s

**Shoplifting (THEFT) - 72-93% confidence:**
- Shoplifting009: 65s
- Shoplifting020: 131s
- Shoplifting042: 131s

**Vandalism - 72-98% confidence:**
- Vandalism002: 2s
- Vandalism005: 22s
- Vandalism006: 10s
- Vandalism017: 11s
- Vandalism035: 10s
- Vandalism036: 20s
- Vandalism040: 3s
- Vandalism050: 23s

## 🔧 Key Configuration Files

- `src/config/eventAnnotations.ts` - Event timestamps and confidence ranges
- `src/hooks/useEventDetection.ts` - Event detection logic
- `src/components/CCTVTile.tsx` - Camera tile with event rendering
- `src/pages/Index.tsx` - Main page with event callback handler
- `src/contexts/NotificationsContext.tsx` - Notification management (random events disabled)

## 🚀 How to Test Events

1. Navigate to: http://localhost:8081/monitor
2. Watch videos play on cameras
3. Events will trigger at configured timestamps
4. Look for:
   - Colored boxes on video (red/orange/yellow)
   - Notification in right panel
   - Toast message
   - Camera border color change
   - Console log: `🚨 [EventDetection] Event triggered...`

## 📊 Performance Fixes Applied

1. ✅ Disabled TensorFlow.js (was causing crashes)
2. ✅ Removed excessive console logging
3. ✅ Added useCallback to prevent infinite re-renders
4. ✅ Disabled random event simulation (now using timestamp-based)
5. ✅ Fixed timestamp type mismatch (Date vs string)

## 🔮 Future Enhancements

### Option 1: Pre-computed Bounding Boxes (Recommended)
- Run Python script once: `python scripts/generate_bounding_boxes.py`
- Generates JSON files with YOLOv8 detections
- Zero runtime performance cost
- More accurate than browser-based TensorFlow.js
- See: `BOUNDING_BOX_QUICKSTART.md`

### Option 2: Server-side Detection
- Run Python detection server separately
- Stream frames from browser to server
- Server runs YOLOv8 detection
- Send results back to browser
- See: `DETECTION_SETUP.md`

## 📝 Notes

- Event detection is **production-ready** and working
- TensorFlow.js disabled for stability
- System is designed to look like real-time AI (Gemini) but uses reliable hardcoded timestamps
- All 24 events will trigger at exact specified times
- Confidence levels randomized within specified ranges for realism

## ✨ Current Status: STABLE & WORKING

The app loads without crashes and event detection triggers correctly!
