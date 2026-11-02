#!/usr/bin/env node
import { calculate } from './calculator.js';

const help = `Usage: cone-flat-pattern-calc --d1 <mm> --height <mm> [options]

Compute a cone or truncated cone flat pattern (展开图).
  --d1 <mm>       Large-end mean diameter, required, > 0
  --d2 <mm>       Small-end mean diameter, default 0, >= 0 and < d1
  --height <mm>   Vertical height, required, > 0
  --decimals <d>  Decimal places, integer 0–6, default 4
  --json          Output rounded numeric results as JSON
  --help          Show this help

Lengths are mm, angles degrees, area mm². Adjust for sheet thickness
and use neutral-line dimensions. No seam allowances are included.`;

function main(args: string[]) {
  if (args.includes('--help')) { console.log(help); return; }
  const values = new Map<string, number>();
  let json = false;
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--json') { json = true; continue; }
    if (!['--d1', '--d2', '--height', '--decimals'].includes(flag)) {
      throw new Error(`Unknown argument: ${flag}`);
    }
    if (values.has(flag)) throw new Error(`Duplicate option: ${flag}`);
    const raw = args[++i];
    if (raw === undefined || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(raw) ||
        !Number.isFinite(Number(raw))) {
      throw new Error(`${flag} requires a finite numeric value.`);
    }
    values.set(flag, Number(raw));
  }
  if (!values.has('--d1') || !values.has('--height')) {
    throw new Error('--d1 and --height are required. See --help.');
  }
  const decimals = values.get('--decimals') ?? 4;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 6) {
    throw new Error('decimals must be an integer from 0 to 6.');
  }
  const result = calculate({ d1: values.get('--d1')!, d2: values.get('--d2') ?? 0,
    height: values.get('--height')! });
  if (json) {
    console.log(JSON.stringify(Object.fromEntries(Object.entries(result).map(([key, value]) =>
      [key, typeof value === 'number' ? Number(value.toFixed(decimals)) : value])), null, 2));
    return;
  }
  const f = (n: number) => n.toFixed(decimals);
  console.log(`Cone / truncated cone flat pattern (展开图)
Slant length s: ${f(result.slantLength)} mm
Outer pattern radius R: ${f(result.outerRadius)} mm
Inner pattern radius r: ${f(result.innerRadius)} mm
Sector angle theta: ${f(result.sectorAngle)}°
${result.chordType === 'gap' ? 'Gap chord' : 'Sector chord'}: ${f(result.chordLength)} mm (across ${f(result.chordAngle)}°)
Flat-pattern area: ${f(result.area)} mm²
Cone half-angle alpha: ${f(result.halfAngle)}°`);
}

try { main(process.argv.slice(2)); }
catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
