import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const imageDir = path.join(rootDir, 'src/assets/images');

const sourceImages = {
  studioWide: path.join(imageDir, 'professional-music-studio-workspace--t3chat--1.png'),
  collaboration: path.join(imageDir, 'music-production-collaboration.png'),
  mastering: path.join(imageDir, 'audio-quality-transformation.png'),
  portrait: path.join(imageDir, 'portrait_by_tutti.jpg'),
};

const outputImages = {
  hero: path.join(imageDir, 'rhythm-hero-studio-ambition.png'),
  painPoints: path.join(imageDir, 'rhythm-pain-points-translation.png'),
  collab: path.join(imageDir, 'rhythm-finish-your-song-collab.png'),
  polish: path.join(imageDir, 'rhythm-polish-release-mastering.png'),
  process: path.join(imageDir, 'rhythm-process-journey.png'),
  portrait: path.join(imageDir, 'rhythm-keith-studio-portrait.png'),
};

const palette = {
  ink: '#1a1023',
  plum: '#3c214d',
  orchid: '#6a3c7b',
  lilac: '#d8c5e7',
  mist: '#f6eef9',
  amber: '#f2be72',
  rose: '#e58ab1',
  slate: '#7e8aa4',
};

const ensureDir = async dir => fs.mkdir(dir, { recursive: true });

const hexToRgb = hex => {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
};

const lerp = (start, end, amount) => start + (end - start) * amount;

const rgb = color => {
  const { r, g, b } = hexToRgb(color);
  return `${r}, ${g}, ${b}`;
};

const svg = (width, height, body) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">${body}</svg>`
  );

const escapePath = value => value.replaceAll(/\s+/g, ' ').trim();

async function duotone(source, options) {
  const {
    width,
    height,
    fit = 'cover',
    position = 'center',
    dark = palette.ink,
    light = palette.lilac,
    gamma = 0.92,
    alpha = 1,
  } = options;

  const { data, info } = await sharp(source)
    .resize(width, height, { fit, position })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const low = hexToRgb(dark);
  const high = hexToRgb(light);
  const output = Buffer.alloc(info.width * info.height * 4);

  for (let index = 0; index < info.width * info.height; index += 1) {
    const input = data[index] / 255;
    const value = Math.min(1, Math.max(0, input ** gamma));
    const offset = index * 4;
    output[offset] = Math.round(lerp(low.r, high.r, value));
    output[offset + 1] = Math.round(lerp(low.g, high.g, value));
    output[offset + 2] = Math.round(lerp(low.b, high.b, value));
    output[offset + 3] = Math.round(alpha * 255);
  }

  return sharp(output, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  });
}

