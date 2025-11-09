/**
 * Generates random historical timestamps between 2016-2023
 * All timestamps are after 5pm, with most during nighttime hours (8pm-4am)
 */
export const generateHistoricalTimestamp = (): Date => {
  // Random year between 2016-2023
  const year = 2016 + Math.floor(Math.random() * 8);

  // Random month (0-11)
  const month = Math.floor(Math.random() * 12);

  // Random day (1-28 to avoid month-end issues)
  const day = 1 + Math.floor(Math.random() * 28);

  // 70% chance of nighttime (8pm-4am), 30% chance of evening (5pm-8pm)
  let hour: number;
  if (Math.random() < 0.7) {
    // Nighttime: 20:00-04:00 (8pm-4am)
    // This is either 20-23 or 0-4
    if (Math.random() < 0.6) {
      // 20:00-23:59
      hour = 20 + Math.floor(Math.random() * 4);
    } else {
      // 00:00-04:00
      hour = Math.floor(Math.random() * 5);
    }
  } else {
    // Evening: 17:00-20:00 (5pm-8pm)
    hour = 17 + Math.floor(Math.random() * 3);
  }

  // Random minutes and seconds
  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);

  return new Date(year, month, day, hour, minute, second);
};
