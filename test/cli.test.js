import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { calculate } from '../dist/calculator.js';

const run = (...args) => spawnSync(process.execPath, ['dist/cli.js', ...args], { encoding: 'utf8' });
// Independently checked with Python math.hypot/atan2 and lateral area pi*(a+b)*s.
for (const [name, args, expected] of [
  ['full cone', ['--d1', '200', '--height', '100'], {
    slantLength: 141.4214, outerRadius: 141.4214, innerRadius: 0,
    sectorAngle: 254.5584, chordType: 'gap', chordAngle: 105.4416,
    chordLength: 225.0560, area: 44428.8294, halfAngle: 45.0000,
  }],
  ['frustum', ['--d1', '300', '--d2', '100', '--height', '200'], {
    slantLength: 223.6068, outerRadius: 335.4102, innerRadius: 111.8034,
    sectorAngle: 160.9969, chordType: 'sector', chordAngle: 160.9969,
    chordLength: 661.6175, area: 140496.2946, halfAngle: 26.5651,
  }],
]) {
  test(name + ' verified check values at four decimals', () => {
    const result = run(...args, '--json');
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
    assert.deepEqual(JSON.parse(result.stdout), expected);
  });
}

const valid = ['--d1', '100', '--height', '100'];
for (const args of [
  ['--d1', '100', '--height', '0'],
  [...valid, '--d2', '100'], [...valid, '--d2', '-1'], [...valid, '--decimals', '9'],
  ['--d1', '0', '--height', '1'], ['--d1', '-1', '--height', '1'],
  ['--d1', '100', '--height', '-1'], [...valid, '--d2', '101'],
  [...valid, '--decimals', '-1'], [...valid, '--decimals', '1.5'],
  ['--d1', 'abc', '--height', '100'], ['--d1', 'Infinity', '--height', '100'],
  ['--d1', 'NaN', '--height', '100'], ['--d1', '1e999', '--height', '1'],
  [], ['--height', '100'], ['--d1', '100'], [...valid, '--d2'],
  [...valid, '--unknown'], [...valid, '--d2', ''], [...valid, '--d1', '200'],
]) {
  test('rejects ' + JSON.stringify(args), () => {
    const result = run(...args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /^Error:/);
    assert.equal(result.stdout, '');
  });
}

test('help needs no dimensions', () => {
  const result = run('--help');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage:/);
});
test('text labels gap and sector chords and retains trailing zeros', () => {
  assert.match(run('--d1', '200', '--height', '100').stdout, /Gap chord: 225\.0560 mm/);
  assert.match(run(...valid).stdout, /Sector chord:/);
  assert.match(run('--d1', '200', '--height', '100').stdout, /alpha: 45\.0000°/);
});
test('precision endpoints and explicit full-cone diameter', () => {
  for (const decimals of [0, 6]) {
    const result = run(...valid, '--d2', '0', '--decimals', String(decimals));
    assert.equal(result.status, 0);
    assert.match(result.stdout, new RegExp(`Inner pattern radius r: ${decimals ? '0\\.000000' : '0'} mm`));
  }
});
test('geometry conserves arc lengths and area, including a wide frustum', () => {
  for (const dimensions of [{d1: 300, d2: 100, height: 200}, {d1: 200, d2: 199, height: 100}, {d1: 200, d2: 0, height: 1}]) {
    const p = calculate(dimensions);
    const near = (a, b) => assert.ok(Math.abs(a-b) <= 1e-10 * Math.max(1, Math.abs(b)));
    near(p.outerRadius * p.sectorAngle * Math.PI / 180, Math.PI * dimensions.d1);
    near(p.innerRadius * p.sectorAngle * Math.PI / 180, Math.PI * dimensions.d2);
    near(p.outerRadius - p.innerRadius, p.slantLength);
    near(Math.PI * (p.outerRadius ** 2 - p.innerRadius ** 2) * p.sectorAngle / 360, p.area);
  }
});
