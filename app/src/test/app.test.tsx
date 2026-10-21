import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { useAppStore } from '../state/store';

describe('App', () => {
  it('starts empty, then loads the demo and switches views', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText(/Your listening, turned into a journey/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Demo data' }));
    expect(screen.getAllByText(/invented demo data/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('img', { name: /Monthly listening minutes/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Genres' }));
    expect(screen.getByRole('img', { name: /Genre mix per month/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Uncategorized/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/left blank, never guessed/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Artists' }));
    expect(screen.getByText('Top artists')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tracks' }));
    expect(screen.getByText('Top tracks')).toBeInTheDocument();

    expect(useAppStore.getState().source).toBe('demo');
    expect(useAppStore.getState().genresAreDemo).toBe(true);
  });


  it('shows the import guide from the empty state and the nav', async () => {
    useAppStore.getState().reset();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'How to get your Spotify export' }));
    expect(useAppStore.getState().view).toBe('guide');
    expect(screen.getByText('Bring your listening history')).toBeInTheDocument();
    expect(screen.getByText('Pick Extended streaming history')).toBeInTheDocument();
    expect(screen.getByText(/read in this tab and never uploaded/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Understanding your data/i })).toHaveAttribute(
      'href',
      'https://support.spotify.com/us/article/understanding-your-data/',
    );

    await user.click(screen.getByRole('button', { name: 'Demo data' }));
    await user.click(screen.getByRole('button', { name: 'Guide' }));
    expect(screen.getByText('How to get your export')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /Monthly listening minutes/i })).not.toBeInTheDocument();
    useAppStore.getState().setView('journey');
  });

  it('switches time ranges', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Demo data' }));
    await user.click(screen.getByRole('button', { name: '6 months' }));
    expect(useAppStore.getState().range).toBe('6m');
  });
});
