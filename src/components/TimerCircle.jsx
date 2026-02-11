import { formatTime } from '../hooks/useBrewTimer';

export default function TimerCircle({ timeRemaining, totalTime, progress, isRunning, isComplete }) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="timer-circle-container">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--color-surface-alt)"
          strokeWidth="8"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={isComplete ? 'var(--color-success)' : 'var(--color-primary)'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
      <div className="timer-text">
        <span className="timer-time">{formatTime(timeRemaining)}</span>
        <span className="timer-label">
          {isComplete ? 'Done!' : isRunning ? 'Brewing...' : totalTime > 0 ? 'Paused' : 'Ready'}
        </span>
      </div>
    </div>
  );
}
