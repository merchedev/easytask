
(function () {
    const vscode          = acquireVsCodeApi();
		const refreshButtonEl = document.querySelector('.refresh-button');
		const todoButtonEls   = document.querySelectorAll('.todo-button');

		refreshButtonEl.addEventListener('click', () => {
			vscode.postMessage({ command: 'refresh' });
    });

		todoButtonEls.forEach(todoButtonEl => {
			const filePath = todoButtonEl.getAttribute('data-path');
			const fileLine = todoButtonEl.getAttribute('data-line');
			todoButtonEl.addEventListener('click', ()=> {
				vscode.postMessage({ command: 'openFile', text: filePath, line: fileLine });
			});
		});

}());