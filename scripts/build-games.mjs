import fs from 'node:fs';
import path from 'node:path';
import { games } from '../src/config/games.mjs';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const gamesDir = path.join(root, 'games');
const challengeSource = fs.readFileSync(path.join(root, 'src/challenges/index.mjs'), 'utf8').replace(/\bexport\s+/g, '');
const sdk = fs.readFileSync(path.join(root, 'src/runtime/sdk-bridge.js'), 'utf8');
const phaserRuntime = fs.readFileSync(path.join(root, 'src/runtime/phaser-runtime.js'), 'utf8');
const threeRuntime = fs.readFileSync(path.join(root, 'src/runtime/three-runtime.js'), 'utf8');
const phaser = fs.readFileSync(path.join(root, 'vendor/phaser.min.js'), 'utf8');
const three = fs.readFileSync(path.join(root, 'vendor/three.bundle.min.js'), 'utf8');

const css = `
*{box-sizing:border-box}html,body,#game{width:100%;height:100%;margin:0;overflow:hidden}body{font-family:Inter,ui-rounded,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f7f6f2;color:#242523}canvas{display:block;touch-action:none}.three-ui{position:absolute;z-index:3;left:0;right:0;top:0;padding:20px 28px;pointer-events:none;text-align:center}.three-brand{position:absolute;left:26px;top:23px;color:#6f5bd7;font-weight:900;letter-spacing:.04em}.three-ui #three-level{position:absolute;right:26px;top:23px;color:#6f5bd7;font-weight:800}.three-ui h1{margin:28px auto 4px;font-size:clamp(24px,4vw,36px)}.three-ui p{margin:0;color:#6f716d;font-weight:700}#three-canvas{width:100%;height:100%}`;

for (const game of games) {
  const dir = path.join(gamesDir, game.slug);
  fs.mkdirSync(dir, { recursive: true });
  const config = JSON.stringify({ name: game.name, mode: game.mode, variant: game.variant, answer: game.answer, skillId: game.skillId });
  const engine = game.mode === 'three' ? `${three}\n${threeRuntime}` : `${phaser}\n${phaserRuntime}`;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${game.name} — Aprincar</title><style>${css}</style></head><body><div id="game"></div><script>window.APRINCAR_GAME_CONFIG=${config};</script><script>${sdk}</script><script>${challengeSource}</script><script>${engine}</script></body></html>`;
  const manifest = {
    manifestVersion: 1,
    id: game.id,
    kind: 'game',
    version: '1.1.0',
    publisher: 'aprincar',
    name: { 'pt-BR': game.name },
    description: { 'pt-BR': game.description },
    engines: { aprincar: '^1.0.0', sdkProtocol: 1 },
    entrypoints: { game: 'game.html' },
    permissions: game.permissions ?? [],
    optionalPermissions: [],
    contributes: {
      skills: [game.skillId],
      secondarySkills: game.secondarySkills ?? [],
      ageGuidance: { min: game.ages[0], max: game.ages[1] },
      interests: game.interests,
      playType: game.playType,
    },
    offline: true,
    bundleMode: 'single-html',
  };
  fs.writeFileSync(path.join(dir, 'game.html'), html);
  fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(dir, 'README.md'), `# ${game.name}\n\nJogo oficial Aprincar. Fonte compartilhada em \`src/\`; este diretório contém o artefato gerado.\n`);
}
console.log(`Built ${games.length} official games`);
