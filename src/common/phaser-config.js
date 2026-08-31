// Standardized Phaser Game Configuration Factory for Aprincar
window.createAprincarPhaserConfig = function createAprincarPhaserConfig(sceneClass, options = {}) {
  return {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: options.backgroundColor || '#f7f6f2',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: 640
    },
    input: {
      activePointers: 3
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: true,
      powerPreference: 'high-performance'
    },
    scene: Array.isArray(sceneClass) ? sceneClass : [sceneClass],
    ...options
  };
};
