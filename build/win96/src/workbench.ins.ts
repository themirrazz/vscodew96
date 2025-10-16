globalThis.w96 = parent.w96;
await w96.util.wait(320);

if (window.process) {
	window.close = function () {
		process.exit();
	};
	Object.defineProperty(document, 'title', {
		get: () => {
			return process.window.title;
		},
		set: (newTitle: string) => {
			process.window.setTitle(newTitle);
		}
	});
}

await import(await w96.FS.toURL('C:/local/VSCode/vs/workbench/workbench.js'));
