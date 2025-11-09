// Video sources for each camera
// Each camera has multiple videos that will cycle when one ends
export const videoSources: Record<number, string[]> = {
  1: [
    '/videos/burglary/Burglary003_x264.mp4',
    '/videos/burglary/Burglary006_x264.mp4',
    '/videos/burglary/Burglary007_x264.mp4',
  ],
  2: [
    '/videos/fight/Fighting005_x264.mp4',
    '/videos/fight/Fighting027_x264.mp4',
    '/videos/fight/Fighting037_x264.mp4',
  ],
  3: [
    '/videos/shoplifting/Shoplifting009_x264.mp4',
    '/videos/shoplifting/Shoplifting020_x264.mp4',
    '/videos/shoplifting/Shoplifting042_x264.mp4',
  ],
  4: [
    '/videos/vandalism/Vandalism002_x264.mp4',
    '/videos/vandalism/Vandalism005_x264.mp4',
    '/videos/vandalism/Vandalism006_x264.mp4',
  ],
  5: [
    '/videos/burglary/Burglary009_x264.mp4',
    '/videos/burglary/Burglary017_x264.mp4',
    '/videos/burglary/Burglary019_x264.mp4',
  ],
  6: [
    '/videos/shoplifting/Shoplifting042_x264.mp4',
    '/videos/vandalism/Vandalism017_x264.mp4',
    '/videos/vandalism/Vandalism035_x264.mp4',
  ],
  7: [
    '/videos/burglary/Burglary024_x264.mp4',
    '/videos/vandalism/Vandalism036_x264.mp4',
    '/videos/vandalism/Vandalism040_x264.mp4',
  ],
  8: [
    '/videos/vandalism/Vandalism050_x264.mp4',
    '/videos/burglary/Burglary003_x264.mp4',
    '/videos/fight/Fighting005_x264.mp4',
  ],
  9: [
    '/videos/shoplifting/Shoplifting009_x264.mp4',
    '/videos/burglary/Burglary007_x264.mp4',
    '/videos/vandalism/Vandalism002_x264.mp4',
  ],
};

// Get video sources for a specific camera
export const getVideoSources = (cameraId: number): string[] | undefined => {
  return videoSources[cameraId];
};
