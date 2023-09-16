#!/usr/bin/env node

import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import inquirer from 'inquirer';
import confirm from '@inquirer/confirm';
import puppeteer from 'puppeteer';
import sqlite3 from 'sqlite3';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
	sleep,
	sleepRandom,
	randomInterval,
	minTime,
	maxTime,
	trimLettersAndCastToNumber,
} from './utils/utilityFunctions.js';
import { Data, Skill, SkillData } from './model/scrapeData.js';
import drawTable from './controller/showData.js';
import drawSkillTable from './controller/showSkillList.js';
import { input } from '@inquirer/prompts';

//function to check if database exists
async function checkDatabaseExists() {
	const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
	const dbName = 'database.sqlite';
	// const filePath = path.join(currentDirectory, dbName);
	const files = await fs.readdir(currentDirectory);

	try {
		// await fs.access(filePath, fs.constants.F_OK);
		console.log(files);

		const dbExists = files.includes('database.sqlite');
		console.log(dbExists);
		if (dbExists) {
			console.log(`The file '${dbName}' exists in the folder.`);
		} else if (!dbExists) {
			console.log(
				`The file '${dbName}' does not exist in '${currentDirectory}'. Creating.`
			);
			createTable();
			createSkillTable();
		}
	} catch (err) {
		console.log(err);
	}
}

async function createTable() {
	await db.run(
		`CREATE TABLE IF NOT EXISTS ranking (
			id INTEGER PRIMARY KEY,
			date DATE NOT NULL,
			skill TEXT NOT NULL,
			jobs INT NOT NULL
			)`,
		(err) => {
			if (err) {
				console.error('Error creating table:', err.message);
			} else {
				console.log('Table created.');
			}
		}
	);
}

async function createSkillTable() {
	await db.run(
		`CREATE TABLE IF NOT EXISTS skills (
			skillId INTEGER PRIMARY KEY,
			skill TEXT NOT NULL
			)`,
		(err) => {
			if (err) {
				console.error('Error creating table:', err.message);
			} else {
				console.log('Table created.');
			}
		}
	);
}

async function checkDataExists() {
	try {
		const rows = await new Promise((resolve, reject) => {
			db.all('SELECT skill FROM ranking;', (err, rows) => {
				if (err) {
					reject(err);
					return;
				}
				resolve(rows);
			});
		});

		const skills = rows.map((row) => row.skill);
		console.log(skills);
		if (skills.length == 0) {
			console.clear();
			const confirmAddSkills = await confirm({
				message:
					'There are currently no skills in the database.\nAdd some skills?',
			});
			if (!confirmAddSkills) {
				process.exit(0);
			} else {
				console.clear();
				await addJobSkill();
				// await menu();
			}
		}
		// return skills;
	} catch (err) {
		console.log('error');
		throw err;
	}
}

//console.log(chalk.bgGreenBright('hello world'));
const sleepTime = 1500;

const jobSkill = '"SQL"';
console.clear();
await welcome();
const db = new sqlite3.Database('database.sqlite');
await checkDatabaseExists();
console.clear();
await menu();

// Indeed Software Dev Rainbow Title 2.75 secs
async function welcome() {
	const welcomeText = chalkAnimation.rainbow(
		'Indeed Skill Scraper for Software Dev \n'
	);
	welcomeText;
	// await sleep();
	await sleep(sleepTime);
	welcomeText.stop();
	console.clear();
}

async function menu() {
	const answers = await inquirer
		.prompt([
			{
				name: 'menuList',
				type: 'list',
				message: 'What would you like to do?:',
				choices: [
					'Scrape Jobs on Indeed',
					"Scrape all skill's Jobs on Indeed",
					'Show Job Skill Rankings',
					'Show skill list',
					'Add a new Job Skill to Scrape',
					'Exit',
				],
			},
		])
		.then((answer) => {
			if (answer.menuList == 'Exit') {
				process.exit(0);
			} else if (answer.menuList == 'Show Job Skill Rankings') {
				getRankings();
			} else if (answer.menuList == 'Scrape Jobs on Indeed') {
				scrape();
			} else if (answer.menuList == "Scrape all skill's Jobs on Indeed") {
				scrapeAllSkills();
			} else if (answer.menuList == 'Show skill list') {
				showSkillList();
			} else if (answer.menuList == 'Add a new Job Skill to Scrape') {
				addJobSkill();
			}
		});
}

