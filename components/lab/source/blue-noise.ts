const sigma = 1.5;
const initialFill = 0.1;

const modulus = 2_147_483_647;

const seededRandom = (seed: number) => {
  let state = seed % modulus || 1;
  return () => {
    state = (state * 48_271) % modulus;
    return (state - 1) / (modulus - 1);
  };
};

const wrappedKernel = (side: number) => {
  const kernel = new Float32Array(side * side);
  for (let y = 0; y < side; y += 1) {
    for (let x = 0; x < side; x += 1) {
      const dx = Math.min(x, side - x);
      const dy = Math.min(y, side - y);
      kernel[y * side + x] = Math.exp(
        -(dx * dx + dy * dy) / (2 * sigma * sigma)
      );
    }
  }
  return kernel;
};

interface EnergyField {
  side: number;
  kernel: Float32Array;
  energy: Float32Array;
  points: Uint8Array;
}

const toggle = (field: EnergyField, index: number, sign: 1 | -1) => {
  const { side, kernel, energy, points } = field;
  points[index] = sign > 0 ? 1 : 0;
  const pointX = index % side;
  const pointY = Math.floor(index / side);
  for (let y = 0; y < side; y += 1) {
    const kernelRow = ((y - pointY + side) % side) * side;
    for (let x = 0; x < side; x += 1) {
      const target = y * side + x;
      energy[target] =
        (energy[target] ?? 0) +
        sign * (kernel[kernelRow + ((x - pointX + side) % side)] ?? 0);
    }
  }
};

const extreme = (field: EnergyField, wantPoint: 0 | 1) => {
  let best = -1;
  let bestEnergy = wantPoint ? -Infinity : Infinity;
  for (let index = 0; index < field.energy.length; index += 1) {
    if (field.points[index] !== wantPoint) {
      continue;
    }
    const value = field.energy[index] ?? 0;
    if (wantPoint ? value > bestEnergy : value < bestEnergy) {
      best = index;
      bestEnergy = value;
    }
  }
  return best;
};

const tightestCluster = (field: EnergyField) => extreme(field, 1);
const largestVoid = (field: EnergyField) => extreme(field, 0);

const cloneField = (field: EnergyField): EnergyField => ({
  energy: Float32Array.from(field.energy),
  kernel: field.kernel,
  points: Uint8Array.from(field.points),
  side: field.side,
});

export const blueNoiseRanks = (side: number, seed = 17) => {
  const total = side * side;
  const random = seededRandom(seed);
  const field: EnergyField = {
    energy: new Float32Array(total),
    kernel: wrappedKernel(side),
    points: new Uint8Array(total),
    side,
  };
  const seedCount = Math.round(total * initialFill);
  let placed = 0;
  while (placed < seedCount) {
    const index = Math.floor(random() * total);
    if (!field.points[index]) {
      toggle(field, index, 1);
      placed += 1;
    }
  }
  for (let pass = 0; pass < total; pass += 1) {
    const cluster = tightestCluster(field);
    toggle(field, cluster, -1);
    const gap = largestVoid(field);
    toggle(field, gap, 1);
    if (gap === cluster) {
      break;
    }
  }
  const ranks = new Uint16Array(total);
  const shrinking = cloneField(field);
  for (let rank = seedCount - 1; rank >= 0; rank -= 1) {
    const cluster = tightestCluster(shrinking);
    toggle(shrinking, cluster, -1);
    ranks[cluster] = rank;
  }
  for (let rank = seedCount; rank < total; rank += 1) {
    const gap = largestVoid(field);
    toggle(field, gap, 1);
    ranks[gap] = rank;
  }
  return ranks;
};

export const blueNoiseBytes = (side: number) => {
  const ranks = blueNoiseRanks(side);
  const total = ranks.length;
  return Uint8Array.from(ranks, (rank) =>
    Math.floor(((rank + 0.5) / total) * 256)
  );
};
