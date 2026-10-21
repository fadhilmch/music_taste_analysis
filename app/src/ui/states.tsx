export function LoadingState({ label }: { label: string }) {
  return (
    <div className="tj-state" role="status">
      <span className="tj-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return (
    <div className="tj-state tj-state-error" role="alert">
      <p className="tj-state-title">{title}</p>
      {detail && <p className="tj-state-detail">{detail}</p>}
      {onRetry && <button type="button" className="tj-btn" onClick={onRetry}>Try again</button>}
    </div>
  );
}

import React from 'react';
import { useAppStore } from '../state/store';

export function Onboarding() {
  const loadDemo = useAppStore((s) => s.loadDemo);
  const loadFile = useAppStore((s) => s.loadFile);
  const setView = useAppStore((s) => s.setView);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="tj-onboard">
      <p className="tj-kicker">Private - runs in your browser</p>
      <p className="tj-onboard-title">Your listening, turned into a journey.</p>
      <p className="tj-onboard-body">
        Take the demo for a spin, or drop in your own Spotify streaming history JSON.
        Your file is read in this tab only - nothing is uploaded.
      </p>
      <div className="tj-onboard-actions">
        <button type="button" className="tj-btn" onClick={loadDemo}>
          Try the demo journey
        </button>
        <button type="button" className="tj-btn tj-btn-ghost" onClick={() => inputRef.current?.click()}>
          Import your export
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".json,application/json"
          className="tj-fileinput"
          aria-label="Choose a Spotify streaming history JSON file"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void loadFile(f);
            e.target.value = '';
          }}
        />
      </div>
      <button type="button" className="tj-guidelink" onClick={() => setView('guide')}>
        How to get your Spotify export
      </button>
    </div>
  );
}
