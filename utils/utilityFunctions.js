const sleep = (ms = sleepTime) => new Promise((r) => setTimeout(r, ms));

const randomInterval = function (max, min) {
	return Math.floor(Math.random() * (max - min) + min);
};

const sleepRandom = (ms = randomInterval(maxTime, minTime)) => {
	new Promise((r) => setTimeout(r, ms));
};

const minTime = 1000;
const maxTime = 3000;


function trimLettersAndCastToNumber(inputString) {
    // Use a regular expression to remove all non-digit characters
	const numericString = inputString.replace(/[^0-9\s]/g, '').trim();
    
	// Parse the numeric string as a number
	const numericValue = parseInt(numericString);
    
	// Check if the parsed value is NaN (Not-a-Number), and return 0 if it is
	if (isNaN(numericValue)) {
        return 0;
	}
    
	// Return the numeric value as a number
	return numericValue;
}

export { sleep, randomInterval, sleepRandom, maxTime, minTime, trimLettersAndCastToNumber };