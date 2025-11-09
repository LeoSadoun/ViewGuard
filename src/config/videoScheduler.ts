// Global video scheduler to ensure no two cameras play the same video simultaneously

// All available videos organized by category
const allVideos = {
  burglary: [
    '/videos/burglary/Burglary003_x264.mp4',
    '/videos/burglary/Burglary006_x264.mp4',
    '/videos/burglary/Burglary007_x264.mp4',
    '/videos/burglary/Burglary009_x264.mp4',
    '/videos/burglary/Burglary017_x264.mp4',
    '/videos/burglary/Burglary019_x264.mp4',
    '/videos/burglary/Burglary024_x264.mp4',
  ],
  fight: [
    '/videos/fight/Fighting005_x264.mp4',
    '/videos/fight/Fighting027_x264.mp4',
    '/videos/fight/Fighting037_x264.mp4',
  ],
  shoplifting: [
    '/videos/shoplifting/Shoplifting009_x264.mp4',
    '/videos/shoplifting/Shoplifting020_x264.mp4',
    '/videos/shoplifting/Shoplifting042_x264.mp4',
  ],
  vandalism: [
    '/videos/vandalism/Vandalism002_x264.mp4',
    '/videos/vandalism/Vandalism005_x264.mp4',
    '/videos/vandalism/Vandalism006_x264.mp4',
    '/videos/vandalism/Vandalism017_x264.mp4',
    '/videos/vandalism/Vandalism035_x264.mp4',
    '/videos/vandalism/Vandalism036_x264.mp4',
    '/videos/vandalism/Vandalism040_x264.mp4',
    '/videos/vandalism/Vandalism050_x264.mp4',
  ],
};

// Flatten all videos into a single array
const allVideosList = Object.values(allVideos).flat();

// Shuffle array helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Track which video each camera is currently playing
const cameraCurrentVideo: Record<number, string> = {};

// Track the playlist for each camera
const cameraPlaylists: Record<number, string[]> = {};

// Initialize playlists for all 9 cameras
export function initializeVideoScheduler() {
  // Create a shuffled list of all videos
  const shuffled = shuffleArray(allVideosList);

  // Assign unique starting videos to each camera (cameras 1-9)
  for (let cameraId = 1; cameraId <= 9; cameraId++) {
    // Each camera gets a unique starting video
    const startIndex = (cameraId - 1) % shuffled.length;

    // Create a playlist starting from this video
    const playlist = [
      ...shuffled.slice(startIndex),
      ...shuffled.slice(0, startIndex),
    ];

    cameraPlaylists[cameraId] = playlist;
    cameraCurrentVideo[cameraId] = playlist[0];
  }

  console.log('📹 Video scheduler initialized');
  console.log('Initial videos:', cameraCurrentVideo);
}

// Get the current video for a camera
export function getCurrentVideo(cameraId: number): string {
  if (!cameraPlaylists[cameraId]) {
    initializeVideoScheduler();
  }
  return cameraCurrentVideo[cameraId];
}

// Get the next video for a camera (called when current video ends)
export function getNextVideo(cameraId: number): string {
  const playlist = cameraPlaylists[cameraId];
  const currentVideo = cameraCurrentVideo[cameraId];
  const currentIndex = playlist.indexOf(currentVideo);

  // Find the next video that's not currently playing on any other camera
  let attempts = 0;
  let nextIndex = (currentIndex + 1) % playlist.length;

  while (attempts < playlist.length) {
    const candidateVideo = playlist[nextIndex];

    // Check if this video is currently playing on another camera
    const isPlayingElsewhere = Object.entries(cameraCurrentVideo).some(
      ([camId, video]) => parseInt(camId) !== cameraId && video === candidateVideo
    );

    if (!isPlayingElsewhere) {
      // Found a unique video!
      cameraCurrentVideo[cameraId] = candidateVideo;
      console.log(`📹 Camera ${cameraId} switching to: ${candidateVideo.split('/').pop()}`);
      return candidateVideo;
    }

    // Try next video
    nextIndex = (nextIndex + 1) % playlist.length;
    attempts++;
  }

  // If all videos are taken (unlikely with 22 videos and 9 cameras), just use the next one
  const fallbackVideo = playlist[nextIndex];
  cameraCurrentVideo[cameraId] = fallbackVideo;
  console.warn(`⚠️ Camera ${cameraId} using fallback: ${fallbackVideo.split('/').pop()}`);
  return fallbackVideo;
}

// Get all videos for a camera (for initial setup)
export function getVideoPlaylist(cameraId: number): string[] {
  if (!cameraPlaylists[cameraId]) {
    initializeVideoScheduler();
  }
  return cameraPlaylists[cameraId];
}

// Initialize on module load
initializeVideoScheduler();
