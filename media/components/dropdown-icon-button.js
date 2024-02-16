import { getIcon } from "../services/icon-service.js";

class DropdownIconButton extends HTMLElement{
	constructor(){
		super();

	}

	connectedCallback(){
		this.title    = this.getAttribute('data-title').toLocaleLowerCase();
		this.icon     = this.getAttribute('data-icon');
		this.options = this.getAttribute('data-options').split('|').map((option)=> option.trim()); //? String, each option separated by | each parameter separated by , as 'title,icon'

		this.render();
	}
	render() {
		this.innerHTML = /* html */`
			<div id="group-by" class=" dropdown-button-wrapper">
				${getIcon(this.icon, 'icon-button icon-button__icon')}

				<div class="dropdown-menu">
					<h3 class="dropdown-menu__title">${this.title}</h3>
				</div>
				
			</div>
		`;

		const dropdownEl = this.querySelector('.dropdown-menu');
		this.options.forEach(option => {
			const data = option.split(',');
			const optionTitle = data[0];
			const optionIcon  = data[1];
			dropdownEl.innerHTML += `<dropdown-select-button data-group="${this.title.replaceAll(' ', '-')}" data-text="${optionTitle}" data-icon="${optionIcon}"></dropdown-select-button>`;
		});
	}
}
customElements.define("dropdown-icon-button", DropdownIconButton);