# INDEED.co.uk tech job scraper

A scraping tool to be used in the terminal to scrape indeed.co.uk for popular technology skills.
E.g. React, Python, Javascript, SQL, AWS, Azure, git, CI/CD, etc...

scrapes job skills and returns the total number of currently listed jobs limited to:
* London
* Posted within last 2 weeks
* £40k+

## How to use

Clone repo
npm i
cd to repo
node main.js

Title will show.
Database will initialise if one doesn't currently exist.

Menu will show items to choose with arrow keys.

Choose to add skills.

Confirm all skills are added by show skills option in menu.

Once you have some skills added, choose scrape option in menu.

View database.sqlite in VScode sqlite extension for results.