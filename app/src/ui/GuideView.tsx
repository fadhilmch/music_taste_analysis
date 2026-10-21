const STEPS: Array<[string, string]> = [
  ['Request your export', 'On spotify.com, open your Account page, then Account Privacy, then Download your data.'],
  ['Pick Extended streaming history', 'That covers the lifetime of your account - the regular account data export only covers the past year.'],
  ["Wait for Spotify's email", 'Spotify emails you a download link to a ZIP when your export is ready.'],
  ['Import here', 'Unzip, then drop the Streaming_History_Audio JSON files in. They are read in this tab and never uploaded.'],
];

export function GuideView() {
  return (
    <>
      <section className="tj-panel tj-guide-hero">
        <h3>Bring your listening history</h3>
        <p>
          Spotify's app and Recently Played only cover your most recent tracks. The account data
          export is the only way to get your full lifetime timeline. Four steps:
        </p>
      </section>
      <section className="tj-panel" aria-label="How to get your export">
        <div className="tj-panel-head">
          <h3>How to get your export</h3>
          <p className="tj-guide-tag">Official Spotify flow</p>
        </div>
        <ol className="tj-guide-steps">
          {STEPS.map(([title, body], i) => (
            <li key={title}>
              <span className="tj-guide-num" aria-hidden="true">{i + 1}</span>
              <div>
                <b>{title}</b>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="tj-guide-links">
          Keep the ZIP private: it can contain IP addresses and private-session details. Official
          Spotify guides:{' '}
          <a href="https://support.spotify.com/us/article/data-rights-and-privacy-settings/" target="_blank" rel="noreferrer">
            Data rights and privacy settings
          </a>{' '}
          and{' '}
          <a href="https://support.spotify.com/us/article/understanding-your-data/" target="_blank" rel="noreferrer">
            Understanding your data
          </a>
          .
        </p>
      </section>
    </>
  );
}
