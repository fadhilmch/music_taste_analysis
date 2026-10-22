import { describe, expect, it } from 'vitest';
import { friendlyImportError } from '../state/store';

describe('friendlyImportError', () => {
  it('keeps parseExport’s own guidance', () => {
    expect(
      friendlyImportError(
        new Error('This file is not a Spotify streaming-history export (expected a JSON array).'),
      ),
    ).toContain('streaming-history export');
  });
  it('translates JSON syntax failures', () => {
    expect(friendlyImportError(new SyntaxError('Unexpected token < in JSON at position 0'))).toContain(
      'not valid JSON',
    );
  });
  it('translates raw platform errors like URL construction failures', () => {
    expect(friendlyImportError(new Error("Failed to construct 'URL': Invalid URL"))).toContain(
      'could not be read as a Spotify export',
    );
    expect(friendlyImportError(new Error("Failed to construct 'URL': Invalid URL"))).not.toContain('URL');
  });
});
