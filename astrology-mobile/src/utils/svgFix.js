// Cleans CSS var(...) references from Kerykeion SVG output for React Native SVG compatibility.
// Handles both single-line var(--name) and multi-line var(\n  --name\n) patterns.

export function cleanSvgForMobile(svgStr) {
  if (!svgStr) return '';

  // Step 1: Normalize multi-line var() into single-line var()
  // Kerykeion sometimes outputs: var(\n        --kerykeion-chart-color-fire-percentage\n    )
  let cleaned = svgStr.replace(/var\(\s*(--[a-z0-9-_]+)\s*\)/gi, 'var($1)');

  const colorMap = {
    'var(--kerykeion-chart-color-paper-0)': '#0A0A1E',
    'var(--kerykeion-chart-color-paper-1)': '#141432',
    'var(--kerykeion-chart-color-sun)': '#FFD700',
    'var(--kerykeion-chart-color-moon)': '#F0F4F8',
    'var(--kerykeion-chart-color-mercury)': '#A78BFA',
    'var(--kerykeion-chart-color-venus)': '#F472B6',
    'var(--kerykeion-chart-color-mars)': '#EF4444',
    'var(--kerykeion-chart-color-jupiter)': '#F97316',
    'var(--kerykeion-chart-color-saturn)': '#EAB308',
    'var(--kerykeion-chart-color-uranus)': '#14B8A6',
    'var(--kerykeion-chart-color-neptune)': '#3B82F6',
    'var(--kerykeion-chart-color-pluto)': '#8B5CF6',
    'var(--kerykeion-chart-color-chiron)': '#10B981',
    'var(--kerykeion-chart-color-true-node)': '#EAB308',
    'var(--kerykeion-chart-color-mean-node)': '#EAB308',
    'var(--kerykeion-chart-color-mean-lilith)': '#C084FC',
    'var(--kerykeion-chart-color-first-house)': '#FFD700',
    'var(--kerykeion-chart-color-fourth-house)': '#3B82F6',
    'var(--kerykeion-chart-color-seventh-house)': '#F472B6',
    'var(--kerykeion-chart-color-tenth-house)': '#10B981',
    'var(--kerykeion-chart-color-fire-percentage)': '#FF4E50',
    'var(--kerykeion-chart-color-earth-percentage)': '#11998e',
    'var(--kerykeion-chart-color-air-percentage)': '#00B4DB',
    'var(--kerykeion-chart-color-water-percentage)': '#8E2DE2',
    'var(--kerykeion-chart-color-cardinal-percentage)': '#FF0080',
    'var(--kerykeion-chart-color-fixed-percentage)': '#7928CA',
    'var(--kerykeion-chart-color-mutable-percentage)': '#00DFD8',
    'var(--kerykeion-chart-color-conjunction)': '#10B981',
    'var(--kerykeion-chart-color-opposition)': '#EF4444',
    'var(--kerykeion-chart-color-trine)': '#3B82F6',
    'var(--kerykeion-chart-color-square)': '#F97316',
    'var(--kerykeion-chart-color-sextile)': '#8B5CF6',
    'var(--kerykeion-chart-color-quintile)': '#A78BFA',
    'var(--kerykeion-chart-color-semi-sextile)': '#6EE7B7',
    'var(--kerykeion-chart-color-semi-square)': '#FBBF24',
    'var(--kerykeion-chart-color-sesquiquadrate)': '#FB923C',
    'var(--kerykeion-chart-color-biquintile)': '#C4B5FD',
    'var(--kerykeion-chart-color-quincunx)': '#F9A8D4',
    'var(--kerykeion-chart-color-house-number)': '#94A3B8',
    'var(--kerykeion-chart-color-houses-radix-line)': '#475569',
  };

  // Extract inline style definitions
  const styleMatches = [...cleaned.matchAll(/(--kerykeion-chart-color-[a-z0-9-_]+)\s*:\s*([^;\}]+);/g)];
  for (const match of styleMatches) {
    colorMap[`var(${match[1]})`] = match[2].trim();
  }

  for (const [varName, colorVal] of Object.entries(colorMap)) {
    cleaned = cleaned.replaceAll(varName, colorVal);
  }

  // Catch any remaining var(--...)
  cleaned = cleaned.replace(/var\(--[a-z0-9-_]+\)/gi, '#94A3B8');

  return cleaned;
}
