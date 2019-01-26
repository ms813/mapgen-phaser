import 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import TitleScene from './scenes/TitleScene';
import WorldMapScene from './scenes/WorldMapScene';

const config = {
    // For more settings see <https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js>
    type: Phaser.AUTO,
    pixelArt: true,
    roundPixels: true,
    parent: 'content',
    width: 800,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 100},
            debug: false
        }
    },
    // preserveDrawingBuffer: true,
    scene: [
        BootScene,
        TitleScene,
        GameScene,
        WorldMapScene
    ]
};

const Game = new Phaser.Game(config);
Game.preserveDrawingBuffer = true;
export { Game };
