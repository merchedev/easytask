import { vscode } from "../main.js";
import { getIcon } from "../services/icon-service.js";

class TodoButton extends HTMLElement{
	constructor(){
		super();
	}

	connectedCallback(){
		this.fileName = this.getAttribute('data-name');
		this.filePath = this.getAttribute('data-path');
		this.fileLine = this.getAttribute('data-line');
		this.msg     = this.getAttribute('data-msg');
		this.render();
	}

	render() {
		this.innerHTML = /* html */`
			<li>
				<button class="todo-button" data-path="${this.filePath}" data-line="${this.fileLine}" >
					${getIcon('todo', 'todo-icon')}
					<div class="text-wrapper">
						<p class="file-text">${this.fileName}:${this.fileLine}</p>
						<p class="todo-text">${this.msg}</p>
					</div>
					${getIcon('caret', 'caret')}
				</button>
			</li>
		`;
		this.button = this.querySelector('button');
		this.setEvents();
	}

	setEvents(){
		this.button.addEventListener('click', ()=> {
			vscode.postMessage({ command: 'openFile', text: this.filePath, line: this.fileLine });
		});
	}
}
customElements.define("todo-button", TodoButton);
