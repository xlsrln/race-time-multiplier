
// Function to convert time string (HH:MM:SS) to seconds
export function timeToSeconds(timeString: string): number {
  // Handle empty input
  if (!timeString) return 0;
  
  const parts = timeString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS format
    return parts[0];
  }
  
  return 0;
}

// Function to convert seconds to time string (HH:MM:SS)
export function secondsToTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
}
