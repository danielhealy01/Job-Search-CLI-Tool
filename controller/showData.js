import Table from 'cli-table3';
import sqlite3 from 'sqlite3';

export default async function drawTable() {
	const table = new Table({
		colWidths: [16, 16, 16, 16],
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
		head: ['id', 'date', 'skill', 'jobs'],
	});

	const db = new sqlite3.Database('database.sqlite');

	await db.all('SELECT * FROM ranking ORDER BY date', (err, rows) => {
		if (err) {
			console.error('Error: ', err.message);
		} else {
			if (rows.length === 0) {
				console.log('No rows found.');
			} else {
				rows.forEach((row) => {
					table.push([row.id, row.date, row.skill, row.jobs]);
				});
				console.log(table.toString());
			}
		}
	});

	await db.close();
}

// drawTable();
