import { useEffect, useCallback } from 'react';
import { getPhotoStatus } from '../api/photoApi';

// Polls status for photos that are still pending/analyzing.
// Calls onUpdate(id, status) when status changes to 'done' or 'error'.
export function useAnalysisPoller(photos, onUpdate) {
  const poll = useCallback(async () => {
    const toCheck = photos.filter(
      (p) => p.analysis_status === 'pending' || p.analysis_status === 'queued' || p.analysis_status === 'analyzing'
    );
    for (const photo of toCheck) {
      try {
        const { analysis_status, analysis_error } = await getPhotoStatus(photo.id);
        if (analysis_status !== photo.analysis_status) {
          onUpdate(photo.id, analysis_status, analysis_error);
        }
      } catch {}
    }
  }, [photos, onUpdate]);

  useEffect(() => {
    const hasActive = photos.some(
      (p) => p.analysis_status === 'pending' || p.analysis_status === 'queued' || p.analysis_status === 'analyzing'
    );
    if (!hasActive) return;
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [photos, poll]);
}
