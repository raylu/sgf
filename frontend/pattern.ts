import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import globalCSS from './style';

@customElement('pattern-search')
export class PatternSearch extends LitElement {
	@property({attribute: false})
	pattern: string[] = Array(19*19).fill('*');

	@state()
	activeTool = '';

	protected render() {
		return html`
			<div class="board" @click="${this._boardClicked}">
				${this.pattern.map((sym, i) => html`<div class="point" data-i="${i}">${sym}</div>`)}
			</div>
			<div class="palette" @click="${this._paletteClicked}">
				<div data-sym="X">black</div>
				<div data-sym="O">white</div>
			</div>
		`;
	}

	private _boardClicked = (e: MouseEvent) => {
		if (this.activeTool === '')
			return;
		const index = (e.target as HTMLDivElement).dataset['i'];
		if (index === undefined)
			return;
		this.pattern[parseInt(index, 10)] = this.activeTool;
		this.requestUpdate();
	}

	private _paletteClicked = (e: MouseEvent) => {
		const sym = (e.target as HTMLDivElement).dataset['sym'];
		if (sym === undefined)
			return;
		this.activeTool = sym;
	}

	static styles = [globalCSS, css`
		:host {
			display: flex;
			justify-content: space-evenly;
		}
		.board {
			display: grid;
			grid-template: repeat(19, 30px) / repeat(19, 30px);
			width: 570px;
			background-color: #ebc98a;
			cursor: crosshair;
		}
		.board > .point {
			text-align: center;
			line-height: 30px;
			color: #111;
		}
		.palette {
			width: 140px;
			background-color: #666;
		}
		.palette > div {
			cursor: pointer;
		}
	`];
}
