import Biome from './Biome';
import WaterType from './WaterType';

export default class WorldMapTile {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.elevation = 0;
        this.biome = Biome.OCEAN;
        this.elevationPerlin = 1;
        this.elevationVoronoi = 1;
        this.cliffElevation = 1;
        this.neighbours = {
            orthogonal: [],
            diagonal: []
        };
        this.water = WaterType.UNASSIGNED;
    }
}
