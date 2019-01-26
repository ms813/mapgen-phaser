import rng from 'random-seed';
import { shuffleArray, smoothStep, lerp } from './utils';

class Perlin {

    constructor(seed) {
        this.cap = 256;
        this.lookupTable = shuffleArray([...Array(this.cap).keys()], rng.create(seed).random);
        this.repeat = -1;
    }

    generate(x, y, scale, octaves, persistence) {
        if (!octaves) {
            return generateSimple(x, y, scale, this.repeat, this.lookupTable);
        } else {
            return generateOctave(x, y, scale, this.repeat, this.lookupTable, octaves, persistence);
        }
    }
}

const generateOctave = function (x, y, scale, repeat, lookupTable, octaves, persistence) {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
        total += generateSimple(x * frequency, y * frequency, scale, repeat, lookupTable) * amplitude;
        maxValue += amplitude;

        amplitude *= persistence;
        frequency *= 2;
    }
    // console.log('octave', total/maxValue);
    return total / maxValue;
};

const generateSimple = function (x, y, scale, repeat, lookup) {
    x = x / scale;
    y = y / scale;
    if (repeat > 0) {
        x = x % repeat;
        y = y % repeat;
    }

    const xi = x & 255;
    const yi = y & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = smoothStep(xf);
    const v = smoothStep(yf);

    const inc = incrementWithWrap;
    const aa = lookup[lookup[xi] + yi];
    const ab = lookup[lookup[xi] + inc(yi, repeat)];
    const ba = lookup[lookup[inc(xi, repeat)] + yi];
    const bb = lookup[lookup[inc(xi, repeat)] + inc(yi, repeat)];

    const x1 = lerp(
        grad(aa, xf, yf),
        grad(ba, xf - 1, yf),
        u
    );
    const x2 = lerp(
        grad(ab, xf, yf - 1),
        grad(bb, xf - 1, yf - 1),
        u
    );
    const perlin = (lerp(x1, x2, v) + 1) / 2;
    // console.log('simple', perlin);
    return perlin;
};

const incrementWithWrap = function (num, wrap) {
    num++;
    if (wrap > 0) {
        num %= wrap;
    }
    return num;
};

const grad = function (hash, x, y) {
    switch (hash & 0xF) {
        case 0x0:
            return x + y;
        case 0x1:
            return -x + y;
        case 0x2:
            return x - y;
        case 0x3:
            return -x - y;
        case 0x4:
            return x + y;
        case 0x5:
            return -x + y;
        case 0x6:
            return x - y;
        case 0x7:
            return -x - y;
        case 0x8:
            return x + y;
        case 0x9:
            return -x + y;
        case 0xA:
            return x - y;
        case 0xB:
            return -x - y;
        case 0xC:
            return x + y;
        case 0xD:
            return -x + y;
        case 0xE:
            return x - y;
        case 0xF:
            return -x - y;
        default:
            return 0; // never happens
    }
};

const fixedLookupTable = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
    140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
];

export default Perlin;
