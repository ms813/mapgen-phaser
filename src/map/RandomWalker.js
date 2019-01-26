import rng from 'random-seed';
// import Vector from '../util/Vector';
const Vector = Phaser.Math.Vector2;

class RandomWalker {
    constructor(seed) {
        this.rng = rng.create(seed);
    }

    createRandomWalk(startPos, bounds, steps, maxStepSize) {
        const vertices = [];
        let lastPos = startPos;

        for (let i = 0; i < steps; i++) {
            vertices.push(lastPos);
            lastPos = nextStep(lastPos, bounds, maxStepSize, this.rng);
        }

        return vertices;
    }
}

 const nextStep = function(lastPos, bounds, maxStepSize, rng) {

    let stepLength, angle, x, y;
    do{
        stepLength = rng.random() * maxStepSize;
        angle = rng.random() * 2 * Math.PI;

        x = stepLength * Math.cos(angle) + lastPos.x;
        y = stepLength * Math.sin(angle) + lastPos.y;
    }
    while(!bounds.contains(x, y));

    return new Vector(x, y);
};

export default RandomWalker;
