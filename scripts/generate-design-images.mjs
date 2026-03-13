import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = path.resolve(new URL('..', import.meta.url).pathname);
const imageDir = path.join(rootDir, 'src/assets/images');

const sourceImages = {
  consultingHero: path.join(imageDir, 'consulting_hero.png'),
  portrait: path.join(imageDir, 'portrait_by_tutti.jpg'),
};

const outputImages = {
  hero: path.join(imageDir, 'design-hero-workflow-atmosphere.png'),
  painPoints: path.join(imageDir, 'design-pain-points-tool-chaos.png'),
  portrait: path.join(imageDir, 'design-keith-consulting-portrait.png'),
  process: path.join(imageDir, 'design-process-roadmap.png'),
};

const palette = {
  ink: '#170d19',
  plum: '#41204b',
  orchid: '#6f3c77',
  lilac: '#d8c1e7',
  mist: '#f3edf8',
  amber: '#d9a766',
  rose: '#c98eb6',
  mauve: '#8f77a3',
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
          <stop offset="0%" stop-color="${palette.ink}" stop-opacity="0.8"/>
          <stop offset="44%" stop-color="${palette.orchid}" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="${palette.plum}" stop-opacity="0.7"/>
        </linearGradient>
        <radialGradient id="leftGlow" cx="0.24" cy="0.36" r="0.4">
          <stop offset="0%" stop-color="${palette.rose}" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="${palette.rose}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="rightGlow" cx="0.82" cy="0.28" r="0.34">
          <stop offset="0%" stop-color="${palette.amber}" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="${palette.amber}" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="lineSoft" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(${rgb(palette.mist)}, 0.06)"/>
          <stop offset="45%" stop-color="rgba(${rgb(palette.lilac)}, 0.34)"/>
          <stop offset="100%" stop-color="rgba(${rgb(palette.amber)}, 0.14)"/>
        </linearGradient>
        <linearGradient id="chipStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="rgba(${rgb(palette.mist)}, 0.58)"/>
          <stop offset="100%" stop-color="rgba(${rgb(palette.rose)}, 0.18)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#heroWash)"/>
      <rect width="${width}" height="${height}" fill="url(#leftGlow)"/>
      <rect width="${width}" height="${height}" fill="url(#rightGlow)"/>

      <g opacity="0.5" stroke="url(#lineSoft)" stroke-linecap="round">
        <path d="${escapePath(`M ${width * 0.04} ${height * 0.62} C ${width * 0.18} ${height * 0.48}, ${width * 0.34} ${height * 0.78}, ${width * 0.5} ${height * 0.6} S ${width * 0.74} ${height * 0.42}, ${width * 0.96} ${height * 0.52}`)}" stroke-width="5"/>
        <path d="${escapePath(`M ${width * 0.08} ${height * 0.72} C ${width * 0.2} ${height * 0.58}, ${width * 0.36} ${height * 0.88}, ${width * 0.52} ${height * 0.7} S ${width * 0.76} ${height * 0.46}, ${width * 0.94} ${height * 0.66}`)}" stroke-width="4"/>
        <path d="${escapePath(`M ${width * 0.18} ${height * 0.26} C ${width * 0.32} ${height * 0.14}, ${width * 0.44} ${height * 0.18}, ${width * 0.58} ${height * 0.1} S ${width * 0.84} ${height * 0.1}, ${width * 0.96} ${height * 0.18}`)}" stroke-width="3"/>
      </g>

      <g opacity="0.34">
        <circle cx="${width * 0.18}" cy="${height * 0.66}" r="${height * 0.014}" fill="${palette.lilac}"/>
        <circle cx="${width * 0.48}" cy="${height * 0.59}" r="${height * 0.012}" fill="${palette.amber}"/>
        <circle cx="${width * 0.76}" cy="${height * 0.48}" r="${height * 0.013}" fill="${palette.mist}"/>
        <circle cx="${width * 0.62}" cy="${height * 0.11}" r="${height * 0.01}" fill="${palette.rose}"/>
      </g>

      <g opacity="0.28">
        <rect x="${width * 0.13}" y="${height * 0.18}" width="${width * 0.1}" height="${height * 0.1}" rx="26" fill="rgba(${rgb(palette.mist)}, 0.08)" stroke="url(#chipStroke)" stroke-width="2"/>
        <rect x="${width * 0.73}" y="${height * 0.68}" width="${width * 0.12}" height="${height * 0.11}" rx="26" fill="rgba(${rgb(palette.mist)}, 0.06)" stroke="url(#chipStroke)" stroke-width="2"/>
      </g>
    `
  );
}

function painPointsSvg(width, height) {
  const panelFill = `rgba(${rgb(palette.mist)}, 0.9)`;
  const panelStroke = `rgba(${rgb(palette.mauve)}, 0.22)`;
  const shadow = `rgba(${rgb(palette.ink)}, 0.16)`;

  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.ink}"/>
          <stop offset="60%" stop-color="${palette.plum}"/>
          <stop offset="100%" stop-color="${palette.orchid}"/>
        </linearGradient>
        <linearGradient id="divider" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(${rgb(palette.rose)}, 0.2)"/>
          <stop offset="100%" stop-color="rgba(${rgb(palette.amber)}, 0.28)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="44" fill="url(#bg)"/>
      <circle cx="${width * 0.15}" cy="${height * 0.2}" r="${height * 0.18}" fill="rgba(${rgb(palette.rose)}, 0.14)"/>
      <circle cx="${width * 0.86}" cy="${height * 0.17}" r="${height * 0.16}" fill="rgba(${rgb(palette.amber)}, 0.15)"/>
      <circle cx="${width * 0.75}" cy="${height * 0.82}" r="${height * 0.19}" fill="rgba(${rgb(palette.lilac)}, 0.12)"/>

      <rect x="${width * 0.5 - 1}" y="${height * 0.13}" width="2" height="${height * 0.74}" fill="url(#divider)"/>

      <g transform="translate(${width * 0.08}, ${height * 0.18})">
        <rect x="12" y="16" width="${width * 0.32}" height="${height * 0.22}" rx="30" fill="${shadow}"/>
        <rect width="${width * 0.32}" height="${height * 0.22}" rx="30" fill="${panelFill}" stroke="${panelStroke}" stroke-width="2"/>
        <rect x="${width * 0.022}" y="${height * 0.035}" width="${width * 0.084}" height="${height * 0.058}" rx="18" fill="rgba(${rgb(palette.plum)}, 0.9)"/>
        <rect x="${width * 0.122}" y="${height * 0.035}" width="${width * 0.12}" height="${height * 0.058}" rx="18" fill="rgba(${rgb(palette.mauve)}, 0.42)"/>
        <rect x="${width * 0.022}" y="${height * 0.117}" width="${width * 0.13}" height="${height * 0.03}" rx="10" fill="rgba(${rgb(palette.rose)}, 0.58)"/>
        <rect x="${width * 0.167}" y="${height * 0.117}" width="${width * 0.08}" height="${height * 0.03}" rx="10" fill="rgba(${rgb(palette.amber)}, 0.66)"/>
        <rect x="${width * 0.262}" y="${height * 0.117}" width="${width * 0.035}" height="${height * 0.03}" rx="10" fill="rgba(${rgb(palette.plum)}, 0.58)"/>
        <path d="${escapePath(`M ${width * 0.028} ${height * 0.166} C ${width * 0.05} ${height * 0.136}, ${width * 0.085} ${height * 0.216}, ${width * 0.115} ${height * 0.156} S ${width * 0.19} ${height * 0.126}, ${width * 0.225} ${height * 0.186}`)}" stroke="rgba(${rgb(palette.rose)}, 0.76)" stroke-width="8" stroke-linecap="round"/>
        <path d="${escapePath(`M ${width * 0.24} ${height * 0.17} L ${width * 0.275} ${height * 0.14} M ${width * 0.24} ${height * 0.14} L ${width * 0.275} ${height * 0.17}`)}" stroke="rgba(${rgb(palette.ink)}, 0.46)" stroke-width="6" stroke-linecap="round"/>
      </g>

      <g transform="translate(${width * 0.15}, ${height * 0.52}) rotate(-5)">
        <rect x="10" y="12" width="${width * 0.18}" height="${height * 0.16}" rx="24" fill="${shadow}"/>
        <rect width="${width * 0.18}" height="${height * 0.16}" rx="24" fill="${panelFill}" stroke="${panelStroke}" stroke-width="2"/>
        <circle cx="${width * 0.045}" cy="${height * 0.05}" r="${height * 0.016}" fill="rgba(${rgb(palette.amber)}, 0.78)"/>
        <circle cx="${width * 0.08}" cy="${height * 0.05}" r="${height * 0.016}" fill="rgba(${rgb(palette.rose)}, 0.78)"/>
        <path d="${escapePath(`M ${width * 0.025} ${height * 0.114} L ${width * 0.125} ${height * 0.114}`)}" stroke="rgba(${rgb(palette.mauve)}, 0.56)" stroke-width="10" stroke-linecap="round"/>
        <path d="${escapePath(`M ${width * 0.025} ${height * 0.144} L ${width * 0.11} ${height * 0.144}`)}" stroke="rgba(${rgb(palette.mauve)}, 0.44)" stroke-width="10" stroke-linecap="round"/>
      </g>

      <g opacity="0.5" stroke="rgba(${rgb(palette.lilac)}, 0.36)" stroke-width="4" stroke-linecap="round">
        <path d="${escapePath(`M ${width * 0.32} ${height * 0.28} C ${width * 0.39} ${height * 0.37}, ${width * 0.34} ${height * 0.47}, ${width * 0.42} ${height * 0.56}`)}"/>
        <path d="${escapePath(`M ${width * 0.28} ${height * 0.6} C ${width * 0.36} ${height * 0.64}, ${width * 0.34} ${height * 0.78}, ${width * 0.44} ${height * 0.82}`)}"/>
      </g>

      <g transform="translate(${width * 0.58}, ${height * 0.2})">
        <rect x="12" y="12" width="${width * 0.28}" height="${height * 0.24}" rx="30" fill="${shadow}"/>
        <rect width="${width * 0.28}" height="${height * 0.24}" rx="30" fill="${panelFill}" stroke="${panelStroke}" stroke-width="2"/>
        <rect x="${width * 0.03}" y="${height * 0.045}" width="${width * 0.072}" height="${height * 0.12}" rx="22" fill="rgba(${rgb(palette.plum)}, 0.88)"/>
        <rect x="${width * 0.12}" y="${height * 0.06}" width="${width * 0.09}" height="${height * 0.04}" rx="12" fill="rgba(${rgb(palette.mauve)}, 0.54)"/>
        <rect x="${width * 0.12}" y="${height * 0.112}" width="${width * 0.12}" height="${height * 0.04}" rx="12" fill="rgba(${rgb(palette.mauve)}, 0.32)"/>
        <rect x="${width * 0.12}" y="${height * 0.164}" width="${width * 0.075}" height="${height * 0.04}" rx="12" fill="rgba(${rgb(palette.mauve)}, 0.44)"/>
        <path d="${escapePath(`M ${width * 0.04} ${height * 0.17} C ${width * 0.088} ${height * 0.136}, ${width * 0.13} ${height * 0.168}, ${width * 0.176} ${height * 0.12} S ${width * 0.236} ${height * 0.106}, ${width * 0.264} ${height * 0.14}`)}" stroke="rgba(${rgb(palette.amber)}, 0.8)" stroke-width="7" stroke-linecap="round"/>
      </g>

      <g transform="translate(${width * 0.6}, ${height * 0.58})">
        <rect x="12" y="16" width="${width * 0.26}" height="${height * 0.18}" rx="30" fill="${shadow}"/>
        <rect width="${width * 0.26}" height="${height * 0.18}" rx="30" fill="${panelFill}" stroke="${panelStroke}" stroke-width="2"/>
        <g fill="rgba(${rgb(palette.plum)}, 0.8)">
          <circle cx="${width * 0.05}" cy="${height * 0.06}" r="${height * 0.014}"/>
          <circle cx="${width * 0.095}" cy="${height * 0.06}" r="${height * 0.014}"/>
          <circle cx="${width * 0.14}" cy="${height * 0.06}" r="${height * 0.014}"/>
        </g>
        <path d="${escapePath(`M ${width * 0.038} ${height * 0.12} V ${height * 0.16} M ${width * 0.085} ${height * 0.1} V ${height * 0.16} M ${width * 0.132} ${height * 0.085} V ${height * 0.16}`)}" stroke="rgba(${rgb(palette.mauve)}, 0.56)" stroke-width="8" stroke-linecap="round"/>
        <g fill="rgba(${rgb(palette.amber)}, 0.84)">
          <rect x="${width * 0.028}" y="${height * 0.12}" width="${width * 0.02}" height="${height * 0.03}" rx="10"/>
          <rect x="${width * 0.075}" y="${height * 0.115}" width="${width * 0.02}" height="${height * 0.036}" rx="10"/>
          <rect x="${width * 0.122}" y="${height * 0.128}" width="${width * 0.02}" height="${height * 0.024}" rx="10"/>
        </g>
      </g>

      <g opacity="0.56" stroke="rgba(${rgb(palette.mist)}, 0.42)" stroke-width="4" stroke-linecap="round">
        <path d="${escapePath(`M ${width * 0.48} ${height * 0.3} C ${width * 0.54} ${height * 0.28}, ${width * 0.58} ${height * 0.28}, ${width * 0.62} ${height * 0.32}`)}"/>
        <path d="${escapePath(`M ${width * 0.47} ${height * 0.57} C ${width * 0.54} ${height * 0.52}, ${width * 0.58} ${height * 0.52}, ${width * 0.64} ${height * 0.58}`)}"/>
      </g>
    `
  );
}

