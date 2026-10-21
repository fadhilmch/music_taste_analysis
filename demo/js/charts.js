// Inline-SVG chart renderers. No dependencies; each returns an SVG element.

const NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

// Horizontal bar chart of feature means (0..1). `highlight` names the key to accent.
export function barChart(rows, { highlight } = {}) {
  const width = 420;
  const rowHeight = 44;
  const labelWidth = 140;
  const valueWidth = 44;
  const barWidth = width - labelWidth - valueWidth - 16;
  const height = rows.length * rowHeight + 16;

  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', class: 'chart bars' });
  rows.forEach((row, i) => {
    const y = i * rowHeight + 8;
    const label = el('text', { x: 0, y: y + rowHeight / 2 + 4, class: 'chart-label' });
    label.textContent = row.label;
    svg.appendChild(label);

    svg.appendChild(el('rect', {
      x: labelWidth, y: y + rowHeight / 2 - 8, width: barWidth, height: 16, rx: 3, class: 'chart-track',
    }));
    svg.appendChild(el('rect', {
      x: labelWidth, y: y + rowHeight / 2 - 8,
      width: Math.max(2, barWidth * row.value), height: 16, rx: 3,
      class: row.key === highlight ? 'chart-bar is-highlight' : 'chart-bar',
    }));

    const value = el('text', {
      x: width, y: y + rowHeight / 2 + 4, 'text-anchor': 'end', class: 'chart-value',
    });
    value.textContent = row.value.toFixed(2);
    svg.appendChild(value);
  });
  return svg;
}

// Scatter plot of tracks on two 0..1 axes. `accentIndex` marks one point.
export function scatterChart(points, { xLabel, xLeft, xRight, yLabel, accentIndex } = {}) {
  const width = 420;
  const height = 320;
  const pad = { top: 24, right: 16, bottom: 52, left: 28 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', class: 'chart scatter' });

  for (const frac of [0.25, 0.5, 0.75]) {
    svg.appendChild(el('line', {
      x1: pad.left, x2: width - pad.right,
      y1: pad.top + innerH * frac, y2: pad.top + innerH * frac,
      class: 'chart-grid',
    }));
  }

  const yTitle = el('text', { x: pad.left, y: 14, class: 'chart-axis-note' });
  yTitle.textContent = yLabel;
  svg.appendChild(yTitle);

  points.forEach((p, i) => {
    svg.appendChild(el('circle', {
      cx: pad.left + innerW * p.x,
      cy: pad.top + innerH * (1 - p.y),
      r: 7,
      class: i === accentIndex ? 'chart-dot is-highlight' : 'chart-dot',
    }));
  });

  const left = el('text', { x: pad.left, y: height - 16, class: 'chart-axis-label' });
  left.textContent = xLeft;
  const mid = el('text', { x: pad.left + innerW / 2, y: height - 16, 'text-anchor': 'middle', class: 'chart-axis-label' });
  mid.textContent = xLabel;
  const right = el('text', { x: width - pad.right, y: height - 16, 'text-anchor': 'end', class: 'chart-axis-label' });
  right.textContent = xRight;
  svg.append(left, mid, right);
  return svg;
}
