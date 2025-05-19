import {LitElement, html, css, svg, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import globalCSS from './style';

const colLabels = 'ABCDEFGHJKLMNOPQRST';
const tools = {
	'*': 'any',
	'.': 'empty',
	'X': 'black',
	'O': 'white',
	'x': 'black or empty',
	'o': 'white or empty',
} as const;
type Tool = keyof typeof tools;
const stones: Record<Tool, TemplateResult | null> = {
	'*': svg`<circle cx="15px" cy="15px" r="14px" fill="#fff0" stroke="#aaa"></circle>`,
	'.': null,
	'X': svg`<circle cx="15px" cy="15px" r="14px" fill="#111" stroke="#aaa"></circle>`,
	'O': svg`<circle cx="15px" cy="15px" r="14px" fill="#eee" stroke="#333"></circle>`,
	'x': svg`<circle cx="15px" cy="15px" r="14px" fill="#1119" stroke="#07a"></circle>`,
	'o': svg`<circle cx="15px" cy="15px" r="14px" fill="#eee9" stroke="#07a"></circle>`,
}

@customElement('go-board')
export class GoBoard extends LitElement {
	@property()
	mode: 'pattern' | 'game_record' | 'guess' = 'pattern';
	@property({attribute: false})
	pattern: Tool[] = Array(19 * 19).fill('*');

	@state()
	activeTool: Tool = 'X';
	@state()
	lastPlayed: number | null = null;

	protected render() {
		return html`
			<div class="board" @click="${this._boardClicked}">
				${this.pattern.map((sym, i) => {
					const row = Math.floor(i / 19) + 2;
					const col = i % 19 + 2;
					let lastPlayed: TemplateResult | '' = '';
					if (i === this.lastPlayed)
						if (sym == 'X')
							lastPlayed = svg`<circle cx="15px" cy="15px" r="8px" fill="none" stroke="#ccf" stroke-width="2"></circle>`;
						else
							lastPlayed = svg`<circle cx="15px" cy="15px" r="8px" fill="none" stroke="#037" stroke-width="2"></circle>`;
					return html`<div class="point" data-i="${i}" style="grid-row: ${row}; grid-column: ${col}">
						${stones[sym] === null ? null : svg`<svg>${stones[sym]}${lastPlayed}</svg>`}
					</div>`;
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
			${(this.mode === 'pattern') ? html`
				<div class="palette" @click="${this._paletteClicked}">
					${Object.entries(tools).map(([sym, desc]) =>
						html`<div data-sym="${sym}" class="${this.activeTool === sym ? 'active' : ''}">${desc}</div>`
					)}
				</div>` : null}
		`;
	}

	private _boardClicked = (e: MouseEvent) => {
		if (this.mode == 'game_record')
			return;
		let target: HTMLElement | null = e.target as HTMLElement;
		while (target.dataset['i'] === undefined) {
			target = target.parentElement;
			if (!target) return;
		}
		const index = target.dataset['i'];
		if (index === undefined)
			return;
		this.pattern[parseInt(index, 10)] = this.activeTool;
		this.requestUpdate();
	};

	private _paletteClicked = (e: MouseEvent) => {
		const sym = (e.target as HTMLDivElement).dataset['sym'];
		if (sym === undefined)
			return;
		this.activeTool = sym as Tool;
	};

	play(row: number, col: number, color: 'B' | 'W') {
		const index = row * 19 + col;
		this.pattern[index] = color == 'B' ? 'X' : 'O';
		this.lastPlayed = index;
		// check for capture
		const opponent = color == 'B' ? 'O' : 'X';
		for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
			const seen = new Set<number>();
			if (this._checkCaptured(row + dr, col + dc, opponent, seen))
				for (const i of seen)
					this.pattern[i] = '.';
		}
		this.requestUpdate();
	}

	private _checkCaptured(row: number, col: number, opponent: 'O' | 'X', seen: Set<number>): boolean {
		if (row < 0 || row >= 19 || col < 0 || col >= 19)
			return true;
		const index = row * 19 + col;
		if (seen.has(index))
			return true;
		const stone = this.pattern[index];
		if (stone === opponent) { // same group
			seen.add(index);
			let captured = true;
			for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]])
				captured &&= this._checkCaptured(row+dr, col+dc, opponent, seen);
			return captured;
		} else if (stone === '.') { // has a liberty
			return false;
		} else { // stone is just played color
			return true;
		}
	}

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
			position: relative; /* for .grid */
		}
		.board > .point {
			z-index: 1;
		}
		.board > .point > svg {
			width: 30px;
			height: 30px;
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
