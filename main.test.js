import {
	randomInterval,
	minTime,
	maxTime,
} from './utils/utilityFunctions.js';



test('random time returned should be within min and max', () => {
	expect(randomInterval(maxTime, minTime)).toBeGreaterThan(minTime);
});
