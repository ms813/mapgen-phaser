import { scale } from '../util/utils';
import WaterType from './WaterType';

const a = 255;
const getElevationColor = function (tile, seaLevel) {
    let r = 0, g = 0, b = 0;
    if (tile.water === WaterType.LAND) {
        const i = scale(seaLevel, 1, 0, 255, tile.elevation);
        r = i;
        g = 255 - i;
    } else if (tile.water === WaterType.OCEAN) {
        const i = scale(0, seaLevel, 0, 255, tile.elevation);
        b = i;
        if (i < 0 || i > 255) {
            console.log('b err');
        }
    } else if (tile.water === WaterType.LAKE) {
        r = 0;
        g = 255;
        b = 255;
    }

    return new Phaser.Display.Color(r, g, b, a);
};

export { getElevationColor };
