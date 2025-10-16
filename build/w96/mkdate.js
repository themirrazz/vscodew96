import fs from 'fs/promises';
await fs.writeFile(
	'./out-build/date',
	(new Date).toISOString()
);
console.log('Wrote date, proceeding to minify');
