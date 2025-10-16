import { execSync } from "child_process";

const toExec = [
	'node ./node_modules/gulp/bin/gulp.js compile',
	'node ./build/win96/mkdate.mjs',
	'node ./build/win96/build.mjs'
];

toExec.forEach(e => execSync(e, { stdio: "inherit" }));
