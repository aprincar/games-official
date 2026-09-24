// Standardized Phaser Game Configuration Factory for Aprincar
window.createAprincarPhaserConfig = function createAprincarPhaserConfig(sceneClass, options = {}) {
  const mobileFirst = window.APRINCAR_GAME_CONFIG?.mobileFirst === true;
  const scale = mobileFirst
    ? {
        mode: Phaser.Scale.RESIZE,
        width: Math.max(320, window.innerWidth || 390),
        height: Math.max(480, window.innerHeight || 844),
      }
    : {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 640
      };

  return {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: options.backgroundColor || '#f7f6f2',
    scale,
    input: {
      activePointers: 3,
      touch: true
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
