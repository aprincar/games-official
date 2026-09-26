# Auditoria pedagógica e mobile-first — jogos oficiais

Esta matriz é o contrato de produto para a publicação atual. Faixa etária é **orientativa**, não diagnóstico de desenvolvimento. A idade publicada deve permanecer coerente com a habilidade principal, a carga motora e a quantidade de leitura exigida.

| Jogo | Idade | Finalidade | Interação | Critério mobile-first |
| --- | --- | --- | --- | --- |
| Conte os Bichos | 4–7 | Contagem e numeral | tap | alvos grandes, poucas opções e progressão |
| Cesta de Frutas | 4–7 | Formar quantidades | tap/drag | tap fallback e drag touch equivalentes |
| Torre de Blocos | 4–7 | Contagem reversível | tap/drag | pilha reversível, targets atualizados |
| Mundo das Cores | 2–5 | Classificação por cor | drag | áreas grandes e sem leitura obrigatória |
| Trem dos Padrões | 4–8 | Sequências AB/ABC | tap/drag | alternativas grandes e dica após retry |
| Caça às Letras | 4–7 | Reconhecimento de letras | tap | uma letra-alvo por rodada |
| Ateliê de Letras | 4–7 | Traçado inicial | draw | área ampla e guia progressivo |
| Pintura Livre | 2–10 | Expressão visual | draw | sem resposta errada, palette touch |
| Memória dos Bichos | 3–7 | Memória visual | tap | cartas grandes e tabuleiro progressivo |
| Formas no Espaço 3D | 5–9 | Sólidos e rotação | touch/rotate | rotação por gesto e seleção grande |
| Caminhos da Escrita | 3–6 | Pré-escrita | draw | caminhos largos e ponto inicial |
| Letras de Forma | 4–7 | Letras impressas | draw | letras simples, guia e tolerância |
| Oficina de Cursiva | 6–9 | Cursiva e ligações | draw | movimento contínuo e progressão |
| Pintura por Cores | 3–5 | Cor + expressão guiada | tap | cor acompanhada de símbolo, regiões grandes |

## Regras de publicação

- Todo jogo oficial deve declarar `mobileFirst: true`, objetivo, família, faixa etária e `ageDesign`.
- Para crianças abaixo de 6 anos, a conclusão não pode depender de leitura independente.
- Touch targets devem permanecer com pelo menos 52 CSS px nos perfis móveis certificados.
- Jogos de escrita usam uma progressão: **pré-escrita → letra de forma → cursiva**.
- Pintura Livre continua aberta e observacional; Pintura por Cores é estruturada e corrigível.
- Evidência não equivale a domínio: o jogo registra desempenho da sessão, não certifica alfabetização ou desenvolvimento.
