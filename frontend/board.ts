import {LitElement, html, css, svg} from 'lit';
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
				<svg class="grid">
					${Array.from({length: 19}, (_, i) => svg`<rect x="45" y="${45 + i*30}" width="540" height="1"></rect>`)}
					${Array.from({length: 19}, (_, i) => svg`<rect x="${45 + i*30}" y="45" width="1" height="540"></rect>`)}
					${[
						[3, 3], [9, 3], [15, 3],
						[3, 9], [9, 9], [15, 9],
						[3,15], [9,15], [15,15]
					].map(([x, y]) => svg`<circle cx="${45 + x*30}" cy="${45 + y*30}" r="3.5px"></circle>`)}
				</svg>
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
			position: relative; /* for .grid */
		}
		.board > .point {
			text-align: center;
			line-height: 30px;
		}
		.board > .coord {
			text-align: center;
			line-height: 30px;
		}
		.board > svg.grid {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 0;
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