function heroOverlay(width, height) {
  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="heroWash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.plum}" stop-opacity="0.72"/>
          <stop offset="45%" stop-color="${palette.orchid}" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="${palette.ink}" stop-opacity="0.72"/>
        </linearGradient>
        <radialGradient id="heroGlowA" cx="0.28" cy="0.28" r="0.42">
          <stop offset="0%" stop-color="${palette.rose}" stop-opacity="0.65"/>
          <stop offset="100%" stop-color="${palette.rose}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="heroGlowB" cx="0.76" cy="0.18" r="0.35">
          <stop offset="0%" stop-color="${palette.amber}" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="${palette.amber}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="lineA" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${palette.lilac}" stop-opacity="0.08"/>
          <stop offset="40%" stop-color="${palette.lilac}" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="${palette.amber}" stop-opacity="0.08"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#heroWash)"/>
      <rect width="${width}" height="${height}" fill="url(#heroGlowA)"/>
      <rect width="${width}" height="${height}" fill="url(#heroGlowB)"/>
      <g opacity="0.55" stroke="url(#lineA)" stroke-width="5" stroke-linecap="round">
        <path d="${escapePath(`M 0 ${height * 0.64} C ${width * 0.18} ${height * 0.55}, ${width * 0.28} ${height * 0.78}, ${width * 0.45} ${height * 0.65} S ${width * 0.72} ${height * 0.42}, ${width} ${height * 0.56}`)}"/>
        <path d="${escapePath(`M 0 ${height * 0.74} C ${width * 0.14} ${height * 0.62}, ${width * 0.26} ${height * 0.9}, ${width * 0.4} ${height * 0.72} S ${width * 0.72} ${height * 0.4}, ${width} ${height * 0.5}`)}"/>
        <path d="${escapePath(`M 0 ${height * 0.82} C ${width * 0.16} ${height * 0.76}, ${width * 0.28} ${height * 0.95}, ${width * 0.48} ${height * 0.82} S ${width * 0.78} ${height * 0.54}, ${width} ${height * 0.66}`)}"/>
      </g>
      <g opacity="0.3">
        <circle cx="${width * 0.18}" cy="${height * 0.28}" r="${height * 0.03}" fill="${palette.lilac}"/>
        <circle cx="${width * 0.83}" cy="${height * 0.36}" r="${height * 0.02}" fill="${palette.amber}"/>
        <circle cx="${width * 0.7}" cy="${height * 0.21}" r="${height * 0.012}" fill="${palette.mist}"/>
        <circle cx="${width * 0.63}" cy="${height * 0.66}" r="${height * 0.016}" fill="${palette.rose}"/>
      </g>
      <g opacity="0.24" stroke="rgba(${rgb(palette.mist)}, 0.8)" stroke-width="1.5">
        <line x1="${width * 0.11}" y1="${height * 0.1}" x2="${width * 0.3}" y2="${height * 0.1}"/>
        <line x1="${width * 0.7}" y1="${height * 0.86}" x2="${width * 0.89}" y2="${height * 0.86}"/>
      </g>
    `
  );
}

function painPointsSvg(width, height) {
  const cardFill = `rgba(${rgb(palette.mist)}, 0.72)`;
  const shadow = `rgba(${rgb(palette.ink)}, 0.18)`;

  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.ink}"/>
          <stop offset="50%" stop-color="${palette.plum}"/>
          <stop offset="100%" stop-color="${palette.orchid}"/>
        </linearGradient>
        <linearGradient id="waveStudio" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${palette.lilac}" stop-opacity="0.25"/>
          <stop offset="60%" stop-color="${palette.lilac}" stop-opacity="0.85"/>
          <stop offset="100%" stop-color="${palette.amber}" stop-opacity="0.45"/>
        </linearGradient>
        <linearGradient id="wavePhone" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${palette.rose}" stop-opacity="0.25"/>
          <stop offset="50%" stop-color="${palette.rose}" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="${palette.amber}" stop-opacity="0.45"/>
        </linearGradient>
        <linearGradient id="waveCar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${palette.amber}" stop-opacity="0.2"/>
          <stop offset="50%" stop-color="${palette.amber}" stop-opacity="0.92"/>
          <stop offset="100%" stop-color="${palette.lilac}" stop-opacity="0.48"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="44" fill="url(#bg)"/>
      <circle cx="${width * 0.18}" cy="${height * 0.16}" r="${height * 0.2}" fill="rgba(${rgb(palette.rose)}, 0.16)"/>
      <circle cx="${width * 0.82}" cy="${height * 0.2}" r="${height * 0.24}" fill="rgba(${rgb(palette.amber)}, 0.16)"/>
      <circle cx="${width * 0.68}" cy="${height * 0.88}" r="${height * 0.24}" fill="rgba(${rgb(palette.lilac)}, 0.16)"/>

      <g transform="translate(${width * 0.08}, ${height * 0.19})">
        <rect x="10" y="16" width="${width * 0.34}" height="${height * 0.44}" rx="34" fill="${shadow}"/>
        <rect width="${width * 0.34}" height="${height * 0.44}" rx="34" fill="${cardFill}" stroke="rgba(${rgb(palette.mist)}, 0.55)" stroke-width="2"/>
        <rect x="${width * 0.045}" y="${height * 0.09}" width="${width * 0.25}" height="${height * 0.23}" rx="24" fill="rgba(${rgb(palette.ink)}, 0.58)"/>
        <circle cx="${width * 0.095}" cy="${height * 0.205}" r="${height * 0.045}" fill="rgba(${rgb(palette.plum)}, 0.92)" stroke="rgba(${rgb(palette.lilac)}, 0.5)" stroke-width="8"/>
        <circle cx="${width * 0.245}" cy="${height * 0.205}" r="${height * 0.045}" fill="rgba(${rgb(palette.plum)}, 0.92)" stroke="rgba(${rgb(palette.lilac)}, 0.5)" stroke-width="8"/>
        <path d="${escapePath(`M ${width * 0.05} ${height * 0.325} C ${width * 0.1} ${height * 0.29}, ${width * 0.13} ${height * 0.36}, ${width * 0.18} ${height * 0.31} S ${width * 0.29} ${height * 0.25}, ${width * 0.315} ${height * 0.34}`)}" stroke="url(#waveStudio)" stroke-width="10" stroke-linecap="round"/>
        <g fill="rgba(${rgb(palette.orchid)}, 0.72)">
          <rect x="${width * 0.056}" y="${height * 0.36}" width="${width * 0.018}" height="${height * 0.08}" rx="9"/>
          <rect x="${width * 0.092}" y="${height * 0.33}" width="${width * 0.018}" height="${height * 0.11}" rx="9"/>
          <rect x="${width * 0.128}" y="${height * 0.35}" width="${width * 0.018}" height="${height * 0.09}" rx="9"/>
          <rect x="${width * 0.164}" y="${height * 0.31}" width="${width * 0.018}" height="${height * 0.13}" rx="9"/>
          <rect x="${width * 0.2}" y="${height * 0.34}" width="${width * 0.018}" height="${height * 0.1}" rx="9"/>
        </g>
      </g>

      <g transform="translate(${width * 0.63}, ${height * 0.21}) rotate(-3)">
        <rect x="8" y="8" width="${width * 0.19}" height="${height * 0.24}" rx="34" fill="${shadow}"/>
        <rect width="${width * 0.19}" height="${height * 0.24}" rx="34" fill="${cardFill}" stroke="rgba(${rgb(palette.mist)}, 0.48)" stroke-width="2"/>
        <rect x="${width * 0.044}" y="${height * 0.045}" width="${width * 0.102}" height="${height * 0.15}" rx="18" fill="rgba(${rgb(palette.ink)}, 0.65)"/>
        <path d="${escapePath(`M ${width * 0.054} ${height * 0.17} C ${width * 0.078} ${height * 0.13}, ${width * 0.09} ${height * 0.19}, ${width * 0.112} ${height * 0.147} S ${width * 0.133} ${height * 0.123}, ${width * 0.146} ${height * 0.164}`)}" stroke="url(#wavePhone)" stroke-width="7" stroke-linecap="round"/>
        <circle cx="${width * 0.095}" cy="${height * 0.205}" r="${height * 0.008}" fill="${palette.mist}"/>
      </g>

      <g transform="translate(${width * 0.57}, ${height * 0.56})">
        <rect x="16" y="16" width="${width * 0.28}" height="${height * 0.2}" rx="38" fill="${shadow}"/>
        <rect width="${width * 0.28}" height="${height * 0.2}" rx="38" fill="${cardFill}" stroke="rgba(${rgb(palette.mist)}, 0.48)" stroke-width="2"/>
        <path d="${escapePath(`M ${width * 0.03} ${height * 0.12} H ${width * 0.22} C ${width * 0.25} ${height * 0.12}, ${width * 0.255} ${height * 0.118}, ${width * 0.268} ${height * 0.1} L ${width * 0.275} ${height * 0.085}`)}" stroke="rgba(${rgb(palette.ink)}, 0.55)" stroke-width="12" stroke-linecap="round"/>
        <circle cx="${width * 0.067}" cy="${height * 0.11}" r="${height * 0.016}" fill="rgba(${rgb(palette.ink)}, 0.58)"/>
        <circle cx="${width * 0.16}" cy="${height * 0.11}" r="${height * 0.016}" fill="rgba(${rgb(palette.ink)}, 0.58)"/>
        <path d="${escapePath(`M ${width * 0.04} ${height * 0.16} C ${width * 0.08} ${height * 0.08}, ${width * 0.12} ${height * 0.18}, ${width * 0.16} ${height * 0.1} S ${width * 0.23} ${height * 0.07}, ${width * 0.245} ${height * 0.16}`)}" stroke="url(#waveCar)" stroke-width="8" stroke-linecap="round"/>
      </g>

      <g stroke="rgba(${rgb(palette.lilac)}, 0.28)" stroke-width="4" stroke-linecap="round">
        <path d="${escapePath(`M ${width * 0.39} ${height * 0.42} C ${width * 0.48} ${height * 0.3}, ${width * 0.56} ${height * 0.3}, ${width * 0.64} ${height * 0.38}`)}"/>
        <path d="${escapePath(`M ${width * 0.35} ${height * 0.58} C ${width * 0.49} ${height * 0.48}, ${width * 0.57} ${height * 0.5}, ${width * 0.73} ${height * 0.58}`)}"/>
      </g>
    `
  );
}

