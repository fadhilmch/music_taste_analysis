import React from 'react';
import { useAppStore } from '../state/store';

export function SourceBar() {
  const source = useAppStore((s) => s.source);
  const fileName = useAppStore((s) => s.fileName);
  const loadDemo = useAppStore((s) => s.loadDemo);
  const loadFile = useAppStore((s) => s.loadFile);
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="tj-sourcebar">
      <div className="tj-source" role="group" aria-label="Data source">
        <button
          type="button"
          className={'tj-src' + (source === 'demo' ? ' is-on' : '')}
          onClick={loadDemo}
        >
          Demo data
        </button>
        <button
          type="button"
          className={'tj-src' + (source === 'export' ? ' is-on' : '')}
          onClick={() => inputRef.current?.click()}
        >
          Your export
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
      {source === 'demo' && (
        <p className="tj-srcnote">
          Everything below runs on invented demo data - same shape as a real Spotify export,
          so the screens stay identical when yours lands.
        </p>
      )}
      {source === 'export' && (
        <p className="tj-srcnote">
          {fileName ? `Reading ${fileName}. ` : ''}
          Your file is parsed in this browser tab and never uploaded. Only listening fields
          (time, track, artist, milliseconds played) are read; anything else in the export is ignored.
        </p>
      )}
    </div>
  );
}