function processRoadmapSvg(width, height) {
  const stepY = [250, 570, 900, 1230];
  const steps = [
    { title: 'Discovery', accent: palette.rose },
    { title: 'Custom Plan', accent: palette.amber },
    { title: 'Setup', accent: palette.lilac },
    { title: 'Support', accent: palette.amber },
  ];

  const iconMarkup = [
    `
      <circle cx="0" cy="0" r="38" fill="rgba(${rgb(palette.rose)}, 0.16)"/>
      <rect x="-22" y="-26" width="44" height="52" rx="12" fill="${palette.rose}"/>
      <path d="M -10 -6 H 10 M -10 8 H 6" stroke="${palette.mist}" stroke-width="6" stroke-linecap="round"/>
    `,
    `
      <rect x="-42" y="-30" width="84" height="60" rx="20" fill="${palette.amber}"/>
      <path d="M -20 -8 H 18 M -20 10 H 8" stroke="${palette.ink}" stroke-width="7" stroke-linecap="round"/>
      <circle cx="24" cy="-14" r="10" fill="${palette.mist}"/>
    `,
    `
      <rect x="-56" y="-22" width="112" height="44" rx="18" fill="${palette.lilac}"/>
      <path d="M -24 -34 V 34 M 0 -34 V 34 M 24 -34 V 34" stroke="rgba(${rgb(palette.plum)}, 0.54)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="-24" cy="-4" r="11" fill="${palette.plum}"/>
      <circle cx="0" cy="8" r="11" fill="${palette.orchid}"/>
      <circle cx="24" cy="-10" r="11" fill="${palette.plum}"/>
    `,
    `
      <circle cx="0" cy="0" r="44" fill="${palette.amber}"/>
      <path d="M 0 -28 L 20 0 H 8 V 28 H -8 V 0 H -20 Z" fill="${palette.ink}"/>
      <circle cx="30" cy="-24" r="8" fill="${palette.mist}"/>
    `,
  ];

  return svg(
    width,
    height,
    `
      <defs>
        <linearGradient id="roadmapBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette.ink}"/>
          <stop offset="55%" stop-color="${palette.plum}"/>
          <stop offset="100%" stop-color="${palette.orchid}"/>
        </linearGradient>
        <linearGradient id="spine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(${rgb(palette.rose)}, 0.28)"/>
          <stop offset="50%" stop-color="rgba(${rgb(palette.lilac)}, 0.4)"/>
          <stop offset="100%" stop-color="rgba(${rgb(palette.amber)}, 0.28)"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="48" fill="url(#roadmapBg)"/>
      <path d="${escapePath(`M ${width * 0.54} 130 C ${width * 0.72} 240, ${width * 0.32} 380, ${width * 0.5} 560 S ${width * 0.7} 810, ${width * 0.42} 980 S ${width * 0.56} 1260, ${width * 0.36} 1410`)}" stroke="url(#spine)" stroke-width="10" stroke-linecap="round"/>

      <g opacity="0.3">
        <circle cx="${width * 0.18}" cy="${height * 0.16}" r="90" fill="rgba(${rgb(palette.rose)}, 0.24)"/>
        <circle cx="${width * 0.78}" cy="${height * 0.38}" r="120" fill="rgba(${rgb(palette.amber)}, 0.18)"/>
        <circle cx="${width * 0.2}" cy="${height * 0.72}" r="110" fill="rgba(${rgb(palette.lilac)}, 0.18)"/>
        <circle cx="${width * 0.76}" cy="${height * 0.9}" r="96" fill="rgba(${rgb(palette.amber)}, 0.18)"/>
      </g>

      ${steps
        .map(
          (step, index) => `
            <g transform="translate(${index % 2 === 0 ? width * 0.34 : width * 0.62}, ${stepY[index]})">
              <circle r="114" fill="rgba(${rgb(palette.mist)}, 0.08)" stroke="rgba(${rgb(palette.mist)}, 0.2)" stroke-width="2"/>
              <circle r="86" fill="rgba(${rgb(palette.mist)}, 0.9)"/>
              ${iconMarkup[index]}
            </g>
            <g transform="translate(${index % 2 === 0 ? width * 0.56 : width * 0.12}, ${stepY[index] - 34})">
              <rect width="${width * 0.28}" height="92" rx="24" fill="rgba(${rgb(palette.ink)}, 0.24)" stroke="rgba(${rgb(palette.mist)}, 0.16)" stroke-width="2"/>
              <rect x="18" y="18" width="${width * 0.06}" height="14" rx="7" fill="${step.accent}"/>
              <rect x="18" y="46" width="${width * 0.18}" height="12" rx="6" fill="rgba(${rgb(palette.mist)}, 0.74)"/>
              <rect x="18" y="66" width="${width * 0.12}" height="10" rx="5" fill="rgba(${rgb(palette.lilac)}, 0.48)"/>
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
          <stop offset="0%" stop-color="${palette.plum}" stop-opacity="0.34"/>
          <stop offset="60%" stop-color="${palette.rose}" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="${palette.ink}" stop-opacity="0.5"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#portraitWash)"/>
      <circle cx="${width * 0.18}" cy="${height * 0.14}" r="${width * 0.14}" fill="rgba(${rgb(palette.amber)}, 0.2)"/>
      <circle cx="${width * 0.84}" cy="${height * 0.18}" r="${width * 0.16}" fill="rgba(${rgb(palette.lilac)}, 0.16)"/>
      <circle cx="${width * 0.74}" cy="${height * 0.84}" r="${width * 0.18}" fill="rgba(${rgb(palette.rose)}, 0.14)"/>

      <g transform="translate(${width * 0.08}, ${height * 0.7})">
        <rect width="${width * 0.24}" height="${height * 0.14}" rx="24" fill="rgba(${rgb(palette.mist)}, 0.12)" stroke="rgba(${rgb(palette.mist)}, 0.18)" stroke-width="2"/>
        <rect x="${width * 0.03}" y="${height * 0.025}" width="${width * 0.012}" height="${height * 0.086}" rx="6" fill="${palette.amber}"/>
        <rect x="${width * 0.07}" y="${height * 0.04}" width="${width * 0.012}" height="${height * 0.07}" rx="6" fill="${palette.lilac}"/>
        <rect x="${width * 0.11}" y="${height * 0.015}" width="${width * 0.012}" height="${height * 0.096}" rx="6" fill="${palette.rose}"/>
        <path d="${escapePath(`M ${width * 0.15} ${height * 0.08} C ${width * 0.17} ${height * 0.046}, ${width * 0.19} ${height * 0.106}, ${width * 0.212} ${height * 0.06}`)}" stroke="${palette.mist}" stroke-width="6" stroke-linecap="round"/>
      </g>

      <g opacity="0.36" stroke="rgba(${rgb(palette.mist)}, 0.72)" stroke-width="2.4" stroke-linecap="round">
        <path d="${escapePath(`M ${width * 0.54} ${height * 0.16} C ${width * 0.68} ${height * 0.11}, ${width * 0.8} ${height * 0.2}, ${width * 0.92} ${height * 0.16}`)}"/>
        <path d="${escapePath(`M ${width * 0.58} ${height * 0.22} C ${width * 0.72} ${height * 0.18}, ${width * 0.84} ${height * 0.28}, ${width * 0.96} ${height * 0.24}`)}"/>
      </g>
    `
  );
}

async function createHeroImage() {
  const width = 1536;
  const height = 1024;
  const base = await duotone(sourceImages.consultingHero, {
    width,
    height,
    dark: palette.ink,
    light: '#c6a7dd',
    gamma: 0.9,
    position: 'attention',
  });

  await base
    .composite([
      { input: heroOverlay(width, height), blend: 'screen' },
      {
        input: svg(width, height, `<rect width="${width}" height="${height}" fill="rgba(${rgb(palette.ink)}, 0.1)"/>`),
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

async function createPortraitImage() {
  const width = 1200;
  const height = 1400;
  const base = await duotone(sourceImages.portrait, {
    width,
    height,
    dark: '#231426',
    light: '#f2e8df',
    gamma: 0.9,
    position: 'attention',
  });

  await base
    .composite([
      { input: portraitOverlay(width, height), blend: 'screen' },
      {
        input: svg(
          width,
          height,
          `<rect width="${width}" height="${height}" stroke="rgba(${rgb(palette.mist)}, 0.18)" stroke-width="22"/>`
        ),
        blend: 'screen',
      },
    ])
    .png()
    .toFile(outputImages.portrait);
}

async function createProcessImage() {
  const width = 1024;
  const height = 1536;
  await sharp(processRoadmapSvg(width, height)).png().toFile(outputImages.process);
}

await ensureDir(imageDir);
await createHeroImage();
await createPainPointsImage();
await createPortraitImage();
await createProcessImage();

console.log('Generated design image set.');