function masteringOverlay(width, height) {
  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="masterSplit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${palette.rose}" stop-opacity="0.22"/>
          <stop offset="50%" stop-color="${palette.mist}" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="${palette.amber}" stop-opacity="0.18"/>
        </linearGradient>
        <linearGradient id="frame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(${rgb(palette.mist)}, 0.48)"/>
          <stop offset="100%" stop-color="rgba(${rgb(palette.amber)}, 0.2)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="36" fill="url(#masterSplit)"/>
      <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="28" stroke="url(#frame)" stroke-width="2"/>
      <rect x="${width / 2 - 1}" y="70" width="2" height="${height - 140}" fill="rgba(${rgb(palette.mist)}, 0.65)"/>
      <circle cx="${width * 0.25}" cy="${height * 0.18}" r="${height * 0.12}" fill="rgba(${rgb(palette.rose)}, 0.16)"/>
      <circle cx="${width * 0.75}" cy="${height * 0.22}" r="${height * 0.12}" fill="rgba(${rgb(palette.amber)}, 0.14)"/>
      <g opacity="0.7" fill="rgba(${rgb(palette.amber)}, 0.54)">
        <rect x="${width * 0.12}" y="${height * 0.7}" width="${width * 0.015}" height="${height * 0.12}" rx="8"/>
        <rect x="${width * 0.148}" y="${height * 0.66}" width="${width * 0.015}" height="${height * 0.16}" rx="8"/>
        <rect x="${width * 0.176}" y="${height * 0.61}" width="${width * 0.015}" height="${height * 0.21}" rx="8"/>
        <rect x="${width * 0.204}" y="${height * 0.68}" width="${width * 0.015}" height="${height * 0.14}" rx="8"/>
      </g>
      <g opacity="0.72" fill="rgba(${rgb(palette.lilac)}, 0.6)">
        <rect x="${width * 0.78}" y="${height * 0.66}" width="${width * 0.015}" height="${height * 0.16}" rx="8"/>
        <rect x="${width * 0.808}" y="${height * 0.56}" width="${width * 0.015}" height="${height * 0.26}" rx="8"/>
        <rect x="${width * 0.836}" y="${height * 0.63}" width="${width * 0.015}" height="${height * 0.19}" rx="8"/>
        <rect x="${width * 0.864}" y="${height * 0.6}" width="${width * 0.015}" height="${height * 0.22}" rx="8"/>
      </g>
    `
  );
}

function processJourneySvg(width, height) {
  const centers = [220, 520, 820, 1120];
  const labels = [
    { title: 'Idea', icon: 'idea' },
    { title: 'Arrange', icon: 'arrange' },
    { title: 'Mix', icon: 'mix' },
    { title: 'Release', icon: 'release' },
  ];

  const iconMarkup = {
    idea: `
      <circle cx="0" cy="-8" r="40" fill="rgba(${rgb(palette.amber)}, 0.2)"/>
      <path d="M -18 -8 C -18 -28, -4 -40, 0 -40 C 8 -40, 22 -26, 22 -10 C 22 4, 12 10, 10 18 H -6 C -6 9, -18 6, -18 -8 Z" fill="${palette.amber}"/>
      <rect x="-2" y="18" width="16" height="10" rx="5" fill="${palette.mist}"/>
      <path d="M -34 -2 L -48 -8 M 34 -2 L 48 -8 M 0 -58 V -74" stroke="${palette.mist}" stroke-width="6" stroke-linecap="round"/>
    `,
    arrange: `
      <rect x="-54" y="-44" width="44" height="44" rx="16" fill="${palette.lilac}" opacity="0.82"/>
      <rect x="10" y="-44" width="44" height="44" rx="16" fill="${palette.mist}" opacity="0.9"/>
      <rect x="-54" y="20" width="44" height="44" rx="16" fill="${palette.mist}" opacity="0.92"/>
      <rect x="10" y="20" width="44" height="44" rx="16" fill="${palette.amber}" opacity="0.86"/>
      <path d="M -32 -24 C -22 -36, -8 -12, 2 -24 C 16 -40, 28 -12, 38 -22" stroke="${palette.plum}" stroke-width="8" stroke-linecap="round"/>
      <path d="M -32 42 C -18 26, -4 50, 8 36 C 20 22, 30 48, 40 34" stroke="${palette.orchid}" stroke-width="8" stroke-linecap="round"/>
    `,
    mix: `
      <rect x="-58" y="18" width="116" height="48" rx="18" fill="rgba(${rgb(palette.mist)}, 0.92)"/>
      <rect x="-44" y="-48" width="14" height="76" rx="7" fill="${palette.amber}"/>
      <rect x="-12" y="-58" width="14" height="86" rx="7" fill="${palette.lilac}"/>
      <rect x="20" y="-34" width="14" height="62" rx="7" fill="${palette.amber}"/>
      <path d="M -38 36 V 58 M -6 26 V 58 M 26 40 V 58" stroke="${palette.plum}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="-38" cy="44" r="12" fill="${palette.plum}"/>
      <circle cx="-6" cy="34" r="12" fill="${palette.orchid}"/>
      <circle cx="26" cy="48" r="12" fill="${palette.plum}"/>
    `,
    release: `
      <path d="M 0 -58 L 28 -10 H 12 V 56 H -12 V -10 H -28 Z" fill="${palette.lilac}"/>
      <path d="M 0 -48 L 16 -18 H 7 V 28 H -7 V -18 H -16 Z" fill="${palette.amber}"/>
      <path d="M -48 46 H 48" stroke="${palette.mist}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="-22" cy="14" r="10" fill="rgba(${rgb(palette.amber)}, 0.22)"/>
      <circle cx="32" cy="0" r="8" fill="rgba(${rgb(palette.rose)}, 0.24)"/>
      <circle cx="42" cy="-28" r="6" fill="rgba(${rgb(palette.mist)}, 0.42)"/>
    `,
  };

  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="processBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.ink}"/>
          <stop offset="60%" stop-color="${palette.plum}"/>
          <stop offset="100%" stop-color="${palette.orchid}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="48" fill="url(#processBg)"/>
      <path d="${escapePath(`M ${width / 2} 140 C ${width * 0.66} 210, ${width * 0.34} 300, ${width / 2} 380 S ${width * 0.7} 570, ${width / 2} 680 S ${width * 0.3} 880, ${width / 2} 980 S ${width * 0.62} 1130, ${width / 2} 1220`)}" stroke="rgba(${rgb(palette.mist)}, 0.3)" stroke-width="10" stroke-linecap="round"/>
      <g opacity="0.3">
        <circle cx="${width * 0.2}" cy="110" r="78" fill="rgba(${rgb(palette.rose)}, 0.28)"/>
        <circle cx="${width * 0.8}" cy="410" r="92" fill="rgba(${rgb(palette.amber)}, 0.26)"/>
        <circle cx="${width * 0.24}" cy="820" r="110" fill="rgba(${rgb(palette.lilac)}, 0.24)"/>
        <circle cx="${width * 0.76}" cy="1180" r="100" fill="rgba(${rgb(palette.amber)}, 0.2)"/>
      </g>
      ${labels
        .map(
          (label, index) => `
            <g transform="translate(${width / 2}, ${centers[index]})">
              <circle r="128" fill="rgba(${rgb(palette.mist)}, 0.1)" stroke="rgba(${rgb(palette.mist)}, 0.24)" stroke-width="2"/>
              <circle r="92" fill="rgba(${rgb(palette.mist)}, 0.9)"/>
              ${iconMarkup[label.icon]}
            </g>
          `
        )
        .join('')}
    `
  );
}

