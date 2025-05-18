import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import globalCSS from './style';

const colLabels = 'ABCDEFGHJKLMNOPQRST';

@customElement('go-board')
export class GoBoard extends LitElement {
	@property({attribute: false})
	pattern: string[] = Array(19 * 19).fill('*');

	@state()
	activeTool = '';

	protected render() {
		const tools = [
			['*', 'any'],
			['.', 'empty'],
			['X', 'black'],
			['O', 'white'],
			['x', 'black or empty'],
			['o', 'white or empty'],
		];
		return html`
			<div class="board" @click="${this._boardClicked}">
				${this.pattern.map((sym, i) => {
					const row = Math.floor(i / 19) + 2;
					const col = i % 19 + 2;
					return html`<div class="point" data-i="${i}" style="grid-row: ${row}; grid-column: ${col}">${sym}</div>`;
				})}
				${colLabels.split('').map((label, i) => html`
					<div class="coord" style="grid-row: 1; grid-column: ${i+2}">${label}</div>
					<div class="coord" style="grid-row: 21; grid-column: ${i+2}">${label}</div>`)}
				${Array.from({length: 19}, (_, i) => html`
					<div class="coord" style="grid-row: ${19-i+1}; grid-column: 1">${i+1}</div>
					<div class="coord" style="grid-row: ${19-i+1}; grid-column: 21">${i+1}</div>`)}
			</div>
			<div class="palette" @click="${this._paletteClicked}">
				${tools.map(([sym, desc]) => {
			return html`
					<div data-sym="${sym}" class="${this.activeTool === sym ? 'active' : ''}">${desc}</div>
				`;
		})}
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
	};

	private _paletteClicked = (e: MouseEvent) => {
		const sym = (e.target as HTMLDivElement).dataset['sym'];
		if (sym === undefined)
			return;
		this.activeTool = sym;
	};

	static styles = [globalCSS, css`
		:host {
			display: flex;
			justify-content: space-evenly;
		}
		.board {
			display: grid;
			grid-template: repeat(21, 30px) / repeat(21, 30px);
			width: 630px;
			color: #111;
			background-color: #ebc98a;
			cursor: crosshair;
		}
		.board > .point {
			text-align: center;
			line-height: 30px;
		}
		.board > .coord {
			text-align: center;
			line-height: 30px;
		}
		.palette {
			width: 140px;
			background-color: #666;
		}
		.palette > div {
			cursor: pointer;
		}
		.palette > div.active {
			background-color: #157;
		}
	`];
}
