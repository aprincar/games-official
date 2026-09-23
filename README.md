# Aprincar Official Games

Jogos oficiais que acompanham o Aprincar V1.

## Arquitetura

Os diretórios `games/*` são **artefatos gerados**. O código-fonte fica em:

- `src/challenges/` — geração procedural e regras pedagógicas puras;
- `src/runtime/phaser-runtime.js` — apresentação/interação 2D;
- `src/runtime/three-runtime.js` — experiência 3D de referência;
- `src/runtime/sdk-bridge.js` — comunicação com o GameHost;
- `src/config/games.mjs` — catálogo declarativo;
- `vendor/` — runtimes open source incorporados ao `single-html`, com suas licenças.

A regra central é: **o renderer nunca decide qual é a resposta correta**. O `Challenge Generator` cria um `ChallengeSpec` válido e testável; Phaser/Three.js apenas apresentam a experiência.

## Jogos V1

- Conte os Bichos — Phaser
- Cesta de Frutas — Phaser
- Torre de Blocos — Phaser
- Mundo das Cores — Phaser
- Trem dos Padrões — Phaser
- Caça às Letras — Phaser
- Ateliê de Letras — Phaser + Handwriting capability
- Pintura Livre — Phaser
- Memória dos Bichos — Phaser
- Formas no Espaço 3D — Three.js

## Validação

```bash
npm run check
```

O gate executa fuzz dos geradores, gera todos os `game.html`, valida manifests/skills/permissões e produz o registry com hashes SHA-256.

Leia também `docs/README.md` e `docs/ARCHITECTURE.md` antes de alterar geradores ou runtimes.


## Contrato de permissões

`camera`, `microphone`, `network` e `geolocation` são permissões sensíveis. Elas só podem aparecer em `optionalPermissions`: declarar a capability não a concede. O GameHost mantém essas capabilities bloqueadas até um grant explícito. Jogos não-offline devem declarar `network` como opcional.

## Fonte canônica de distribuição

Este repositório é a fonte de verdade dos jogos oficiais. `npm run check` gera `dist/registry.json` e `dist/extensions/*` com integridade SHA-256. Consumidores como `aprincar/platform` devem pin-ar um commit imutável deste repositório e gerar seus snapshots a partir desse commit; não devem tratar cópias locais como uma segunda fonte de verdade.
