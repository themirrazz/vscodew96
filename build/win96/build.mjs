import fs from 'fs/promises';
import { execSync } from "child_process";
import path from 'path';

execSync("node ./node_modules/gulp/bin/gulp.js minify-vscode-reh-web", { stdio: "inherit" });

try {
	await fs.rmdir('./out-w96', { recursive: true });
} catch (error) {
	void (error);
}
await fs.mkdir('./out-w96');
await fs.mkdir('./out-w96/native');

const workBenchSettings = JSON.stringify(JSON.parse(
	await fs.readFile('./build/win96/default-settings.json', { encoding: 'utf-8' })
)).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('\'', '&apos;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

await fs.cp('./out-vscode-reh-web/vs', './out-w96/vs', {
	recursive: true
});
await fs.cp('./out-vscode-reh-web/media', './out-w96/media', {
	recursive: true
});

async function replaceInFile(originalFile, queries = {}) {
	console.log(`Rebuilding ${path.basename(originalFile)} for Windows 96...`);
	let data = await fs.readFile('./out-w96/' + originalFile, { encoding: 'utf-8' });
	Object.keys(queries).forEach(q => {
		data = data.replaceAll(q, queries[q]);
	});
	await fs.writeFile('./out-w96/' + originalFile, data, { encoding: 'utf-8' });
	console.log('Rebuild finished');
}

async function replaceInFile_RegEx(originalFile, r, t) {
	console.log(`Rebuilding ${path.basename(originalFile)} for Windows 96...`);
	let data = await fs.readFile('./out-w96/' + originalFile, { encoding: 'utf-8' });
	data.replaceAll(r, t);
	await fs.writeFile('./out-w96/' + originalFile, data, { encoding: 'utf-8' });
	console.log('Rebuild finished');
}

await replaceInFile('vs/code/browser/workbench/workbench.html', {
	"{{WORKBENCH_WEB_BASE_URL}}/out/vs/code/browser/workbench/workbench.js": "/_/C/local/VSCode/workbench.ins.js",
	"{{WORKBENCH_WEB_BASE_URL}}/out": "{{WORKBENCH_WEB_BASE_URL}}",
	"{{WORKBENCH_AUTH_SESSION}}": "",
	"{{WORKBENCH_WEB_CONFIGURATION}}": workBenchSettings,
	"{{WORKBENCH_WEB_BASE_URL}}": "/_/C/local/VSCode",
	"globalThis._VSCODE_FILE_ROOT = baseUrl + '/out/';": "globalThis._VSCODE_FILE_ROOT = baseUrl + '/';"
});

await replaceInFile_RegEx(
	'vs/code/browser/workbench/workbench.js',
	/webviewContentExternalBaseUrlTemplate:\"https:\/\/\{\{?uuid\}?\}\.vscode-cdn\.net\/insider\/[a-f0-9]+\/out\/vs\/workbench\/contrib\/webview\/browser\/pre\/\"/g,
	"webviewContentExternalBaseUrlTemplate:(new URL('/_/C/local/VSCode/prebuilt/webview/', location.origin)).toString()"
);


await replaceInFile(
	'vs/code/browser/workbench/workbench.js',
	{
		" get webviewExternalEndpoint() {\n    const endpoint = this.options.webviewEndpoint": " get webviewExternalEndpoint() {\n    const endpoint = (new URL('/_/C/local/VSCode/prebuilt/webview/', location.origin)).toString() || this.options.webviewEndpoint"
	}
);

/*
await replaceInFile_RegEx(
	'vs/code/browser/workbench/workbench.js',
	/webviewContentExternalBaseUrlTemplate: \"https:\/\/\{\{?uuid\}?\}\.vscode-cdn\.net\/insider\/[a-f0-9]+\/out\/vs\/workbench\/contrib\/webview\/browser\/pre\/\"/g,
	"webviewContentExternalBaseUrlTemplate: (new URL('/_/C/local/VSCode/prebuilt/webview/', location.origin)).toString()"
);


await replaceInFile_RegEx(
	'vs/code/browser/workbench/workbench.js',
	/\"webviewContentExternalBaseUrlTemplate\": \"https:\/\/\{\{?uuid\}?\}\.vscode-cdn\.net\/insider\/[a-f0-9]+\/out\/vs\/workbench\/contrib\/webview\/browser\/pre\/\"/g,
	"\"webviewContentExternalBaseUrlTemplate\": (new URL('/_/C/local/VSCode/prebuilt/webview/', location.origin)).toString()"
);
*/

console.log('');
console.log('Finished rebuilding required files!');
console.log('');
console.log('Starting native builds...');
console.log('');
console.log("Please ignore tsc errors, if it prints \"Done!\" then its compiled.");
console.log('');

try {
	await fs.mkdir('./out-w96/native');
} catch (error) {
	void (error);
}

await fs.cp('./build/win96/src/prebuilt', './out-w96/prebuilt', {
	recursive: true
});

try {
	execSync("tsc ./build/win96/src/workbench.ins.ts --outDir ./out-w96/ --skipLibCheck --noEmitOnError false --module esnext --target es2020", { stdio: "inherit" });
} catch (error) {
	void (error);
}

const wrtData = JSON.parse(await fs.readFile(
	'./build/win96/src/native/main.wrtdata',
	{ encoding: 'utf-8' }
));

try {
	execSync("tsc ./build/win96/src/native/main.ts --outDir ./out-w96 --skipLibCheck --noEmitOnError false --module esnext --target es2020", { stdio: "inherit" });
} catch (error) {
	void (error);
}

await fs.writeFile(
	'./out-w96/wrt.bin',
	[
		'//!wrt $BSPEC:' + JSON.stringify(wrtData),
		await fs.readFile('./out-w96/main.js', { encoding: 'utf-8' }),
		'return await WApplication.execAsync(new VSCodeApp(), this.boxedEnv.args);'
	].join('\n'),
	{
		encoding: 'utf-8'
	}
);

await fs.rm('./out-w96/main.js');

const dir = await fs.readdir('./build/win96/src/native');

for (let i = 0; i < dir.length; i++) {
	if (dir[i].endsWith('.ts') && dir[i] !== 'main.ts') {
		let sanitized = dir[i].replaceAll(' ', '').replaceAll('"', '').replaceAll('\n', '').replaceAll('&', '').replaceAll('|', '').replaceAll('*', '').replaceAll('\r', '').replaceAll('\'', '').replaceAll('?', '').replaceAll('!', '').replaceAll(':', '').replaceAll(';', '').replaceAll('+', '').replaceAll('$', '').replaceAll('#', '').replaceAll('%', '').replaceAll('^', '');
		sanitized = sanitized.slice(0, sanitized.length - 3);
		try {
			execSync(`tsc ./build/win96/src/native/${sanitized}.ts --outDir ./out-w96/native --skipLibCheck --noEmitOnError false --module esnext --target es2020`, { stdio: "inherit" });
		} catch (error) {
			void (error);
		}
	}
}

console.log('Done!');
