import { getTimeSinceLastUpdate, subscribeToStaleness } from '@/constants/sensor-data';
import { useEffect, useState } from 'react';

export type StalenessInfo = {
  isStale: boolean;
  formattedTime: string | null; // e.g., "5 minutes ago", "just now"
  timeSinceUpdateMs: number | null;
};

/**
 * Hook to track data staleness and format it for display
 */
export function useStalenessIndicator(): StalenessInfo {
  const [stalenessInfo, setStalenessInfo] = useState<StalenessInfo>({
    isStale: false,
    formattedTime: null,
    timeSinceUpdateMs: null,
  });

  useEffect(() => {
    // Subscribe to staleness changes
    const unsubscribeStaleness = subscribeToStaleness((isStale, timeSinceUpdate) => {
      setStalenessInfo((prev) => ({
        ...prev,
        isStale,
        timeSinceUpdateMs: timeSinceUpdate,
        formattedTime: formatTimeSinceUpdate(timeSinceUpdate),
      }));
    });

    // Update formatted time every 30 seconds
    const refreshInterval = setInterval(() => {
      const timeSinceUpdate = getTimeSinceLastUpdate();
      setStalenessInfo((prev) => ({
        ...prev,
        timeSinceUpdateMs: timeSinceUpdate,
        formattedTime: formatTimeSinceUpdate(timeSinceUpdate),
      }));
    }, 30000);

    // Initial update
    const timeSinceUpdate = getTimeSinceLastUpdate();
    setStalenessInfo({
      isStale: timeSinceUpdate ? timeSinceUpdate > 2 * 60 * 1000 : false,
      formattedTime: formatTimeSinceUpdate(timeSinceUpdate),
      timeSinceUpdateMs: timeSinceUpdate,
    });

    return () => {
      unsubscribeStaleness();
      clearInterval(refreshInterval);
    };
  }, []);

  return stalenessInfo;
}

function formatTimeSinceUpdate(timeSinceUpdateMs: number | null): string | null {
  if (timeSinceUpdateMs === null) {
    return null;
  }

  const seconds = Math.floor(timeSinceUpdateMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 30) {
    return 'just now';
  } else if (seconds < 60) {
    return `${seconds}s ago`;
  } else if (minutes < 60) {
    return minutes === 1 ? 'a minute ago' : `${minutes}m ago`;
  } else if (hours < 24) {
    return hours === 1 ? 'an hour ago' : `${hours}h ago`;
  } else {
    return days === 1 ? 'a day ago' : `${days}d ago`;
  }
}
