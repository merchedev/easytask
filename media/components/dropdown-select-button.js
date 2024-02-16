import { vscode } from "../main.js";
import { getIcon } from "../services/icon-service.js";

class DropdownSelectButton extends HTMLElement{
	constructor(){
		super();
	}

	connectedCallback(){
		this.groupName = this.getAttribute('data-group');
		this.title = this.getAttribute('data-text').toLocaleLowerCase();
		this.icon = this.getAttribute('data-icon');
		this.localStorageName = `eaytask-${this.groupName}`;
		this.savedSelection = localStorage.getItem(this.localStorageName);

		this.render();
	}
	render() {
		this.innerHTML = /* html */`
			<button class="dropdown__select-button">
				${getIcon(this.icon, 'dropdown__check-icon')}
				<span class="dropdown__span">${this.title}</span>
			</button>
		`;
		this.buttonEl = this.querySelector('.dropdown__select-button');
		this.setEvents();

		if((this.savedSelection === null || this.savedSelection === undefined) && this.title === 'none'){
			this.setSelection();
		} else {
			if(this.savedSelection === this.title){
				this.setSelection();
			}
		}
	}

	setEvents(){
		this.buttonEl.addEventListener('click', this.setSelection);
		window.addEventListener('dropdown-selection-clicked', event => {

				const view = event.detail.view; 
				if(view !== this.title){
					this.removeSelection();
				}
		});
	}

	setSelection = () =>{
		this.buttonEl.classList.add('dropdown__select-button--selected');
		vscode.postMessage({ command: 'setView', viewName: this.title });
		localStorage.setItem(this.localStorageName, this.title);
		this.dispatchEvent(new CustomEvent('dropdown-selection-clicked', { 
			composed: true, 
			bubbles: true,
			detail: { view: this.title } 
		}));
	};

	removeSelection(){

		this.buttonEl.classList.remove('dropdown__select-button--selected');
		
	}
}
customElements.define("dropdown-select-button", DropdownSelectButton);