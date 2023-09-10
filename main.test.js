import {
	randomInterval,
	minTime,
	maxTime,
	trimLettersAndCastToNumber,
} from './utils/utilityFunctions.js';

test('random time returned should be within min and max', () => {
	const numberOfTests = 20;
	for (let i = 0; i < 20; i++) {
		console.log(randomInterval(maxTime, minTime));
		expect(randomInterval(maxTime, minTime)).toBeGreaterThan(minTime);
		expect(randomInterval(maxTime, minTime)).toBeLessThan(maxTime);
	}
});

test('trim white space and cast scrape string as number', () => {
	console.log(trimLettersAndCastToNumber('728 jobs'));
	expect(trimLettersAndCastToNumber('728 jobs')).toBeInstanceOf(Number);
});
