#!/usr/bin/env node

import chalk from 'chalk';
import chalkAnimation from 'chalk-animation';
import inquirer from 'inquirer';
import confirm from '@inquirer/confirm';
import puppeteer from 'puppeteer';
import readline from 'readline';
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
import { Data } from './model/scrapeData.js';
import drawTable from './controller/showData.js';

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

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
					'Show Job Skill Rankings',
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
	console.log('addJobSkill');
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

// add new 'skills' table
// ability to add new skills

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
