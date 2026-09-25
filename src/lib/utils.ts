/**
 * Time formatting utility that provides clean relative timestamps (e.g. 'added 2 mins ago')
 */
export function formatTimeAgo(dateInput?: string | Date | null): string {
  if (!dateInput) return 'added recently';
  try {
    const time = typeof dateInput === 'string' ? new Date(dateInput).getTime() : new Date(dateInput).getTime();
    if (isNaN(time)) return 'added recently';

    const now = Date.now();
    const diffSecs = Math.max(0, Math.floor((now - time) / 1000));

    if (diffSecs < 60) {
      return 'added just now';
    }
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins === 1) {
      return 'added 1 min ago';
    }
    if (diffMins < 60) {
      return `added ${diffMins} mins ago`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) {
      return 'added 1 hr ago';
    }
    if (diffHours < 24) {
      return `added ${diffHours} hrs ago`;
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return 'added yesterday';
    }
    if (diffDays < 30) {
      return `added ${diffDays} days ago`;
    }
    return `added ${Math.floor(diffDays / 30)} mos ago`;
  } catch {
    return 'added recently';
  }
}
