import Table from 'cli-table3';
import sqlite3 from 'sqlite3';

export default async function drawSkillTable() {
	const skillTable = new Table({
		colWidths: [16],
		style: { compact: true },
		chars: {
			top: '═',
			'top-mid': '╤',
			'top-left': '╔',
			'top-right': '╗',
			bottom: '═',
			'bottom-mid': '╧',
			'bottom-left': '╚',
			'bottom-right': '╝',
			left: '║',
			'left-mid': '╟',
			mid: '─',
			'mid-mid': '┼',
			right: '║',
			'right-mid': '╢',
			middle: '│',
		},
		head: ['Skill'],
	});

	const db = new sqlite3.Database('database.sqlite');

	// await db.all('SELECT * FROM ranking ORDER BY date', (err, rows) => {
	// 	if (err) {
	// 		console.error('Error: ', err.message);
	// 	} else {
	// 		if (rows.length === 0) {
	// 			console.log('No rows found.');
	// 		} else {
	// 			rows.forEach((row) => {
	// 				table.push([row.id, row.date, row.skill, row.jobs]);
	// 			});
	// 			console.log(table.toString());
	// 		}
	// 	}
	// });

	await db.all(
		`SELECT name FROM sqlite_master WHERE type='table';`,
		(err, rows) => {
			if (err) {
				console.error('Error is:', err.message);
			} else {

				rows.forEach((row) => {
					skillTable.push([row.name,]);
				});
				console.log(skillTable.toString());
			}
		}
	);

	await db.close();
}

// drawTable();
