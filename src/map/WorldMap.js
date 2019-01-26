import WorldMapTile from './WorldMapTile';
import Perlin from '../util/Perlin';
import { max, min, normalise, scale, CARDINAL_DIRECTIONS, ORDINAL_DIRECTIONS } from '../util/utils';
import RandomWalker from './RandomWalker';
import rng from 'random-seed';
import WaterType from './WaterType';

const Vector = Phaser.Math.Vector2;

export default class WorldMap {

    constructor(seed, width, height, seaLevel, eventEmitter) {

        this.eventEmitter = eventEmitter;
        this.eventEmitter.emit('map_creation_status_update', 'Initialising world map creation');

        this.rng = rng(seed);
        this.seed = seed;
        this.width = width;
        this.height = height;
        this.seaLevel = seaLevel;

        this.tiles = this.createTiles(width, height);
        this.assignTileNeighbours(this.tiles);
        this.addCliffs();
        this.setPerlinCoefficients(this.tiles.list, seed);

        this.randomWalks = this.generateRandomWalks(seed);
        this.setVoronoiCoefficients(this.tiles.list, this.randomWalks);
        this.setTileElevations(this.tiles.list);

        this.assignOcean(this.tiles.list);
        this.landmasses = this.assignLandmasses(this.tiles.list);

        this.eventEmitter.emit('map_creation_status_update', 'World map generation complete');
        this.eventEmitter.shutdown();
    }

    createTiles(width, height) {
        const tiles = {
            list: [],
            array: []
        };

        for (let x = 0; x < width; x++) {
            const row = [];
            for (let y = 0; y < width; y++) {
                const tile = new WorldMapTile(x, y);
                tiles.list.push(tile);
                row.push(tile);
            }
            tiles.array.push(row);
        }
        console.log('World Map Tiles:', tiles);
        return tiles;
    }

    assignTileNeighbours(tiles) {
        this.eventEmitter.emit('map_creation_status_update', 'Assigning tile neighbours');
        tiles.list.forEach(tile => {
            CARDINAL_DIRECTIONS.forEach(dir => {
                const dx = tile.x + dir.x;
                const dy = tile.y + dir.y;

                if (this.isInBounds(dx, dy)) {
                    tile.neighbours.orthogonal.push(tiles.array[dx][dy]);
                }
            });

            ORDINAL_DIRECTIONS.forEach(dir => {
                const dx = tile.x + dir.x;
                const dy = tile.y + dir.y;

                if (this.isInBounds(dx, dy)) {
                    tile.neighbours.diagonal.push(tiles.array[dx][dy]);
                }
            });
        });
    }

    setPerlinCoefficients(tiles, seed) {
        this.eventEmitter.emit('map_creation_status_update', 'Setting perlin coefficients');
        const perlin = new Perlin(seed);
        const perlin2 = new Perlin(seed + seed);
        const featureScale = 32;
        const octaves = 4;
        const persistence = 0.5;
        tiles.forEach(tile => {
            const noise1 = perlin.generate(tile.x, tile.y, featureScale, octaves, persistence);
            const noise2 = perlin2.generate(tile.x, tile.y, featureScale, octaves, persistence);
            const angle = Math.atan2(noise1, noise2);
            const d2 = noise1 * noise1 + noise2 * noise2;
            tile.elevationPerlin = (angle + Math.PI) * d2 / 4 / Math.PI;
        });

        //normalise
        const minimum = min(tiles, 'elevationPerlin').elevationPerlin;
        const maximum = max(tiles, 'elevationPerlin').elevationPerlin;
        tiles.forEach(tile => tile.elevationPerlin = scale(minimum, maximum, 0, 1, tile.elevationPerlin));
        //
        // let a = 0;
        // let b = 0;
        // tiles.forEach(tile => {
        //     if (tile.elevationPerlin3 > 0.5) {
        //         a++;
        //     } else {
        //         b++;
        //         tile.elevationPerlin = tile.elevationPerlin2;
        //     }
        // });
    }

    setTileElevations(tiles) {
        this.eventEmitter.emit('map_creation_status_update', 'Calculating tile elevations');
        tiles.forEach(tile => tile.elevation = tile.elevationPerlin * tile.elevationVoronoi * tile.cliffElevation);

        //normalise
        const minimum = min(tiles, 'elevation').elevation;
        const maximum = max(tiles, 'elevation').elevation;
        tiles.forEach(tile => tile.elevation = scale(minimum, maximum, 0, 1, tile.elevation));
    }

