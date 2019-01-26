import Vector from './Vector';

const shuffleArray = function (array, rng) {
    if (!Array.isArray(array)) {
        throw new Error('Cannot shuffle something that is not an array of numbers');
    }

    array.forEach(x => {
        if (typeof x !== 'number' || isNaN(x)) {
            throw new Error('Cannot shuffle an array that contains non-number items');
        }
    });

    if (!rng) rng = Math.random;

    for (let i = array.length - 1; i > 0; i--) {
        const rnd = rng();
        if (rnd < 0 || rnd >= 1) {
            throw new Error('Specified random generator must return values in the range [0.1)');
        }
        const j = Math.floor(rnd * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
    }

    return array;
};

const smoothStep = function (n) {
    return n * n * n * (n * (n * 6 - 15) + 10);
};

const lerp = function (a, b, x) {
    return a + x * (b - a);
};

const min = function (arr, property) {
    minMaxTypeCheck(arr, property);

    let minObj = arr[0];
    arr.forEach(x => {
        if (!(property in x)) {
            throw new Error(`Specified property ${property} doesn't exist on object!`);
        }

        if (x[property] < minObj[property]) {
            minObj = x;
        }
    });

    return minObj;
};

const max = function (arr, property) {
    minMaxTypeCheck(arr, property);

    let maxObj = arr[0];
    arr.forEach(x => {
        if (!(property in x)) {
            throw new Error(`Specified property ${property} doesn't exist on object!`);
        }

        if (x[property] > maxObj[property]) {
            maxObj = x;
        }
    });

    return maxObj;
};

const minMaxTypeCheck = function (arr, property) {
    if (property === undefined) {
        throw new Error('property is a required parameter');
    }

    if (typeof property !== 'string') {
        throw new Error(`Specified property must be a string, instead got ${typeof property}`);
    }

    if (!Array.isArray(arr)) {
        throw new Error(`First parameter must be an array, instead got ${typeof arr}`);
    }

    if (arr.length <= 0) {
        throw new Error('Cannot find the minimum of an empty array!');
    }
};

const scale = function (oldMin, oldMax, newMin, newMax, value) {
    return ((newMax - newMin) * (value - oldMin)) / (oldMax - oldMin) + newMin;
};


Vector._n = new Vector(0, -1);
Vector._s = new Vector(0, 1);
Vector._e = new Vector(1, 0);
Vector._w = new Vector(-1, 0);
Vector._ne = new Vector(1, -1);
Vector._se = new Vector(1, 1);
Vector._nw = new Vector(-1, -1);
Vector._sw = new Vector(-1, 1);

Vector[Vector[0] = 'NORTH'] = Vector._n;
Vector[Vector[1] = 'NORTH_EAST'] = Vector._ne;
Vector[Vector[2] = 'EAST'] = Vector._e;
Vector[Vector[3] = 'SOUTH_EAST'] = Vector._se;
Vector[Vector[4] = 'SOUTH'] = Vector._s;
Vector[Vector[5] = 'SOUTH_WEST'] = Vector._sw;
Vector[Vector[6] = 'WEST'] = Vector._w;
Vector[Vector[7] = 'NORTH_WEST'] = Vector._ne;

const CARDINAL_DIRECTIONS = [Vector._n, Vector._e, Vector._s, Vector._w];
const ORDINAL_DIRECTIONS = [Vector._ne, Vector._se, Vector._sw, Vector._nw];

export { shuffleArray, smoothStep, lerp, min, max, scale, CARDINAL_DIRECTIONS, ORDINAL_DIRECTIONS };
