// import {
// 	sleep,
// 	sleepRandom,
// 	randomInterval,
// 	minTime,
// 	maxTime,
// } from './utils/utilityFunctions.js';

const randomInterval = function (max, min) {
	return Math.floor(Math.random() * (max - min) + min);
};

const minTime = 1000;
const maxTime = 3000;

test('random time returned should be within min and max', () => {
	expect(randomInterval(maxTime, minTime)).toBeGreaterThan(minTime);
});
