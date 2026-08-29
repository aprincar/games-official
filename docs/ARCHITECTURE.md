# Official games architecture

```mermaid
flowchart LR
  Config[Game catalog] --> Generator[Challenge generators]
  Generator --> Runtime[Phaser / Three runtime]
  Runtime --> Artifact[Single-file game.html]
  Artifact --> Manifest[Manifest + integrity]
  Manifest --> Registry[Published registry]
```

Generators own answer semantics. Renderers receive a validated challenge and report interaction through the SDK bridge. Official games run without remote code or network dependencies.

