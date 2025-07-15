export function timeAgo(input: Date | string): string {
    const date = typeof input === "string" ? new Date(input) : input;
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
    if (isNaN(seconds) || seconds < 0) return "Just now";
  
    const intervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
  
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  
    return "Just now";
  }
  