    generateRandomWalks(seed) {
        this.eventEmitter.emit('map_creation_status_update', 'Generating random walks');
        const randomWalker = new RandomWalker(seed);
        const walks = [];
        const bounds = new Phaser.Geom.Rectangle(0, 0, this.height, this.width);
        const steps = 30;
        const maxStepSize = (this.height + this.width) / steps;
        const edgeWalkCount = 8;
        const middleWalkCount = 3;

        //add walks to the sides
        const left = [];
        const right = [];
        const top = [];
        const bottom = [];

        //go up in step size of 5% of the map edge
        //this gets the same effect but makes it much much faster!
        for (let i = 0; i < this.height; i += this.height / 20) {
            left.push(new Vector(0, i));
            right.push(new Vector(this.width, i));
        }

        for (let i = 0; i < this.width; i += this.width / 20) {
            top.push(new Vector(i, 0));
            bottom.push(new Vector(i, this.height));
        }

        walks.push(left);
        walks.push(right);
        walks.push(top);
        walks.push(bottom);

        //corner walks
        walks.push(randomWalker.createRandomWalk(new Vector(0, 0), bounds, steps, maxStepSize));
        walks.push(randomWalker.createRandomWalk(new Vector(0, this.height), bounds, steps, maxStepSize));
        walks.push(randomWalker.createRandomWalk(new Vector(this.width, 0), bounds, steps, maxStepSize));
        walks.push(randomWalker.createRandomWalk(new Vector(this.width, this.height), bounds, steps, maxStepSize));

        //midpoints to avoid long islands with straight coasts running down the edges
        walks.push(randomWalker.createRandomWalk(new Vector(0, 0), bounds, steps, maxStepSize));
        walks.push(randomWalker.createRandomWalk(new Vector(0, this.height / 2), bounds, steps, maxStepSize));
        walks.push(randomWalker.createRandomWalk(new Vector(this.width / 2, 0), bounds, steps, maxStepSize));
        walks.push(randomWalker.createRandomWalk(new Vector(this.width / 2, this.height / 2), bounds, steps, maxStepSize));

        //edge walks
        for (let i = 0; i < edgeWalkCount; i++) {
            const rnd = this.rng.range(CARDINAL_DIRECTIONS.length);
            let x, y;
            if (rnd === 0) {
                x = this.rng.random() * this.width;
                y = 0;
            } else if (rnd === 1) {
                x = this.rng.random() * this.width;
                y = this.height;
            } else if (rnd === 2) {
                x = 0;
                y = this.rng.random() * this.height;
            } else {
                x = this.width;
                y = this.rng.random() * this.height;
            }

            walks.push(randomWalker.createRandomWalk(new Vector(x, y), bounds, steps, maxStepSize));
        }

        //middle walks, in middle part of the map
        const edge = 0.2;
        for (let i = 0; i < middleWalkCount; i++) {
            const x = this.rng.floatBetween(edge, 1 - edge) * this.width;
            const y = this.rng.floatBetween(edge, 1 - edge) * this.height;
            walks.push(randomWalker.createRandomWalk(new Vector(x, y), bounds, steps, maxStepSize));
        }

        console.log('Random walks:', walks);
        return walks;
    }

    setVoronoiCoefficients(tiles, randomWalks) {
        this.eventEmitter.emit('map_creation_status_update', 'Calculating Voronoi Coefficients');

        tiles.forEach(tile => {
            let min = Infinity;
            randomWalks.forEach(walk => {
                walk.forEach(vertex => {
                    const sqDist = Math.pow(tile.x - vertex.x, 2) + Math.pow(tile.y - vertex.y, 2);
                    if (sqDist < min) {
                        min = sqDist;
                    }
                });
            });
            // tile.elevationVoronoi = min * this.rng.floatBetween(0.8, 1.2);
            tile.elevationVoronoi = min;
        });

        // rescale
        const minimum = min(tiles, 'elevationVoronoi').elevationVoronoi;
        const maximum = max(tiles, 'elevationVoronoi').elevationVoronoi;

        let minScale = 0.1;
        let maxScale = 1.5;

        tiles.forEach(tile => tile.elevationVoronoi = scale(minimum, maximum, minScale, maxScale, tile.elevationVoronoi));
    }

    assignOcean(tiles) {
        this.eventEmitter.emit('map_creation_status_update', 'Filling oceans');
        this.floodFill(tiles[0], WaterType.UNASSIGNED, WaterType.OCEAN, (tile) => tile.elevation < this.seaLevel);
    }


    floodFill(tile, target, replacement, predicate) {
        if (target === replacement) return;

        if (tile.water !== target) return;

        if (predicate && predicate(tile)) {
            tile.water = replacement;
        }

        const q = [];
        q.push(tile);

        while (q.length > 0) {
            const n = q.shift();
            n.neighbours.orthogonal.forEach(neighbour => {
                if (neighbour.water === target) {
                    if (!predicate || predicate(neighbour)) {
                        q.push(neighbour);
                        neighbour.water = replacement;
                    }
                }
            });
        }
    }

