import { getIcon } from "../services/icon-service.js";
class AccordionWC extends HTMLElement{
	constructor(){
		super();
	}

	connectedCallback(){
		this.title = this.getAttribute('data-title');
		this.icon  = getIcon(this.getAttribute('data-icon'), 'accordion-icon');

		this.render();
	}
	render() {
		this.innerHTML = /* html */`
			<details open>
					<summary class="accordion-title">${this.icon}${this.title}</summary>
					<slot name="content-${this.title}"></slot>
					${this.parentNode.querySelector('[slot]').innerHTML}
			</details>
		`;

	}
}
customElements.define("accordion-wc", AccordionWC);