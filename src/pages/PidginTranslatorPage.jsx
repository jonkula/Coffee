import { useState, useRef } from 'react';
import { ArrowLeftRight, Mic, MicOff, Volume2, Copy, Loader, Languages, Check } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

const PIDGIN_TO_ENGLISH = 'pidgin_to_english';
const ENGLISH_TO_PIDGIN = 'english_to_pidgin';

const SYSTEM_PROMPTS = {
  [PIDGIN_TO_ENGLISH]: `You are an expert Hawaiian Pidgin (Hawaii Creole English) translator.
Translate the given Hawaiian Pidgin text into clear, natural standard American English.
Preserve the meaning, emotion, and tone of the original.
Only output the translation itself — no explanations, no labels, no extra text.`,

  [ENGLISH_TO_PIDGIN]: `You are an expert Hawaiian Pidgin (Hawaii Creole English) translator.
Translate the given standard English text into authentic, natural Hawaiian Pidgin (Hawaii Creole English).
Use genuine Pidgin vocabulary, grammar patterns, and expressions (e.g., "brah", "da kine", "howzit", "stay", "fo real", "no can", "bumbye", "talk stink", "chicken skin", etc.).
Only output the translation itself — no explanations, no labels, no extra text.`,
};

const PLACEHOLDERS = {
  [PIDGIN_TO_ENGLISH]: 'E.g. "Eh brah, howzit? You stay hungry or what?"',
  [ENGLISH_TO_PIDGIN]: 'E.g. "Hey, how are you doing? Are you hungry?"',
};

export default function PidginTranslatorPage() {
  const [direction, setDirection] = useState(PIDGIN_TO_ENGLISH);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const abortRef = useRef(null);

  const isPidginToEnglish = direction === PIDGIN_TO_ENGLISH;

  async function translate() {
    if (!inputText.trim() || isTranslating) return;

    setIsTranslating(true);
    setOutputText('');
    setError('');

    try {
      const stream = client.messages.stream({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPTS[direction],
        messages: [{ role: 'user', content: inputText.trim() }],
      });

      abortRef.current = stream;

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          setOutputText((prev) => prev + event.delta.text);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(
          err instanceof Anthropic.AuthenticationError
            ? 'Invalid API key. Set VITE_ANTHROPIC_API_KEY in your .env file.'
            : 'Translation failed. Please try again.'
        );
      }
    } finally {
      setIsTranslating(false);
      abortRef.current = null;
    }
  }

  function swapDirection() {
    const newDirection = isPidginToEnglish ? ENGLISH_TO_PIDGIN : PIDGIN_TO_ENGLISH;
    setDirection(newDirection);
    // Swap texts so output becomes the new input
    setInputText(outputText);
    setOutputText(inputText);
    setError('');
  }

  function toggleVoiceInput() {
    if (isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  }

  function startVoiceInput() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser. Try Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setInputText(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoiceInput() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }

  function speakOutput() {
    if (!outputText || window.speechSynthesis.speaking) return;
    const utterance = new SpeechSynthesisUtterance(outputText);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  function copyOutput() {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function clearAll() {
    setInputText('');
    setOutputText('');
    setError('');
    if (isTranslating && abortRef.current) {
      abortRef.current.abort();
    }
  }

  const fromLabel = isPidginToEnglish ? 'Hawaiian Pidgin' : 'English';
  const toLabel = isPidginToEnglish ? 'English' : 'Hawaiian Pidgin';

  return (
    <div className="page pidgin-page">
      {/* Header */}
      <header className="pidgin-header">
        <div className="pidgin-brand">
          <Languages size={28} className="pidgin-brand-icon" />
          <div>
            <h1>Pidgin Translator</h1>
            <p className="subtitle">Hawaiian Pidgin ↔ English</p>
          </div>
        </div>
      </header>

      {/* Direction Toggle Bar */}
      <div className="direction-bar">
        <div className={`direction-chip ${isPidginToEnglish ? 'active' : ''}`}>
          {fromLabel}
        </div>

        <button className="swap-btn" onClick={swapDirection} title="Swap direction">
          <ArrowLeftRight size={18} />
        </button>

        <div className={`direction-chip ${!isPidginToEnglish ? 'active' : ''}`}>
          {toLabel}
        </div>
      </div>

      {/* Input Box */}
      <div className="translator-box">
        <div className="translator-box-header">
          <span className="box-lang-label">{fromLabel}</span>
          <button
            className={`mic-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Speak input'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            <span className="mic-label">{isListening ? 'Stop' : 'Speak'}</span>
          </button>
        </div>

        <textarea
          className="translator-textarea"
          placeholder={PLACEHOLDERS[direction]}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={5}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) translate();
          }}
        />

        {isListening && (
          <div className="listening-indicator">
            <span className="listening-dot" />
            <span className="listening-dot" />
            <span className="listening-dot" />
            <span>Listening...</span>
          </div>
        )}

        <div className="translator-box-footer">
          <span className="char-count">{inputText.length} chars</span>
          {inputText && (
            <button className="clear-text-btn" onClick={clearAll}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Translate Button */}
      <button
        className={`btn-primary btn-full translate-btn ${isTranslating ? 'is-translating' : ''}`}
        onClick={translate}
        disabled={!inputText.trim() || isTranslating}
      >
        {isTranslating ? (
          <>
            <Loader size={18} className="spinner" />
            Translating...
          </>
        ) : (
          <>
            <Languages size={18} />
            Translate
          </>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="translator-error">
          {error}
        </div>
      )}

      {/* Output Box */}
      {(outputText || isTranslating) && (
        <div className="translator-box output-box">
          <div className="translator-box-header">
            <span className="box-lang-label">{toLabel}</span>
            <div className="output-actions">
              <button
                className="action-icon-btn"
                onClick={speakOutput}
                disabled={!outputText}
                title="Speak translation"
              >
                <Volume2 size={18} />
              </button>
              <button
                className="action-icon-btn"
                onClick={copyOutput}
                disabled={!outputText}
                title="Copy translation"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="translator-output">
            {outputText || (
              <span className="streaming-dots">
                <span />
                <span />
                <span />
              </span>
            )}
          </div>

          {outputText && (
            <div className="translator-box-footer">
              <span className="char-count">{outputText.length} chars</span>
              {copied && <span className="copy-confirm">Copied!</span>}
            </div>
          )}
        </div>
      )}

      {/* Examples */}
      {!outputText && !isTranslating && (
        <div className="pidgin-examples">
          <p className="examples-title">Try an example</p>
          <div className="examples-list">
            {(isPidginToEnglish
              ? [
                  'Eh brah, howzit? You stay good?',
                  'No worry, bumbye goin be okay.',
                  'Da kine ono grinds, you like try?',
                  'Shoots! I goin catch you latahs.',
                ]
              : [
                  "Hey, how are you? Are you doing well?",
                  "Don't worry, eventually it will be okay.",
                  "That food is really delicious, want to try some?",
                  "Sounds good! I'll catch up with you later.",
                ]
            ).map((example) => (
              <button
                key={example}
                className="example-chip"
                onClick={() => setInputText(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