    assignLandmasses(tiles) {
        this.eventEmitter.emit('map_creation_status_update', 'Creating landmasses');
        const landmasses = [];
        tiles.forEach(tile => {
            //was not assigned in the ocean fill
            if (tile.water === WaterType.UNASSIGNED) {
                const landmass = {tiles: [], id: landmasses.length};
                this.floodFill(tile, WaterType.UNASSIGNED, WaterType.LAND, (tile) => landmass.tiles.push(tile));
                landmasses.push(landmass);
            }

            //create lakes
            if (tile.elevation < this.seaLevel && tile.water === WaterType.LAND) {
                tile.water = WaterType.LAKE;
            }
        });
        console.log('Land masses:', landmasses);
        return landmasses;
    }

    isInBounds(x, y) {
        return x >= 0 && y >= 0 && x < this.width && y < this.height;
    };

    isMapBorder(tile) {
        return tile.x <= 0 || tile.y <= 0 || tile.x >= this.width || tile.y >= this.height;
    }

    addCliffs() {

        // this.tiles.list.forEach(tile => {
        //     tile.cliffElevation = 1;
        // });
        //
        // const minimum = min( this.tiles.list, 'cliffElevation').cliffElevation;
        // const maximum = max( this.tiles.list, 'cliffElevation').cliffElevation;
        //
        // let minScale = 0;
        // let maxScale = 1;
        //
        // this.tiles.list.forEach(tile => tile.cliffElevation = scale(minimum, maximum, minScale, maxScale, tile.cliffElevation));
        // const cliffCount = 20;
        // const edge = 0.2;
        // const cliffPoints = [];
        // const cliffMinLength = 20;
        // const cliffMaxLength = 50;
        //
        // for (let i = 0; i < cliffCount; i++) {
        //     const x = this.rng.floatBetween(edge, 1 - edge) * this.width;
        //     const y = this.rng.floatBetween(edge, 1 - edge) * this.height;
        //     cliffPoints.push(new Vector(x, y));
        // }
        // cliffPoints.forEach(point => {
        //     const a = point;
        //     const randomDir = Vector.normalise(new Vector(this.rng.floatBetween(-1, 1), this.rng.floatBetween(-1, 1)));
        //     const randomCliffLength = this.rng.floatBetween(cliffMinLength, cliffMaxLength);
        //     const b = Vector.add(a, Vector.multiply(randomDir, randomCliffLength));
        //
        //     const dir = Vector.subtract(b, a);
        //
        //     const runoff = 10;
        //     const tilesBetween = this.tilesBetween(a, b);
        //     const normal = Vector.unitNormal(dir);
        //
        //     tilesBetween.forEach(cliffTile => {
        //
        //         const v = Vector.multiply(normal, runoff);
        //         const tilePos = new Vector(cliffTile.x, cliffTile.y);
        //         const runoffTiles = this.tilesBetween(tilePos, Vector.add(tilePos, v));
        //         // cliffTile.cliffElevation = 2;
        //
        //         // const low = runoffTiles[runoffTiles.length - 1].cliffElevation;
        //         runoffTiles.forEach((runoffTile, i) => {
        //
        //             runoffTile.cliffElevation = 1 + smoothStep(1 - (i / runoffTiles.length));
        //         });
        //     });
        // });
    }

    tilesBetween(a, b) {
        //Bresenham's line algorithm
        if (a === b) {
            throw new Error('Can\'t get tiles between same point!');
        }
        if (a.x > b.x) {
            const temp = a;
            a = b;
            b = temp;
        }
        const tiles = [];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        if (Math.round(dx) !== 0) {
            const derr = Math.abs(dy / dx);
            let err = 0;
            let y = a.y;
            for (let x = a.x; x < b.x; x++) {
                tiles.push(this.tiles.array[Math.floor(x)][Math.floor(y)]);
                err = err + derr;
                if (err >= 0.5) {
                    y = y + Math.sign(dy);
                    err = err - 1;
                }
            }
        } else {
            if (a.y > b.y) {
                const temp = a;
                a = b;
                b = temp;
            }

            for (let y = a.y; y < b.y; y++) {
                tiles.push(this.tiles.array[Math.floor(a.x)][Math.floor(y)]);
            }
        }

        console.log(`Tiles between (${a.x},${b.x}) and (${b.x},${b.y}):`, tiles);
        return tiles;
    }

    getTile(x, y) {
        return this.tiles.array[x][y];
    }
}


