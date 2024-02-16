
export const vscode = acquireVsCodeApi();

(function () {
		const container       = document.querySelector('.container');
		const refreshButtonEl = document.querySelector('#refresh-button');

		refreshButtonEl.addEventListener('click', () => {
			vscode.postMessage({ command: 'refresh', viewName: localStorage.getItem('eaytask-group-by')});
    });

		window.addEventListener('message', event => {

				const message = event.data;

				switch (message.command) {
						case 'loadContent':
								container.innerHTML = message.content;
								break;
				}
		});

}());