async function scrape() {
	console.log('scrape');
	(async () => {
		// Launch the browser and open a new blank page
		const browser = await puppeteer.launch({ headless: 'new' });
		const page = await browser.newPage();

		// Navigate the page to a URL
		await page.goto(
			`https://uk.indeed.com/jobs?q=${jobSkill}+%C2%A340%2C000&l=London&radius=0&fromage=14&vjk=5fb7c8b94e6cbfb6`
		);

		// Set screen size
		await sleepRandom();
		await page.setViewport({ width: 1080, height: 1024 });

		// Locate the full title with a unique string
		const textSelector = '.jobsearch-JobCountAndSortPane-jobCount';
		await page.waitForSelector(textSelector);
		const fullTitle = await page.$eval(textSelector, (el) => el.textContent);

		// Print the full title
		console.log(`There are ${fullTitle}`);
		console.log(page.url());
		await sleepRandom();
		await browser.close();

		//Create new data object
		const randomNumber = () => Math.floor(Math.random() * (10000 - 1) + 1);
		const date = new Date().toLocaleDateString('en-GB', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
		const dataToInsert = new Data(
			randomNumber(),
			date,
			jobSkill,
			trimLettersAndCastToNumber(fullTitle)
		);
		console.log(dataToInsert);
		// db insert data object
		async function insertData(data) {
			const insertQuery = `
    			INSERT INTO ranking (id, date, skill, jobs)
    			VALUES (?, ?, ?, ?)
  			`;

			db.run(
				insertQuery,
				[data.id, data.date, data.skill, data.jobs],
				async function (err) {
					if (err) {
						console.error('Error inserting data:', err.message);
					} else {
						console.log(`Data inserted with ID: ${data.id}`);
					}
				}
			);
		}

		await insertData(dataToInsert);

		continueQuestion();
	})();
}

async function getRankings() {
	await checkDataExists();
	console.log('getRankings');
	console.clear();
	await drawTable();
	await sleep(sleepTime);
	await continueQuestion();
}

async function addJobSkill() {
	console.clear();

	const skillToAdd = await input({
		message: 'Enter a new skill to be scraped',
	});

	//Create new skill object
	const randomNumber = () => Math.floor(Math.random() * (10000 - 1) + 1);
	if (!skillToAdd) {
		console.clear();
		menu();
	} else {
		const skillToInsert = new Skill(randomNumber(), skillToAdd);
		console.log(skillToInsert);
		// db insert data object
		function insertSkill(skill) {
			const insertQuery = `
					INSERT INTO skills (skillid, skill)
					VALUES (?, ?)
				  `;

			db.run(insertQuery, [skill.skillId, skill.skill], async function (err) {
				if (err) {
					console.error('Error inserting data:', err.message);
				} else {
					console.log(`Data inserted with ID: ${skill.skillId}`);
				}
			});
		}
		insertSkill(skillToInsert);
		console.log(`successfully inserted ${skillToAdd}`);

		// create new table for skill

		await db.run(
			`CREATE TABLE IF NOT EXISTS ${skillToInsert.skill.replaceAll(' ', '')} (
			id INTEGER PRIMARY KEY,
			date DATE NOT NULL,
			jobs INT NOT NULL
			)`,
			(err) => {
				if (err) {
					console.error('Error creating table:', err.message);
					continueQuestion();
				} else {
					console.log(`${skillToInsert.skill} table created.`);
					// sleepRandom()
					continueQuestion();
				}
			}
		);
	}
}

async function continueQuestion() {
	const answer = await confirm({ message: 'Continue?' });
	if (!answer) {
		process.exit(0);
	} else {
		console.clear();
		await menu();
	}
}

async function showSkillList() {
	console.log('show skill list');
	// async function getTables() {
	// 	await db.all(
	// 		`SELECT name FROM sqlite_master WHERE type='table';`,
	// 		(err, rows) => {
	// 			if (err) {
	// 				console.error('Error is:', err.message);
	// 			} else {
	// 				const data = [];
	// 				rows.forEach((row) => {
	// 					data.push(row.name);
	// 				});
	// 				console.log(data);
	// 			}
	// 		}
	// 	);
	// }
	await drawSkillTable();
	await sleep(sleepTime);
	continueQuestion();
}

async function scrapeAllSkills() {
	// console.log('scrape all');
	// async function getTables() {
	// 	return await db.all(
	// 		`SELECT name FROM sqlite_master WHERE type='table';`,
	// 		(err, rows) => {
	// 			if (err) {
	// 				console.error('Error is:', err.message);
	// 			} else {
	// 				const data = [];
	// 				rows.forEach((row) => {
	// 					data.push(row.name);
	// 				});
	// 				console.log(data);
	// 			}
	// 		}
	// 	);

	// }
	// return await getTables()
	async function newScrape(skill) {
		console.log('new scrape');
		(async () => {
			// Launch the browser and open a new blank page
			const browser = await puppeteer.launch({ headless: 'new' });
			const page = await browser.newPage();
			const jobSkill = skill;
			// Navigate the page to a URL
			await page.goto(
				`https://uk.indeed.com/jobs?q=${jobSkill}+%C2%A340%2C000&l=London&radius=0&fromage=14&vjk=5fb7c8b94e6cbfb6`
			);

			// Set screen size
			await sleepRandom();
			await page.setViewport({ width: 1080, height: 1024 });

			// Locate the full title with a unique string
			const textSelector = '.jobsearch-JobCountAndSortPane-jobCount';
			await page.waitForSelector(textSelector);
			const result = await page.$eval(textSelector, (el) => el.textContent);

			// Print the full title
			console.log(`There are ${result}`);
			console.log(page.url());
			await sleepRandom();
			await browser.close();

			//Create new data object
			const randomNumber = () => Math.floor(Math.random() * (10000 - 1) + 1);
			const date = new Date().toLocaleDateString('en-GB', {
				day: '2-digit',
				month: '2-digit',
				year: 'numeric',
			});
			const dataToInsert = new SkillData(
				randomNumber(),
				date,
				trimLettersAndCastToNumber(result)
			);
			console.log(dataToInsert);
			// db insert data object
			async function insertData(data) {
				const insertQuery = `
    			INSERT INTO ${jobSkill} (id, date, jobs)
    			VALUES (?, ?, ?)
  			`;

				db.run(
					insertQuery,
					[data.id, data.date, data.jobs],
					async function (err) {
						if (err) {
							console.error('Error inserting data:', err.message);
						} else {
							console.log(`Data inserted with ID: ${data.id}`);
						}
					}
				);
			}

			await insertData(dataToInsert);
		})();
	}

	// async function getSkillList() {
	// 	const skillList = [];
	// 	await db.all(
	// 		`SELECT name FROM sqlite_master WHERE type='table';`,
	// 		(err, rows) => {
	// 			if (err) {
	// 				console.error('Error is:', err.message);
	// 			} else {
	// 				rows.forEach((row) => {
	// 					skillList.push([row.name]);

	// 					console.log(skillList);
	// 				});
	// 			}
	// 		}
	// 	);
	// 	return skillList;
	// }
	// const skillList = await getSkillList();

	// console.log(skillList);

	async function getSkillList() {
		return new Promise((resolve, reject) => {
			const skillList = [];
			db.all(
				`SELECT name FROM sqlite_master WHERE type='table';`,
				(err, rows) => {
					if (err) {
						console.error('Error is:', err.message);
						reject(err); // Reject the promise if there's an error
					} else {
						rows.forEach((row) => {
							skillList.push(row.name);
						});
						resolve(skillList); // Resolve the promise with the skillList
					}
				}
			);
		});
	}

	async function filteredSkillList() {
		try {
			const skillList = await getSkillList();
			console.log('Original skillList:', skillList);

			// Filter the tables that match 'skills' and 'rankings'
			const filteredTables1 = skillList.filter((name) => name !== 'skills');
			const filteredTables2 = filteredTables1.filter(
				(name) => name !== 'ranking'
			);
			console.log('Filtered tables:', filteredTables2);
			return filteredTables2;
		} catch (error) {
			console.error('Error:', error.message);
		}
	}


	(async () => {

		const list = await filteredSkillList();
		console.log(Array.isArray(list))
		await list.forEach((row) => {
			newScrape(row);
		})
	})()
	await sleep(5000);
	continueQuestion();
}

// add spinner during scrape
// write for loop to scrape for each skill and write to said skill's table

// for each on array of skills, callback to execute scrape function

// generate 3 month average for each individual skill table and summarise in general table

// remove cached .sqlites
// maybe on new skill, make a table for that skill, similar to existing sql
// make an average summary table for last 3 months

// trim quotes off of SQL
// change id to sequential based on last written id (cache? / revalidate?)

// somehow backup table
// scrape loops over each unique sill from skill table

// on first run:
// Please enter a password for the admin account setup:
// Confirm password:
// Admin account created.
// Loading menu.

// To add a skill, you must enter the admin password:

//add random sleep times between pings to avoid bot detection
// Show rankings reads db and displays as table
// auth - inquirer pw input for scrape and add new - / hash/salt / store non plain text in db

// mvp
// sqlite db pre-populated with skills
// scrape repeats for each skill in db
// rankings tabulates the data as an average
