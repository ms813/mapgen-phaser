import { shuffleArray, normalise, min, max, scale, scaleObjects } from '../../src/util/utils';

describe('Utils.shuffleArray', function () {
    it('should shuffle an array of numbers with the default Math.random', () => {
        const arr = [1, 2, 3, 4, 5];

        shuffleArray(arr);

        expect(arr.length).toBe(5);
        expect(arr).not.toEqual([1, 2, 3, 4, 5]);
    });

    it('should shuffle an array of numbers with a provided rng', () => {
        const arr = [1, 2, 3, 4, 5];

        shuffleArray(arr, () => 0);
        expect(arr.length).toBe(5);
        expect(arr).toEqual([2, 3, 4, 5, 1]);
    });

    it('should throw an error if the provided rng returns numbers outside of the range [0,1)', () => {
        expect(() => shuffleArray([1, 2, 3], () => -1))
            .toThrow(new Error('Specified random generator must return values in the range [0.1)'));

        expect(() => shuffleArray([1, 2, 3], () => Math.random() + 1))
            .toThrow(new Error('Specified random generator must return values in the range [0.1)'));
    });

    it('should throw an error if a non-array parameter is passed', () => {
        expect(() => shuffleArray(1)).toThrow(new Error('Cannot shuffle something that is not an array of numbers'));
        expect(() => shuffleArray('test')).toThrow(new Error('Cannot shuffle something that is not an array of numbers'));
        expect(() => shuffleArray({})).toThrow(new Error('Cannot shuffle something that is not an array of numbers'));

    });

    it('should throw an error if an array of something other than numbers is passed ', () => {
        expect(() => shuffleArray([{}]))
            .toThrow(new Error('Cannot shuffle an array that contains non-number items'));

        expect(() => shuffleArray([1, 2, 3, 4, 'test']))
            .toThrow(new Error('Cannot shuffle an array that contains non-number items'));

        expect(() => shuffleArray([Infinity, NaN]))
            .toThrow(new Error('Cannot shuffle an array that contains non-number items'));
    });
});

describe('Utils.min', function () {
    it('should return the object with the minimum value of the specified property', () => {
        let arr = [{v: 1}, {v: 2}, {v: 3}];

        expect(min(arr, 'v')).toEqual({v: 1});

        arr = [{v: -1}, {v: -2.5}, {v: 3}];
        expect(min(arr, 'v')).toEqual({v: -2.5});

        arr = [{v: -Infinity}, {v: -2.5}, {v: 3}];
        expect(min(arr, 'v')).toEqual({v: -Infinity});
    });

    it('should return the object with the minimum value of the specified property for a list of properties with same value', () => {
        let arr = [{v: 1}, {v: 1}, {v: 1}];

        expect(min(arr, 'v')).toEqual({v: 1});

        arr = [{v: -1.1}, {v: -1.1}, {v: -1.1}];
        expect(min(arr, 'v')).toEqual({v: -1.1});
    });

    it('should return the only object if there is only one in the list', () => {
        expect(min([{v: 1}], 'v')).toEqual({v: 1});
    });

    it('should throw an error if a non-array is passed', () => {
        expect(() => min({}, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof {}}`));
        expect(() => min(1, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof 1}`));
        expect(() => min('xyz', 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof 'xyz'}`));
        expect(() => min(null, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof null}`));
        expect(() => min(undefined, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof undefined}`));
    });

    it('should throw an error if the property is not specified', function () {
        expect(() => min([{v: 1}])).toThrow(new Error('property is a required parameter'));
    });

    it('should throw an error if a non-string property is passed', function () {
        expect(() => min([{v: 1}], 123)).toThrow(new Error(`Specified property must be a string, instead got ${typeof 123}`));
        expect(() => min([{v: 1}], {})).toThrow(new Error(`Specified property must be a string, instead got ${typeof {}}`));
        expect(() => min([{v: 1}], [])).toThrow(new Error(`Specified property must be a string, instead got ${typeof []}`));
        expect(() => min([{v: 1}], null)).toThrow(new Error(`Specified property must be a string, instead got ${typeof null}`));
    });

    it('should throw an error if the array is empty', function () {
        expect(() => min([], 'v')).toThrow(new Error('Cannot find the minimum of an empty array!'));
    });

    it('should throw an error if the property specified does not exist on the array objects', function () {
        expect(() => min([{v: 1}], 'x')).toThrow(new Error(`Specified property ${'x'} doesn't exist on object!`));
    });
});

describe('Utils.max', function () {
    it('should return the object with the maximum value of the specified property', () => {
        let arr = [{v: 1}, {v: 2}, {v: 3}];

        expect(max(arr, 'v')).toEqual({v: 3});

        arr = [{v: -1}, {v: -2.5}, {v: -3}];
        expect(max(arr, 'v')).toEqual({v: -1});

        arr = [{v: -Infinity}, {v: -2.5}, {v: 3}];
        expect(max(arr, 'v')).toEqual({v: 3});

        arr = [{v: Infinity}, {v: -2.5}, {v: 3}];
        expect(max(arr, 'v')).toEqual({v: Infinity});
    });

    it('should return the object with the minimum value of the specified property for a list of properties with same value', () => {
        let arr = [{v: 1}, {v: 1}, {v: 1}];

        expect(max(arr, 'v')).toEqual({v: 1});

        arr = [{v: -1.1}, {v: -1.1}, {v: -1.1}];
        expect(max(arr, 'v')).toEqual({v: -1.1});
    });

    it('should return the only object if there is only one in the list', () => {
        expect(max([{v: 1}], 'v')).toEqual({v: 1});
    });

    it('should throw an error if a non-array is passed', () => {
        expect(() => max({}, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof {}}`));
        expect(() => max(1, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof 1}`));
        expect(() => max('xyz', 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof 'xyz'}`));
        expect(() => max(null, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof null}`));
        expect(() => max(undefined, 'v')).toThrow(new Error(`First parameter must be an array, instead got ${typeof undefined}`));
    });

    it('should throw an error if the property is not specified', function () {
        expect(() => max([{v: 1}])).toThrow(new Error('property is a required parameter'));
    });

    it('should throw an error if a non-string property is passed', function () {
        expect(() => max([{v: 1}], 123)).toThrow(new Error(`Specified property must be a string, instead got ${typeof 123}`));
        expect(() => max([{v: 1}], {})).toThrow(new Error(`Specified property must be a string, instead got ${typeof {}}`));
        expect(() => max([{v: 1}], [])).toThrow(new Error(`Specified property must be a string, instead got ${typeof []}`));
        expect(() => max([{v: 1}], null)).toThrow(new Error(`Specified property must be a string, instead got ${typeof null}`));
    });

    it('should throw an error if the array is empty', function () {
        expect(() => max([], 'v')).toThrow(new Error('Cannot find the minimum of an empty array!'));
    });

    it('should throw an error if the property specified does not exist on the array objects', function () {
        expect(() => max([{v: 1}], 'x')).toThrow(new Error(`Specified property ${'x'} doesn't exist on object!`));
    });
});

describe('Utils.scale', function () {
    it('it should scale a value', function () {
        expect(scale(0, 10, 100, 200, 2)).toBe(120);
        expect(scale(0, -10, 100, 200, -2)).toBe(120);
        expect(scale(0, -10, 100, 200, -12)).toBe(220);
        expect(scale(0, 10, 100, 200, 20)).toBe(300);
        expect(scale(0, 10, 100, 0, 2)).toBe(80);
        expect(scale(0, 10, 100, -100, 2)).toBe(60);
    });
});
