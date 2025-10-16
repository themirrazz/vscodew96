class VSCodeApp extends WApplication {
	taskName = 'vscode';
	frame: HTMLIFrameElement | undefined;
	constructor() {
		super();
		this.title = 'vscode';
	}
	async main(argv: string[]) {
		const icon = await w96.ui.Theme.getIconUrl('apps/monaco');
		const win: StandardWindow = this.createWindow({
			title: '',
			icon: icon === null ? undefined : icon,
			initialHeight: 600,
			initialWidth: 800,
			center: true,
			iframeFix: false,
			taskbar: true,
			body: '<iframe style="width: 100%; height: 100%; border: none; outline: none;"></iframe>'
		}, true);
		const body: HTMLDivElement = win.getBodyContainer();
		const iframe: HTMLIFrameElement = body.querySelector('iframe');
		await w96.util.wait(100);
		iframe.contentWindow.process = {
			argv,
			window: win,
			self: this,
			exit: () => {
				this.terminate();
			}
		};
		iframe.src = '/_/C/local/VSCode/vs/code/browser/workbench/workbench.html';
		this.frame = iframe;
		window.addEventListener('mousedown', this.onmousedown);
		window.addEventListener('mouseup', this.onmouseup);
		win.show();
	}
	onmousedown() {
		this.frame.style.pointerEvents = 'none';
	}
	async openWith(file: string) {
		//
	}
	async sendArgv(argv: string[]) {
	}
	onmouseup() {
		this.frame.style.pointerEvents = '';
	}
	ontermination = () => {
		window.removeEventListener('mousedown', this.onmousedown);
		window.removeEventListener('mouseup', this.onmouseup);
	};
	findSelfIndex() {
		for (let i = 0; i < w96.__debug.processes.length; i++) {
			if (w96.__debug.processes[i] && w96.__debug.processes[i] === this) return i;
		}
		return -1;
	}
}
