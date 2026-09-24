# Sprint — Game Quality Hardening

## Objetivo

Transformar o catálogo oficial de “artefatos que passam no gate técnico” em jogos que também passam por um contrato observável de **funcionamento, clareza e precisão**.

A sprint é deliberadamente curta. Não adiciona jogos novos e não amplia o runtime da plataforma.

## Diagnóstico inicial

O repositório possui bons invariantes de geração, manifests e distribuição, mas a cobertura atual não demonstra o comportamento real dos jogos.

Hoje:

- os geradores procedurais de counting, color, pattern, letter e memory têm fuzz tests;
- o gate gera e valida os dez artefatos;
- parte dos testes de runtime verifica padrões no código-fonte;
- não existe um gate browser-level que execute cada jogo e prove seus fluxos principais;
- regras de desafio, configuração e apresentação estão espalhadas entre `src/config`, `src/challenges`, `src/games`, `src/common` e `src/runtime`.

Problemas concretos já identificados na leitura da V1:

1. **Torre de Blocos:** o fallback por toque marca um bloco como escolhido sem posicioná-lo visualmente na torre.
2. **Cesta de Frutas:** o fallback por toque incrementa a cesta sem mover visualmente a fruta para ela.
3. **Evidence/attempts:** `AprincarBaseScene` acumula `attempts` pela sessão, enquanto o jogo 3D registra toda tentativa como `attempts: 1`. A semântica não é consistente entre jogos.
4. **Cobertura:** `runtime-quality.test.mjs` verifica presença de padrões de implementação, mas não prova que a interação funciona no navegador.
5. **Ownership:** para entender um único jogo é necessário navegar por múltiplas áreas centrais do repositório, o que aumenta custo de correção e risco de regressão transversal.

## Escopo

### 1. Contrato executável de jogo

Cada jogo deve ter um cenário browser-level mínimo que prove:

- inicia sessão;
- renderiza instrução compreensível;
- expõe alvos interativos;
- aceita a interação prevista;
- diferencia sucesso e falha;
- não entra em estado sem saída;
- avança ou permite nova tentativa corretamente;
- publica estado de teste coerente;
- registra evidence com semântica consistente.

### 2. Organização por vertical slice

Migrar o código-fonte para uma organização em que cada jogo concentre sua definição, regra e cena, mantendo compartilhado somente o que for realmente transversal.

Direção desejada:

```text
src/
  games/
    block-tower/
      definition.mjs
      challenge.mjs
      scene.js
      game.test.mjs
    fruit-basket/
      ...
  shared/
    input/
    feedback/
    audio/
    brand/
  runtime/
    phaser/
    three/
    sdk/
```

Os artefatos gerados continuam separados do código-fonte.

### 3. Semântica única de interação e evidence

Padronizar:

- tentativa por desafio/rodada;
- sucesso, falha e observação;
- assistência;
- bloqueio/desbloqueio de input;
- tap como alternativa equivalente ao drag quando existir;
- estado visual sempre coerente com estado lógico;
- reset de rodada sem listeners ou estado residual.

### 4. Certificação dos dez jogos

Nenhum jogo é considerado “hardening concluído” apenas porque gera HTML.

Cada jogo deve ter uma ficha curta com:

- objetivo da brincadeira;
- habilidade observada;
- instrução apresentada;
- ação esperada;
- definição de sucesso/falha;
- casos limítrofes;
- comportamento em touch e pointer;
- viewport celular/tablet/desktop;
- teste automatizado;
- playtest manual registrado.

## Ordem da sprint

### Gate A — Harness

Adicionar testes browser-level determinísticos e helpers compartilhados. Sem esse gate, não iniciar refatoração ampla.

### Gate B — Núcleo compartilhado

Corrigir semântica de attempts/evidence e criar uma primitiva única de seleção/drag/tap com estado visual e lógico sincronizados.

### Gate C — Jogos por famílias

1. **Contagem e classificação:** Conte os Bichos, Cesta de Frutas, Torre de Blocos, Mundo das Cores.
2. **Padrões e reconhecimento:** Trem dos Padrões, Caça às Letras, Memória dos Bichos.
3. **Criação e interação especializada:** Ateliê de Letras, Pintura Livre, Formas no Espaço 3D.

### Gate D — Certificação

Executar a matriz completa dos dez jogos, corrigir regressões e publicar um relatório curto de qualidade.

## Definition of Done

A sprint termina quando:

- 10/10 jogos possuem cenário browser-level de caminho feliz;
- jogos com resposta errada possuem cenário de retry;
- interações tap/drag equivalentes não divergem visualmente do estado lógico;
- attempts/evidence seguem uma semântica única;
- não existem listeners residuais entre rodadas;
- regras pedagógicas ficam testáveis sem renderer;
- cada jogo possui ownership local claro no código-fonte;
- `npm run check` inclui o novo gate comportamental;
- a matriz manual registra o resultado dos dez jogos em pelo menos touch e pointer;
- nenhum P0/P1 conhecido de funcionamento permanece aberto.

## Fora de escopo

- novos jogos;
- gamificação adicional;
- novos protocolos;
- mudança do Manifest Schema;
- mudança do SDK Protocol;
- redesign amplo da plataforma;
- expansão curricular.
