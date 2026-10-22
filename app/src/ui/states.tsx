export function LoadingState({ label }: { label: string }) {
  return (
    <div className="tj-state" role="status">
      <span className="tj-spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  title,
  detail,
  onRetry,
  retryLabel,
}: {
  title: string;
  detail?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div className="tj-state tj-state-error" role="alert">
      <p className="tj-state-title">{title}</p>
      {detail && <p className="tj-state-detail">{detail}</p>}
      {onRetry && (
        <Button className="self-center!" onClick={onRetry}>
          {retryLabel ?? 'Try again'}
        </Button>
      )}
    </div>
  );
}

import React from 'react';
import { Button, FileInput, Kicker } from './primitives';
import { useAppStore } from '../state/store';

export function Onboarding() {
  const loadDemo = useAppStore((s) => s.loadDemo);
  const loadFile = useAppStore((s) => s.loadFile);
  const setView = useAppStore((s) => s.setView);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="tj-onboard">
      <Kicker>Private - runs in your browser</Kicker>
      <p className="tj-onboard-title">Your listening, turned into a journey.</p>
      <p className="tj-onboard-body">
        Take the demo for a spin, or drop in your own Spotify streaming history JSON. Your file is read in
        this tab only - nothing is uploaded.
      </p>
      <div className="tj-onboard-actions">
        <Button onClick={loadDemo}>Try the demo journey</Button>
        <Button variant="ghost" onClick={() => inputRef.current?.click()}>
          Import your export
        </Button>
        <FileInput
          inputRef={inputRef}
          label="Choose a Spotify streaming history JSON file"
          onFile={(f) => void loadFile(f)}
        />
      </div>
      <button type="button" className="tj-guidelink" onClick={() => setView('guide')}>
        How to get your Spotify export
      </button>
    </div>
  );
}
