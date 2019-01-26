import WorldMap from '../map/WorldMap';
import { getElevationColor } from '../map/TileColourHelper';
import rng from 'random-seed';

const seaLevel = 0.15;

class WorldMapScene extends Phaser.Scene {

    constructor(test) {
        super({
            key: 'WorldMapScene'
        });
        this.rng = rng();
        this.tileWidth = 2;
    }

    create() {

        let emitter = new Phaser.Events.EventEmitter();
        emitter.on('map_creation_status_update', this.eventHandler, this);
        this.worldMap = this.createWorldMap(emitter);

        let elevationGroup = this.add.group();

        let graphics = this.add.graphics(0, 0);
        this.worldMap.tiles.list.forEach(tile => {
            const color = getElevationColor(tile, seaLevel).color32;
            graphics.fillStyle(color);


            const cx = tile.x * this.tileWidth;
            const cy = tile.y * this.tileWidth;
            const ix = cx - cy;
            const iy = (cx + cy) / 2 + (-tile.elevation * 50);

            const rect = new Phaser.Geom.Rectangle(
                ix, iy,
                this.tileWidth, tile.elevation * 50
            );
            // const rect = new Phaser.Geom.Rectangle(
            //     cx, cy,
            //     this.tileWidth, this.tileWidth
            // );
            graphics.fillRectShape(rect);
        });

        elevationGroup.add(graphics);

        // this.input.on('pointerdown', function (pointer) {
        //     const x = Math.floor(pointer.x / this.tileWidth);
        //     const y = Math.floor(pointer.y / this.tileWidth);
        //
        //     const tile = this.worldMap.getTile(x, y);
        //     console.log(tile);
        // }, this);

        this.createCamera();
    }

    createCamera() {
        var cursors = this.input.keyboard.createCursorKeys();
        console.log(cursors);

        var controlConfig = {
            camera: this.cameras.main,
            left: cursors.left,
            right: cursors.right,
            up: cursors.up,
            down: cursors.down,
            acceleration: 10,
            drag: 10,
            maxSpeed: 10
        };

        controls = new Phaser.Cameras.Controls.SmoothedKeyControl(controlConfig);

        var cam = this.cameras.main;

        cam.setBounds(-1300, -500, 2000, 1500).setZoom(0.60);

        // var gui = new dat.GUI();
        //
        // gui.addFolder('Camera');
        // gui.add(cam.midPoint, 'x').listen();
        // gui.add(cam.midPoint, 'y').listen();
        // gui.add(cam, 'scrollX').listen();
        // gui.add(cam, 'scrollY').listen();
        // gui.add(cam, 'width').listen();
        // gui.add(cam, 'height').listen();
        // gui.add(cam, 'displayWidth').listen();
        // gui.add(cam, 'displayHeight').listen();
        // gui.add(cam, 'zoom', 0.1, 4).step(0.1);
        // gui.add(cam.worldView, 'left').listen();
        // gui.add(cam.worldView, 'top').listen();
        // gui.add(cam.worldView, 'right').listen();
        // gui.add(cam.worldView, 'bottom').listen();
    }

    createWorldMap(emitter) {
        // const seed = this.rng.string(64);
        const seed = 'flaptopia';
        console.log('Seed:', seed);
        const width = 400;
        const height = 400;

        return new WorldMap(seed, width, height, seaLevel, emitter);
    }

    eventHandler(msg) {
        console.log(msg);
        // const t = this.add.text(100, 100, msg);
    }

    update(time, delta) {
        // console.log('update', time, delta);
        controls.update(delta);
    }
}

let controls;

export default WorldMapScene;
