import { PROFILES, FEATURES, ALL_TRACKS } from './data.js';
import { mean, strongestTrait, meanTempo } from './stats.js';
import { rankMatches } from './match.js';
import { barChart, scatterChart } from './charts.js';

const state = {
  profile: 'you',
  pair: 'energy-valence',
  energy: 65,
  danceability: 60,
  valence: 55,
};

const $ = (id) => document.getElementById(id);

function renderProfile() {
  const profile = PROFILES[state.profile];
  $('profile-blurb').textContent = profile.blurb;

  const best = strongestTrait(profile.tracks, FEATURES);
  const rows = FEATURES.map(([key, label]) => ({ key, label, value: mean(profile.tracks, key) }));
  const chartHost = $('profile-chart');
  chartHost.replaceChildren(barChart(rows, { highlight: best.key }));
  $('profile-note').textContent = `${best.label} leads this profile. The teal bar is the strongest trait.`;

  $('fact-tempo').textContent = `${meanTempo(profile.tracks)} BPM`;
  $('fact-tracks').textContent = String(profile.tracks.length);
  $('fact-trait').textContent = best.label;

  document.querySelectorAll('#profile-picker button').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.value === state.profile);
    btn.setAttribute('aria-pressed', String(btn.dataset.value === state.profile));
  });
}

function renderScatter() {
  const profile = PROFILES[state.profile];
  const useDance = state.pair === 'dance-valence';
  const points = profile.tracks.map((t) => ({ x: useDance ? t.danceability : t.valence, y: t.energy }));
  let accentIndex = 0;
  points.forEach((p, i) => { if (p.x > points[accentIndex].x) accentIndex = i; });

  const host = $('scatter-chart');
  host.replaceChildren(scatterChart(points, {
    xLabel: useDance ? 'Danceability' : 'Happiness',
    xLeft: useDance ? 'Sitting still' : 'Gloomy',
    xRight: useDance ? 'Nonstop' : 'Euphoric',
    yLabel: 'Energy ↑',
    accentIndex,
  }));
  $('scatter-summary').textContent = `${profile.label}: ${profile.tracks.length} demo tracks`;
  $('scatter-note').textContent =
    `The vertical axis is energy, from calm at the bottom to intense at the top. ` +
    `The teal dot is the profile's most ${useDance ? 'danceable' : 'euphoric'} track.`;

  document.querySelectorAll('#pair-picker button').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.value === state.pair);
    btn.setAttribute('aria-pressed', String(btn.dataset.value === state.pair));
  });
}

function renderMatches() {
  const target = {
    energy: state.energy / 100,
    danceability: state.danceability / 100,
    valence: state.valence / 100,
  };
  const matches = rankMatches(ALL_TRACKS, target, 3);
  const list = $('match-list');
  list.replaceChildren(
    ...matches.map((m, i) => {
      const li = document.createElement('li');
      li.className = 'match';
      li.innerHTML =
        `<span class="match-number">${i + 1}</span>` +
        `<span class="match-body"><strong>${m.track.name} - ${m.track.artist}</strong>` +
        `<span class="match-vibe">${m.track.vibe}</span></span>` +
        `<span class="match-score">${m.score}% match</span>`;
      return li;
    }),
  );
  $('energy-value').textContent = `${state.energy} out of 100`;
  $('danceability-value').textContent = `${state.danceability} out of 100`;
  $('valence-value').textContent = `${state.valence} out of 100`;
}

function bindPicker(id, key, render) {
  $(id).addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-value]');
    if (!btn) return;
    state[key] = btn.dataset.value;
    render();
  });
}

function bindSlider(id, key) {
  $(id).addEventListener('input', (event) => {
    state[key] = Number(event.target.value);
    renderMatches();
  });
}

bindPicker('profile-picker', 'profile', () => { renderProfile(); renderScatter(); });
bindPicker('pair-picker', 'pair', renderScatter);
bindSlider('slider-energy', 'energy');
bindSlider('slider-danceability', 'danceability');
bindSlider('slider-valence', 'valence');

renderProfile();
renderScatter();
renderMatches();
