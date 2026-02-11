import { useState, useRef, useCallback, useEffect } from 'react';

export function useBrewTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((durationSeconds) => {
    clear();
    setTotalTime(durationSeconds);
    setTimeRemaining(durationSeconds);
    setIsComplete(false);
    setIsRunning(true);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIsRunning(false);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clear]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const resume = useCallback(() => {
    if (timeRemaining > 0 && !isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [timeRemaining, isRunning]);

  const reset = useCallback(() => {
    clear();
    setTimeRemaining(0);
    setTotalTime(0);
    setIsRunning(false);
    setIsComplete(false);
  }, [clear]);

  useEffect(() => {
    return clear;
  }, [clear]);

  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0;

  return {
    timeRemaining,
    totalTime,
    isRunning,
    isComplete,
    progress,
    start,
    pause,
    resume,
    reset,
  };
}

export function formatTime(seconds) {
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
