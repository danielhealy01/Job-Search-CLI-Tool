const sleep = (ms = sleepTime) => new Promise((r) => setTimeout(r, ms));

const randomInterval = function (max, min) {
	return Math.floor(Math.random() * (max - min) + min);
};

const sleepRandom = (ms = randomInterval(maxTime, minTime)) => {
	new Promise((r) => setTimeout(r, ms));
};

const minTime = 1000;
const maxTime = 3000;

export { sleep, randomInterval, sleepRandom, maxTime, minTime };
