import {LitElement, css, html} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import globalCSS from './style';

export interface Option {
	id: string
	name: string
}

export function setupClose(...dropdowns: LitDropdown[]) {
	document.addEventListener('click', (_event) => {
		for (const ld of dropdowns)
			ld.open = false;
	});
}

@customElement('lit-dropdown')
export class LitDropdown extends LitElement {
	@property({type: Boolean})
	open = false;
	@state()
	protected options: Option[] = [];
	@state()
	protected filteredOptions: Option[] | null = null;
	@state()
	selected: Option = {'id': '', 'name': ''};
	
	others: LitDropdown[] = [];

	protected createRenderRoot() {
		const root = super.createRenderRoot();
		root.addEventListener('click', this.handleClick);
		return root;
	}

	render() {
		return html`
			<div class="display">${this.selected['name']}</div>
			<div>
				<div class="arrow ${this.open ? 'up' : 'down'}"></div>
			</div>
			<div class="options ${this.open ? 'open' : ''}">
				<input @input=${debounce(100, this.search)} @keydown=${this.handleKeydown}>
				${(this.filteredOptions ?? []).map((option) =>
					html`<div class="option" data-value="${option['id']}">${option['name']}</div>`
				)}
			</div>
		`;
	}

	setOptions(options: Option[]): void {
		this.options = options;
		this.search();
	}

	private search(): void {
		if (!this.shadowRoot)
			return;
		const query = (this.shadowRoot.querySelector('input') as HTMLInputElement).value.toLocaleLowerCase();
		if (!query)
			this.filteredOptions = this.options;
		else {
			const prefix = [];
			const contains = [];
			for (const option of this.options) {
				const lower = option['name'].toLocaleLowerCase();
				if (lower.startsWith(query))
					prefix.push(option);
				else if (lower.indexOf(query) != -1)
					contains.push(option);
			}
			this.filteredOptions = prefix.concat(contains);
		}
	}

	select(id: string) {
		for (const option of this.options) {
			if (option['id'] == id) {
				this.selected = option;
				this.dispatchEvent(new CustomEvent('dropdown-select', {bubbles: true, composed: true}));
				return;
			}
		}
		throw 'no option with id ' + id;
	}

	private handleClick = async (event: Event) => {
		event.stopPropagation();
		const target = event.target as HTMLElement;
		if (target.classList.contains('option')) {
			this.selected = {'id': target.dataset['value'] || '', 'name': target.textContent!};
			this.open = false;
			this.dispatchEvent(new CustomEvent('dropdown-select', {bubbles: true, composed: true}));
		} else if (target.tagName != 'INPUT') {
			// close all other LitDropdowns
			for (const ld of this.others)
				if (ld != this)
					ld.open = false;

			this.open = !this.open;
			await this.updateComplete;
			this.shadowRoot!.querySelector('input')!.focus();
		}
	}

	private handleKeydown(event: KeyboardEvent) {
		if (event.key == 'Enter') {
			event.preventDefault();
			if (this.filteredOptions !== null && this.filteredOptions.length > 0) {
				this.selected = this.filteredOptions[0];
				this.open = false;
				(event.target as HTMLInputElement).value = '';
				this.search();
				this.dispatchEvent(new CustomEvent('dropdown-select', {bubbles: true, composed: true}));
			}
		}
	}

	static styles = [globalCSS, css`
		:host {
			position: relative;
			display: flex;
			width: 200px;
			height: 25px;
			vertical-align: middle;
			background-color: #222;
			border: 1px solid #333;
			cursor: default;
		}
		.display {
			display: inline-block;
			width: 182px;
			height: 25px;
			padding: 2.5px 3px;
			cursor: inherit;
		}
		.options {
			position: absolute;
			z-index: 1;
			display: none;
			top: 28px;
			left: -1px;
			width: 200px;
			max-height: 15em;
			overflow: hidden scroll;
			background-color: #222;
			border: 2px solid #444;
			cursor: inherit;
		}
		.options.open {
			display: block;
		}
		.options > .option {
			padding: 3px 5px;
			cursor: inherit;
			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
		.options > .option:hover {
			background-color: #333;
		}
		.options > input {
			width: 175px;
			margin: 3px;
			cursor: inherit;
			padding: 2px 3px;
			font-size: inherit;
			background-color: #333;
			border: 1px solid #444;
			color: inherit;
		}

		.arrow {
			margin: 8px 3px 0 0;
			width: 0; 
			height: 0; 
			border-left: 5px solid transparent;
			border-right: 5px solid transparent;
		}
		.arrow.up {
			border-bottom: 5px solid #38a;
		}
		.arrow.down {
			border-top: 5px solid #38a;
		}
	`];
}

function debounce(ms: number, func: () => void) {
	let timeout: number | undefined;
	return function() {
		clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			timeout = undefined;
			// @ts-ignore
			func.apply(this);
		}, ms);
	};
}
