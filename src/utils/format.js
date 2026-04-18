export function formatTimestampToReadable(timestamp) {
    const d = new Date(timestamp);
    return d.toLocaleString();
  }
  
  export function formatPercentage(value, decimals = 0) {
    return `${(value * 100).toFixed(decimals)}%`;
  }
  
  export function formatDuration(seconds) {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const secs = safeSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(secs).padStart(2, '0');
    return `${mm}:${ss}`;
  }