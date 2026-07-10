import { useState, useEffect, useRef } from 'react';

const CLASS_META = {
  'No DR':            { color: '#2F9E92', label: 'No signs detected' },
  'Mild':              { color: '#D9772E', label: 'Mild non-proliferative' },
  'Moderate':          { color: '#E0952F', label: 'Moderate non-proliferative' },
  'Severe':            { color: '#D65B2E', label: 'Severe non-proliferative' },
  'Proliferative DR':  { color: '#C23B2E', label: 'Proliferative' },
};

// ---------- Theme hook ----------
function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('retinaai-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('retinaai-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}

// ---------- Theme toggle button ----------
function ThemeToggle({ theme, onToggle, className = '' }) {
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle light/dark mode"
      className={`w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center hover:border-[var(--accent)] transition-colors ${className}`}
    >
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ---------- Iris / hero ----------
function Iris({ onOpen, theme, onToggleTheme }) {
  const [phase, setPhase] = useState('closed');

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('dilated'), 300),
      setTimeout(() => setPhase('glance1'), 1500),
      setTimeout(() => setPhase('glance2'), 2100),
      setTimeout(() => setPhase('center'), 2700),
      setTimeout(() => setPhase('revealed'), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const isOpen = phase !== 'closed';
  const isRevealed = phase === 'revealed';

  const pupilOffset = {
    closed: 'translate(0px, 0px)',
    dilated: 'translate(0px, 0px)',
    glance1: 'translate(28px, -10px)',
    glance2: 'translate(-26px, 8px)',
    center: 'translate(0px, 0px)',
    revealed: 'translate(0px, 0px)',
  }[phase];

  return (
    <section className="relative h-svh w-full overflow-hidden bg-[var(--bg)] flex items-center justify-center transition-colors">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} className="absolute top-6 right-6 z-30" />

      <svg
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
      >
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M400,400 Q ${400 + Math.cos(i) * 300},${400 + Math.sin(i * 1.3) * 250} ${
              400 + Math.cos(i * 2.1) * 380
            },${400 + Math.sin(i * 2.7) * 380}`}
            stroke="var(--accent)"
            strokeWidth="1.5"
            fill="none"
          />
        ))}
      </svg>

      <svg viewBox="0 0 400 400" 
      className="w-[75vw]
      sm:w-[65vw]
      md:w-[520px]
      max-w-[520px]
      aspect-square
      relative
      z-10
      "
>
        <defs>
          <radialGradient id="irisGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3a1f0f" />
            <stop offset="55%" stopColor="#D9772E" />
            <stop offset="100%" stopColor="var(--bg)" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="190" fill="url(#irisGrad)" />
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = (i / 40) * Math.PI * 2;
          const x1 = 200 + Math.cos(angle) * 70;
          const y1 = 200 + Math.sin(angle) * 70;
          const x2 = 200 + Math.cos(angle) * 185;
          const y2 = 200 + Math.sin(angle) * 185;
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--bg)" strokeWidth="1" opacity="0.35" />
          );
        })}

        <g
          style={{
            transformOrigin: '200px 200px',
            transition: 'transform 0.7s cubic-bezier(0.45, 0, 0.55, 1)',
            transform: pupilOffset,
          }}
        >
          <circle
            cx="200"
            cy="200"
            r={isOpen ? 165 : 18}
            fill="var(--pupil)"
            style={{ transition: 'r 1.1s cubic-bezier(0.16, 1, 0.3, 1), fill 0.3s ease' }}
          />
        </g>
      </svg>

      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pointer-events-none"
        style={{ opacity: isRevealed ? 1 : 0, transition: 'opacity 0.9s ease-out' }}
      >
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--text-tertiary)] mb-4">
          RetinaAI · Screening Tool
        </p>
        <h1 className="font-display text-[clamp(2.2rem,7vw,4.5rem)] leading-[1.05] text-[var(--text-primary)] max-w-3xl">
          See what the eye can't tell you on its own
        </h1>
        <p className="text-[var(--text-secondary)] mt-5 max-w-md text-base sm:text-lg">
          Upload a fundus photograph. Get a diabetic retinopathy grade and a visual explanation of why — in seconds.
        </p>
        <button
          onClick={onOpen}
          className="pointer-events-auto mt-9 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--accent-contrast)] font-semibold px-7 py-3 rounded-full transition-colors"
        >
          Begin screening
        </button>
        <p className="text-xs text-[var(--text-quaternary)] mt-6 max-w-sm">
          Research prototype — not a substitute for clinical diagnosis.
        </p>
      </div>

      <button
        onClick={onOpen}
        aria-label="Skip intro"
        className="absolute bottom-6 right-6 text-xs text-[var(--text-quaternary)] hover:text-[var(--text-secondary)] z-20 font-mono"
        style={{ opacity: isRevealed ? 1 : 0, transition: 'opacity 0.6s ease' }}
      >
        skip →
      </button>
    </section>
  );
}

// ---------- Workspace ----------
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

function Workspace({ theme, onToggleTheme }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/predict', {
  method: 'POST',
  body: formData
});
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Analysis failed');
      }
      setResult(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-svh bg-[var(--bg)] px-4 sm:px-6 py-14 transition-colors">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-contrast)]" />
            </div>
            <span className="font-display text-lg text-[var(--text-primary)]">RetinaAI</span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/DebugDyanmo/retinaai"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors font-mono"
            >
              source →
            </a>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>

        <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-6 sm:p-8 transition-colors">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 sm:p-12 text-center hover:border-[var(--accent)]/60 hover:bg-[var(--accent)]/5 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="Uploaded fundus" className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-xl border border-[var(--border-subtle)] mx-auto" />
            ) : (
              <>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">Drop a fundus photograph, or tap to choose one</p>
                <p className="font-mono text-xs text-[var(--text-quaternary)] mt-2">JPEG or PNG · up to 10MB</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          {file && (
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <p className="text-sm text-[var(--text-tertiary)] truncate flex-1 font-mono">{file.name}</p>
              <button
                onClick={handlePredict}
                disabled={loading}
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--border-subtle)] disabled:text-[var(--text-tertiary)] text-[var(--accent-contrast)] font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (<><Spinner />Analyzing</>) : 'Analyze image'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-[var(--err-bg)] border border-[var(--err-border)] text-[var(--err-text)] rounded-lg px-4 py-3 text-sm">
              Couldn't complete analysis: {error}
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6 grid md:grid-cols-2 gap-5">
            <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-6 sm:p-7 transition-colors">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-quaternary)] mb-4">Grade</h2>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm"
                style={{
                  color: CLASS_META[result.predicted_class]?.color,
                  borderColor: CLASS_META[result.predicted_class]?.color + '55',
                  backgroundColor: CLASS_META[result.predicted_class]?.color + '15',
                }}
              >
                {result.predicted_class}
              </div>
              <p className="text-[var(--text-tertiary)] text-sm mt-2">{CLASS_META[result.predicted_class]?.label}</p>
              <p className="font-mono text-[var(--text-secondary)] mt-3 text-sm">
                confidence: {(result.confidence * 100).toFixed(1)}%
              </p>

              {result.low_confidence_warning && (
                <div className="mt-4 bg-[var(--warn-bg)] border border-[var(--warn-border)] text-[var(--warn-text)] rounded-lg px-4 py-2.5 text-sm">
                  Low confidence — recommend manual review
                </div>
              )}

              <div className="mt-6 space-y-2.5">
                {Object.entries(result.all_class_probabilities)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cls, prob]) => (
                    <div key={cls} className="flex items-center gap-3 text-sm">
                      <span className="w-28 sm:w-32 text-[var(--text-secondary)] shrink-0">{cls}</span>
                      <div className="flex-1 bg-[var(--track-bg)] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${prob * 100}%`, backgroundColor: '#2F9E92' }}
                        />
                      </div>
                      <span className="w-10 text-right text-[var(--text-quaternary)] font-mono text-xs">
                        {(prob * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border)] p-6 sm:p-7 transition-colors">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-quaternary)] mb-4">
                Why the model sees it this way
              </h2>
              <img
                src={`data:image/png;base64,${result.heatmap_base64}`}
                alt="Grad-CAM heatmap"
                className="w-full rounded-xl border border-[var(--border)]"
              />
              <p className="text-xs text-[var(--text-quaternary)] mt-3">
                Warmer regions had more influence on the predicted grade.
              </p>
            </div>
          </div>
        )}

        <p className="font-mono text-xs text-[var(--text-quaternary)] text-center mt-10 max-w-lg mx-auto leading-relaxed">
          Research/educational use only — not a substitute for professional diagnosis.
          Model: EfficientNet-B3, fine-tuned on APTOS 2019 · Quadratic Kappa 0.77
        </p>
      </div>
    </section>
  );
}

// ---------- App ----------
function App() {
  const [entered, setEntered] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const workspaceRef = useRef(null);

  const handleOpen = () => {
    setEntered(true);
    setTimeout(() => workspaceRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  return (
    <div>
      <Iris onOpen={handleOpen} theme={theme} onToggleTheme={toggleTheme} />
      <div ref={workspaceRef}>
        {entered && <Workspace theme={theme} onToggleTheme={toggleTheme} />}
      </div>
    </div>
  );
}

export default App;