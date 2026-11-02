export interface Dimensions {
  d1: number;
  d2: number;
  height: number;
}

export function calculate({ d1, d2, height }: Dimensions) {
  if (![d1, d2, height].every(Number.isFinite)) {
    throw new Error('Dimensions must be finite numbers.');
  }
  if (d1 <= 0) throw new Error('d1 must be greater than 0.');
  if (d2 < 0 || d2 >= d1) throw new Error('d2 must be >= 0 and less than d1.');
  if (height <= 0) throw new Error('height must be greater than 0.');

  const difference = d1 - d2;
  const slantLength = Math.hypot(difference / 2, height);
  const outerRadius = slantLength * (d1 / difference);
  const innerRadius = slantLength * (d2 / difference);
  const sectorAngle = 180 * (difference / slantLength);
  const chordType = sectorAngle > 180 ? 'gap' : 'sector';
  const chordAngle = chordType === 'gap' ? 360 - sectorAngle : sectorAngle;
  const chordLength = 2 * (outerRadius * Math.sin(chordAngle * Math.PI / 360));
  // Equivalent to pi*(R²-r²)*theta/360, without subtracting large squares.
  const area = Math.PI * (d1 / 2 + d2 / 2) * slantLength;
  const halfAngle = Math.atan2(difference / 2, height) * 180 / Math.PI;
  const result = { slantLength, outerRadius, innerRadius, sectorAngle,
    chordType, chordAngle, chordLength, area, halfAngle };
  if (Object.values(result).some(value => typeof value === 'number' && !Number.isFinite(value)) ||
      sectorAngle <= 0 || outerRadius <= 0 || area <= 0) {
    throw new Error('Dimensions exceed the supported numeric range.');
  }
  return result;
}