function portraitOverlay(width, height) {
  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="portraitWash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.plum}" stop-opacity="0.4"/>
          <stop offset="50%" stop-color="${palette.rose}" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="${palette.ink}" stop-opacity="0.45"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#portraitWash)"/>
      <circle cx="${width * 0.18}" cy="${height * 0.18}" r="${width * 0.14}" fill="rgba(${rgb(palette.amber)}, 0.22)"/>
      <circle cx="${width * 0.8}" cy="${height * 0.24}" r="${width * 0.17}" fill="rgba(${rgb(palette.lilac)}, 0.18)"/>
      <circle cx="${width * 0.76}" cy="${height * 0.84}" r="${width * 0.2}" fill="rgba(${rgb(palette.rose)}, 0.14)"/>
      <g transform="translate(${width * 0.06}, ${height * 0.68})" opacity="0.7">
        <rect x="0" y="0" width="${width * 0.22}" height="${height * 0.16}" rx="24" fill="rgba(${rgb(palette.mist)}, 0.15)" stroke="rgba(${rgb(palette.mist)}, 0.24)" stroke-width="2"/>
        <rect x="${width * 0.038}" y="${height * 0.028}" width="${width * 0.012}" height="${height * 0.1}" rx="6" fill="${palette.amber}"/>
        <rect x="${width * 0.08}" y="${height * 0.014}" width="${width * 0.012}" height="${height * 0.114}" rx="6" fill="${palette.lilac}"/>
        <rect x="${width * 0.122}" y="${height * 0.05}" width="${width * 0.012}" height="${height * 0.078}" rx="6" fill="${palette.amber}"/>
        <path d="${escapePath(`M ${width * 0.16} ${height * 0.06} C ${width * 0.182} ${height * 0.026}, ${width * 0.19} ${height * 0.086}, ${width * 0.212} ${height * 0.05}`)}" stroke="${palette.mist}" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g opacity="0.44" stroke="rgba(${rgb(palette.mist)}, 0.72)" stroke-width="2.4" stroke-linecap="round">
        <path d="${escapePath(`M ${width * 0.58} ${height * 0.16} C ${width * 0.72} ${height * 0.1}, ${width * 0.8} ${height * 0.18}, ${width * 0.92} ${height * 0.14}`)}"/>
        <path d="${escapePath(`M ${width * 0.56} ${height * 0.21} C ${width * 0.73} ${height * 0.17}, ${width * 0.82} ${height * 0.25}, ${width * 0.94} ${height * 0.22}`)}"/>
      </g>
    `
  );
}

async function createHeroImage() {
  const width = 1600;
  const height = 1000;
  const base = await duotone(sourceImages.studioWide, {
    width,
    height,
    dark: palette.ink,
    light: '#c4a6dc',
    gamma: 0.88,
  });

  await base
    .composite([
      { input: heroOverlay(width, height), blend: 'screen' },
      {
        input: svg(width, height, `<rect width="${width}" height="${height}" fill="rgba(${rgb(palette.ink)}, 0.15)"/>`),
        blend: 'multiply',
      },
    ])
    .png()
    .toFile(outputImages.hero);
}

async function createPainPointsImage() {
  const width = 1400;
  const height = 1100;
  await sharp(painPointsSvg(width, height)).png().toFile(outputImages.painPoints);
}

async function createCollaborationImage() {
  const width = 1400;
  const height = 1100;
  const base = sharp(sourceImages.collaboration).resize(width, height, { fit: 'cover', position: 'center' });

  await base
    .modulate({ saturation: 0.75, brightness: 0.96 })
    .composite([
      {
        input: svg(
          width,
          height,
          `
            <defs>
              <linearGradient id="collabWash" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${palette.plum}" stop-opacity="0.35"/>
                <stop offset="50%" stop-color="${palette.orchid}" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="${palette.ink}" stop-opacity="0.42"/>
              </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#collabWash)"/>
            <circle cx="${width * 0.18}" cy="${height * 0.17}" r="${height * 0.14}" fill="rgba(${rgb(palette.rose)}, 0.18)"/>
            <circle cx="${width * 0.84}" cy="${height * 0.13}" r="${height * 0.14}" fill="rgba(${rgb(palette.amber)}, 0.18)"/>
            <path d="${escapePath(`M ${width * 0.06} ${height * 0.76} C ${width * 0.24} ${height * 0.68}, ${width * 0.38} ${height * 0.82}, ${width * 0.54} ${height * 0.72} S ${width * 0.83} ${height * 0.58}, ${width * 0.96} ${height * 0.68}`)}" stroke="rgba(${rgb(palette.mist)}, 0.34)" stroke-width="6" stroke-linecap="round"/>
          `
        ),
        blend: 'multiply',
      },
    ])
    .png()
    .toFile(outputImages.collab);
}

async function createMasteringImage() {
  const width = 1400;
  const height = 1100;
  const base = sharp(sourceImages.mastering).resize(width, height, { fit: 'cover', position: 'center' });

  await base
    .extend({
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      background: palette.ink,
    })
    .composite([{ input: masteringOverlay(width, height), blend: 'screen' }])
    .png()
    .toFile(outputImages.polish);
}

async function createProcessImage() {
  const width = 1000;
  const height = 1400;
  await sharp(processJourneySvg(width, height)).png().toFile(outputImages.process);
}

async function createPortraitImage() {
  const width = 1200;
  const height = 1400;
  const base = await duotone(sourceImages.portrait, {
    width,
    height,
    dark: '#27182f',
    light: '#f5e7db',
    gamma: 0.9,
    position: 'attention',
  });

  await base
    .composite([{ input: portraitOverlay(width, height), blend: 'screen' }])
    .png()
    .toFile(outputImages.portrait);
}

await ensureDir(imageDir);
await createHeroImage();
await createPainPointsImage();
await createCollaborationImage();
await createMasteringImage();
await createProcessImage();
await createPortraitImage();

console.log('Generated rhythm image set.');
