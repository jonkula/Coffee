import sharp from 'sharp';

const COLOR_FAMILIES = [
  { name: 'red',     r: [180, 255], g: [0, 80],   b: [0, 80]   },
  { name: 'orange',  r: [200, 255], g: [100, 180], b: [0, 80]   },
  { name: 'yellow',  r: [180, 255], g: [180, 255], b: [0, 100]  },
  { name: 'green',   r: [0, 100],   g: [120, 255], b: [0, 120]  },
  { name: 'teal',    r: [0, 100],   g: [150, 255], b: [120, 255]},
  { name: 'blue',    r: [0, 100],   g: [0, 120],   b: [150, 255]},
  { name: 'purple',  r: [100, 200], g: [0, 100],   b: [150, 255]},
  { name: 'pink',    r: [200, 255], g: [50, 150],  b: [100, 200]},
  { name: 'brown',   r: [100, 200], g: [60, 140],  b: [0, 80]   },
  { name: 'black',   r: [0, 60],    g: [0, 60],    b: [0, 60]   },
  { name: 'white',   r: [200, 255], g: [200, 255], b: [200, 255]},
  { name: 'gray',    r: [60, 200],  g: [60, 200],  b: [60, 200] },
];

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function inRange(val, [min, max]) {
  return val >= min && val <= max;
}

function classifyFamily(r, g, b) {
  // Check neutrals first (black/white/gray require similar RGB)
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  if (spread < 40) {
    if (r < 60) return 'black';
    if (r > 200) return 'white';
    return 'gray';
  }
  for (const fam of COLOR_FAMILIES) {
    if (inRange(r, fam.r) && inRange(g, fam.g) && inRange(b, fam.b)) {
      return fam.name;
    }
  }
  return 'neutral';
}

// Accepts either a file path (string) or a Buffer
export async function analyzeColors(source) {
  try {
    const { data } = await sharp(source)
      .resize(150, 150, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    const step = 3;
    for (let i = 0; i < data.length; i += step * 3) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    const k = 5;
    // Initialize centroids by picking evenly spaced pixels
    let centroids = Array.from({ length: k }, (_, i) =>
      [...pixels[Math.floor((i * pixels.length) / k)]]
    );

    let assignments = new Array(pixels.length).fill(0);
    for (let iter = 0; iter < 10; iter++) {
      // Assign each pixel to nearest centroid
      for (let i = 0; i < pixels.length; i++) {
        let minDist = Infinity;
        for (let c = 0; c < k; c++) {
          const d = pixels[i].reduce((sum, v, j) => sum + (v - centroids[c][j]) ** 2, 0);
          if (d < minDist) { minDist = d; assignments[i] = c; }
        }
      }
      // Recompute centroids
      const sums = Array.from({ length: k }, () => [0, 0, 0, 0]); // r,g,b,count
      for (let i = 0; i < pixels.length; i++) {
        const c = assignments[i];
        sums[c][0] += pixels[i][0];
        sums[c][1] += pixels[i][1];
        sums[c][2] += pixels[i][2];
        sums[c][3]++;
      }
      centroids = sums.map(([r, g, b, count]) =>
        count > 0 ? [Math.round(r / count), Math.round(g / count), Math.round(b / count)] : [128, 128, 128]
      );
    }

    // Count cluster sizes for percentage
    const counts = new Array(k).fill(0);
    for (const a of assignments) counts[a]++;
    const total = pixels.length;

    const colors = centroids
      .map(([r, g, b], i) => ({
        hex: rgbToHex(r, g, b),
        family: classifyFamily(r, g, b),
        percent: Math.round((counts[i] / total) * 100),
      }))
      .sort((a, b) => b.percent - a.percent);

    const primaryFamily = colors[0].family;

    return { dominant_colors: JSON.stringify(colors), color_family: primaryFamily };
  } catch {
    return { dominant_colors: null, color_family: null };
  }
}
