import { useState, useCallback } from 'react';
import { uploadPhoto } from '../api/photoApi';

export function useUpload(onComplete) {
  const [queue, setQueue] = useState([]); // [{id, file, progress, status, error}]

  const addFiles = useCallback(async (files) => {
    const items = Array.from(files).map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      progress: 0,
      status: 'pending', // pending | uploading | done | error
      error: null,
      photoId: null,
    }));

    setQueue((prev) => [...prev, ...items]);

    for (const item of items) {
      setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, status: 'uploading' } : q));
      try {
        const result = await uploadPhoto(item.file, (progress) => {
          setQueue((prev) => prev.map((q) => q.id === item.id ? { ...q, progress } : q));
        });
        setQueue((prev) => prev.map((q) =>
          q.id === item.id ? { ...q, status: 'done', progress: 1, photoId: result.id } : q
        ));
        if (onComplete) onComplete(result);
      } catch (err) {
        setQueue((prev) => prev.map((q) =>
          q.id === item.id ? { ...q, status: 'error', error: err.message } : q
        ));
      }
    }
  }, [onComplete]);

  const clearDone = useCallback(() => {
    setQueue((prev) => prev.filter((q) => q.status !== 'done'));
  }, []);

  return { queue, addFiles, clearDone };
}
