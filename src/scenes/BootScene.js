class BootScene extends Phaser.Scene {
    constructor(test) {
        super({
            key: 'BootScene'
        });
    }

    preload() {
        console.log('preload boot');
        console.log('boot load complete');
        this.scene.start('WorldMapScene');
    }
}

export default BootScene;
