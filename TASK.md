# cone-flat-pattern-calc

Build a small TypeScript Node CLI (Node 18+, no runtime deps; devDeps typescript + @types/node only; tests with node:test) that computes the flat pattern (展开图) of a sheet-metal cone or truncated cone (圆锥/圆台展开).

Inputs: --d1 <mm> (large-end diameter, required, > 0), --d2 <mm> (small-end diameter, default 0 = full cone, must be >= 0 and < d1), --height <mm> (vertical height, required, > 0), --decimals <d> (0-6, default 4), --json, --help.
- Slant length s = sqrt(((d1-d2)/2)^2 + h^2).
- Outer pattern radius R = s * (d1/2) / ((d1-d2)/2) = s*d1/(d1-d2). Inner radius r = R*d2/d1 (0 for full cone).
- Sector angle theta (deg) = 360 * (d1/2) / R = 180*d1/R.
- Chord across the sector opening at outer radius: if theta <= 180, chord = 2*R*sin(theta/2); also report when theta > 180 (chord across the gap = 2*R*sin((360-theta)/2), label it as gap chord).
- Flat-pattern area = pi*(R^2 - r^2)*theta/360.
- Half-angle of cone alpha = atan(((d1-d2)/2)/h) in degrees.
- Validate: d1 <= 0, d2 < 0, d2 >= d1, h <= 0, non-numeric, decimals out of 0-6 → error to stderr, exit 1.
- Readable text output by default, README with examples (explain marking out a hopper/funnel from sheet; note: dimensions are mean-diameter / neutral-line values, user must adjust for thickness), MIT LICENSE (author shanguoao2026-web), .gitignore with node_modules/ dist/ *.log .npm-cache/.
- package.json "bin" must point to the built CLI. npm test must build and pass. No secrets, no personal info.

Check values (must be in tests, 4 decimals):
- d1 200, d2 0, h 100 → s 141.4214, R 141.4214, theta 254.5584 (gap chord uses 105.4416°), alpha 45.0000
- d1 300, d2 100, h 200 → s 223.6068, R 335.4102, r 111.8034, theta 160.9969, alpha 26.5651
- d1 100, d2 0, h 0 → exit 1; d2 100 d1 100 → exit 1; d2 -1 → exit 1; decimals 9 → exit 1
