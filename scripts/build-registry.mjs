import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { games as gameConfigs } from '../src/config/games.mjs';

const gamesDirectory = new URL('../games/', import.meta.url).pathname;
const outputDirectory = new URL('../dist/', import.meta.url).pathname;
const baseUrl = (process.env.APRINCAR_GAMES_BASE_URL ?? '').replace(/\/$/, '');
const configById = new Map(gameConfigs.map((game) => [game.id, game]));

fs.rmSync(outputDirectory, { recursive: true, force: true });
fs.mkdirSync(outputDirectory, { recursive: true });

const registry = [];

for (const slug of fs.readdirSync(gamesDirectory)) {
  const directory = path.join(gamesDirectory, slug);
  if (!fs.statSync(directory).isDirectory()) continue;

  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
  const html = fs.readFileSync(path.join(directory, 'game.html'), 'utf8');
  const integrity = crypto.createHash('sha256').update(html).digest('hex');
  const target = path.join(outputDirectory, 'extensions', slug);
  const gameConfig = configById.get(manifest.id);

  fs.mkdirSync(target, { recursive: true });
  fs.copyFileSync(path.join(directory, 'manifest.json'), path.join(target, 'manifest.json'));
  fs.writeFileSync(path.join(target, 'game.html'), html);
  fs.writeFileSync(
    path.join(target, 'integrity.json'),
    JSON.stringify({ algorithm: 'sha256', entry: 'game.html', sha256: integrity }, null, 2),
  );

  registry.push({
    id: manifest.id,
    version: manifest.version,
    trust: 'official',
    publisher: manifest.publisher,
    name: manifest.name,
    description: manifest.description,
    objective: gameConfig?.objective ? { 'pt-BR': gameConfig.objective } : undefined,
    skills: manifest.contributes.skills,
    secondarySkills: manifest.contributes.secondarySkills ?? [],
    ageGuidance: manifest.contributes.ageGuidance,
    manifestUrl: `${baseUrl}/extensions/${slug}/manifest.json`,
    entryUrl: `${baseUrl}/extensions/${slug}/game.html`,
    integrity,
    tags: manifest.contributes.interests ?? [],
    experience: manifest.experience,
  });
}

fs.writeFileSync(path.join(outputDirectory, 'registry.json'), JSON.stringify(registry, null, 2));
console.log(`Registry generated with ${registry.length} games`);
