# Cone flat-pattern calculator (圆锥/圆台展开)

A TypeScript CLI for marking out a sheet-metal cone, hopper, or funnel. Requires
Node.js 18+ and npm. No runtime dependencies.

```sh
npm install
npm test
node dist/cli.js --d1 200 --height 100
node dist/cli.js --d1 300 --d2 100 --height 200 --json
node dist/cli.js --help
```

`npm test` builds the CLI and runs the `node:test` suite. `npm run build` builds
without testing. After building, `npm link` makes `cone-flat-pattern-calc`
available as a command.

Options:

| Option | Meaning |
| --- | --- |
| `--d1 <mm>` | Required large-end diameter, greater than zero |
| `--d2 <mm>` | Small-end diameter, default zero; must be ≥ 0 and < d1 |
| `--height <mm>` | Required vertical height, greater than zero |
| `--decimals <d>` | Integer 0–6, default 4 |
| `--json` | Rounded numeric JSON output |
| `--help` | Usage information |

Invalid inputs write an error to stderr and exit with status 1. Numeric values
must be finite decimal numbers (scientific notation is accepted). Results outside
the supported floating-point range are rejected. Duplicate numeric options and
unknown options are errors. Help takes precedence over other arguments.

For the 200 mm full cone with a 100 mm height, the slant and outer radius are
141.4214 mm, the sector angle is 254.5584°, and the half-angle is 45.0000°.
The gap spans 105.4416° with a 225.0560 mm chord.

For a 300/100 mm hopper with a 200 mm height, the slant length is 223.6068 mm,
the outer radius is 335.4102 mm, the inner radius is 111.8034 mm, the sector
angle is 160.9969°, and the half-angle is 26.5651°.

To mark out the hopper, choose an apex on the sheet, draw concentric arcs at
335.4102 and 111.8034 mm, and draw two radial lines separated by 160.9969°.
Cut the annular sector, then roll it until the radial edges meet. For a full cone,
the inner radius is zero. When the sector exceeds 180°, retain the larger sector;
the reported **gap chord** crosses the missing wedge. Otherwise the reported
**sector chord** joins the outer endpoints across the retained sector. Chords
alone do not distinguish a major sector from its complementary gap.

Dimensions are **mean-diameter / neutral-line values**. Adjust the input dimensions
for sheet thickness and the fabrication process. Add any seam, overlap, trimming,
or joining allowances separately; the calculator provides ideal geometry only.

## Geometry and JSON fields

Let Δ = (d1 − d2)/2 and h = height:

- `slantLength`: s = √(Δ² + h²), mm
- `outerRadius`: R = s·d1/(d1−d2), mm
- `innerRadius`: r = R·d2/d1, mm
- `sectorAngle`: θ = 180·d1/R, degrees
- `chordType`: `sector` for θ ≤ 180°, otherwise `gap`
- `chordAngle`: θ for a sector chord, otherwise 360−θ, degrees
- `chordLength`: 2R·sin(chordAngle/2), mm (convert angle to radians)
- `area`: π(R²−r²)θ/360 = π(d1+d2)s/2, mm²
- `halfAngle`: α = atan(Δ/h), degrees, measured from the cone axis

Calculations use full precision before rounding output. JSON numbers omit trailing
zeros; text preserves the requested decimal places. Tests include independently
verified Python check values and arc-length and area identities.

MIT licensed; see LICENSE.
