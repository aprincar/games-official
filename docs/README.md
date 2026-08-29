# Official games documentation

This repository is the source of the official Aprincar extension catalog.

## Source and generated files

- `src/config/games.mjs`: declarative game catalog.
- `src/challenges/index.mjs`: deterministic procedural generators.
- `src/runtime/`: Phaser, Three.js and SDK bridge runtimes.
- `games/*/`: generated, reviewable single-file artifacts.
- `vendor/`: locally bundled runtimes and license notices.
- `dist/`: generated registry publication output.

The generated artifacts are consumed by the platform registry. They are not imported as source by the App.

## Validation

`npm run check` runs the generator tests, creates all games, checks JavaScript syntax, validates manifests and produces the registry with SHA-256 integrity metadata.

## Adding a game

Add its catalog entry and generator/runtime integration, add or update deterministic tests, run `npm run check`, inspect the generated artifact, then submit the focused change for technical and pedagogical review.

