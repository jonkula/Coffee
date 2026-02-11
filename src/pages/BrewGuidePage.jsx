import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Check, Thermometer, Scale, Clock, Coffee } from 'lucide-react';
import { useCoffee } from '../context/CoffeeContext';
import { BREW_METHODS } from '../data/brewingMethods';
import { getBrewingSteps } from '../data/brewingSteps';
import { useBrewTimer, formatTime } from '../hooks/useBrewTimer';
import TimerCircle from '../components/TimerCircle';

const genericCoffee = {
  name: 'Generic Coffee',
  roastLevel: 'medium',
  flavorNotes: [],
  origin: { country: 'Unknown' },
};

export default function BrewGuidePage() {
  const { coffeeId, methodId } = useParams();
  const navigate = useNavigate();
  const { coffees } = useCoffee();
  const coffee = coffeeId === 'generic' ? genericCoffee : coffees.find((c) => c.id === coffeeId);
  const method = BREW_METHODS[methodId];
  const steps = getBrewingSteps(methodId, coffee);
  const timer = useBrewTimer();

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  if (!method || steps.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <h1>Not Found</h1>
          <div style={{ width: 24 }} />
        </header>
        <div className="empty-state">
          <p>Brewing method not found.</p>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  function goToStep(index) {
    timer.reset();
    setCurrentStep(index);
  }

  function nextStep() {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    timer.reset();
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    timer.reset();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleTimerAction() {
    if (timer.isComplete) {
      nextStep();
    } else if (timer.isRunning) {
      timer.pause();
    } else if (timer.timeRemaining > 0) {
      timer.resume();
    } else if (step.duration > 0) {
      timer.start(step.duration);
    }
  }

  return (
    <div className="page brew-guide-page">
      <header className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>{method.name}</h1>
        <div style={{ width: 24 }} />
      </header>

      {coffee && coffee !== genericCoffee && (
        <div className="brew-coffee-info">
          <Coffee size={16} />
          <span>{coffee.name}</span>
          <span className="brew-roast">{coffee.roastLevel.replace('-', ' ')}</span>
        </div>
      )}

      <div className="brew-params">
        <div className="param">
          <Thermometer size={16} />
          <div>
            <span className="param-label">Temp</span>
            <span className="param-value">
              {method.defaults.waterTemperature.min}–{method.defaults.waterTemperature.max}°F
            </span>
          </div>
        </div>
        <div className="param">
          <Scale size={16} />
          <div>
            <span className="param-label">Ratio</span>
            <span className="param-value">{method.defaults.ratio}</span>
          </div>
        </div>
        <div className="param">
          <Coffee size={16} />
          <div>
            <span className="param-label">Grind</span>
            <span className="param-value">{method.defaults.grindSize}</span>
          </div>
        </div>
        <div className="param">
          <Clock size={16} />
          <div>
            <span className="param-label">Time</span>
            <span className="param-value">
              {formatTime(method.defaults.brewTime.min)}–{formatTime(method.defaults.brewTime.max)}
            </span>
          </div>
        </div>
      </div>

      <div className="step-progress">
        {steps.map((s, i) => (
          <button
            key={i}
            className={`step-dot ${i === currentStep ? 'current' : ''} ${completedSteps.has(i) ? 'completed' : ''}`}
            onClick={() => goToStep(i)}
            aria-label={`Step ${i + 1}: ${s.title}`}
          />
        ))}
      </div>

      <div className="step-content">
        <div className="step-number">
          Step {currentStep + 1} of {steps.length}
        </div>
        <h2 className="step-title">{step.title}</h2>
        <p className="step-description">{step.description}</p>

        {step.timer && step.duration > 0 && (
          <div className="step-timer">
            <TimerCircle
              timeRemaining={timer.timeRemaining}
              totalTime={timer.totalTime || step.duration}
              progress={timer.progress}
              isRunning={timer.isRunning}
              isComplete={timer.isComplete}
            />

            <div className="timer-controls">
              <button className="timer-btn secondary" onClick={timer.reset}>
                <RotateCcw size={20} />
              </button>
              <button className="timer-btn primary" onClick={handleTimerAction}>
                {timer.isComplete ? (
                  <Check size={24} />
                ) : timer.isRunning ? (
                  <Pause size={24} />
                ) : (
                  <Play size={24} />
                )}
              </button>
              <div style={{ width: 48 }} />
            </div>
          </div>
        )}
      </div>

      <div className="step-navigation">
        <button
          className="step-nav-btn"
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        {!step.timer || step.duration === 0 || timer.isComplete ? (
          <button
            className="step-nav-btn primary"
            onClick={nextStep}
          >
            {isLastStep ? (
              <>
                <Check size={20} />
                Finish
              </>
            ) : (
              <>
                Next
                <ChevronRight size={20} />
              </>
            )}
          </button>
        ) : (
          <button
            className="step-nav-btn"
            onClick={nextStep}
          >
            Skip
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {isLastStep && completedSteps.has(currentStep) && (
        <div className="brew-complete">
          <h2>Brew Complete!</h2>
          <p>Enjoy your {method.name} coffee.</p>
          <button className="btn-primary" onClick={() => navigate(coffeeId === 'generic' ? '/' : `/coffee/${coffeeId}`)}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
