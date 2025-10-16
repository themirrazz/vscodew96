import fs from 'fs/promises';
await fs.rename('./out', './out-build');
console.log('Moved build directory, writing date');
await fs.writeFile(
	'./out-build/date',
	(new Date).toISOString()
);
console.log('Wrote date');
