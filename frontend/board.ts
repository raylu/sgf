import {LitElement, html, css, svg, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import globalCSS from './style';
import type {Continuation} from './search';

const colLabels = 'ABCDEFGHJKLMNOPQRST';
export const tools = {
	'*': 'any',
	'.': 'empty',
	'X': 'black',
	'O': 'white',
	'x': 'black or empty',
	'o': 'white or empty',
} as const;
export type Tool = keyof typeof tools;
const stones: Record<Tool, TemplateResult | ''> = {
	'*': svg`<circle cx="15px" cy="15px" r="14px" fill="#fff0" stroke="#bbb"></circle>`,
	'.': '',
	'X': svg`<circle cx="15px" cy="15px" r="14px" fill="#111" stroke="#aaa"></circle>`,
	'O': svg`<circle cx="15px" cy="15px" r="14px" fill="#eee" stroke="#333"></circle>`,
	'x': svg`<circle cx="15px" cy="15px" r="14px" fill="#1119" stroke="#07a"></circle>`,
	'o': svg`<circle cx="15px" cy="15px" r="14px" fill="#eee9" stroke="#07a"></circle>`,
}

@customElement('go-board')
export class GoBoard extends LitElement {
	@property()
	mode: 'pattern' | 'view' | 'guess' = 'pattern';
	@property({attribute: false})
	pattern: Tool[] = Array(19 * 19).fill('*');
	@property()
	activeTool: Tool = 'X';
	@property({type: Number})
	nextMove: number | null = null;
	@property({attribute: false})
	continuations: {[index: number]: Continuation} = {};

	@state()
	lastPlayed: number | null = null;
	@state()
	filled: boolean[] = Array(19 * 19).fill(false);

	protected render() {
		const maxContinuations = Math.max(...Object.values(this.continuations).map((c) => c.total));
		return html`
			<div class="board" @click="${this._boardClicked}">
				${this.pattern.map((sym, i) => {
					const row = Math.floor(i / 19) + 2;
					const col = i % 19 + 2;
					let lastPlayed: TemplateResult | '' = '';
					let continuation: TemplateResult | '' = '';
					if (i === this.lastPlayed)
						lastPlayed = svg`<circle cx="15px" cy="15px" r="8px" fill="none" stroke="${sym == 'X' ? '#ccf' : '#037'}" stroke-width="2"></circle>`;
					if (this.continuations[i] && this.continuations[i].label != '?') {
						const percentage = this.continuations[i].total / maxContinuations
						continuation = svg`
							<circle cx="15px" cy="15px" r="10px" fill="#ca7"></circle>
							<text text-anchor="middle" dominant-baseline="middle" x="15" y="16"
								fill="hsl(219 ${percentage * 50 + 25}% 42%)" font-size="${percentage * 8 + 12}px"
								font-weight="${percentage * 750}">${this.continuations[i].label}</text>
						`;
					}
					return html`<div class="point ${this.filled[i] ? 'filled' : ''}" data-i="${i}" style="grid-row: ${row}; grid-column: ${col}">
						${svg`<svg>${continuation}${stones[sym]}${lastPlayed}</svg>`}
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
		`;
	}

	private _boardClicked = (e: MouseEvent) => {
		if (this.mode == 'view')
			return;
		let target: HTMLElement | null = e.target as HTMLElement;
		while (target.dataset['i'] === undefined) {
			target = target.parentElement;
			if (!target) return;
		}
		if (target.dataset['i'] === undefined)
			return;
		const index = parseInt(target.dataset['i'], 10);
		if (this.mode == 'pattern')
			this.pattern[index] = this.activeTool;
		else if (this.mode == 'guess') {
			if (index === this.nextMove)
				this.dispatchEvent(new CustomEvent('correct-guess', {bubbles: true, composed: true}));
			else
				this._wrongGuess(index);
		}
		this.requestUpdate();
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

	private _wrongGuess(index: number) {
		const guessRow = Math.floor(index / 19);
		const guessCol = index % 19;
		const nextRow = Math.floor(this.nextMove! / 19);
		const nextCol = this.nextMove! % 19;
		const rowDiff = nextRow - guessRow;
		const colDiff = nextCol - guessCol;
		if (Math.abs(rowDiff) >= Math.abs(colDiff)) {
			if (rowDiff > 0) // next move is below
				this._fill(0, guessRow, 0, 18);
			else // next move is above
				this._fill(guessRow, 18, 0, 18);
		} else {
			if (colDiff > 0) // next move is right
				this._fill(0, 18, 0, guessCol);
			else
				this._fill(0, 18, guessCol, 18);
		}
	}

	private _fill(startRow: number, endRow: number, startCol: number, endCol: number) {
		for (let row = startRow; row <= endRow; row++)
			for (let col = startCol; col <= endCol; col++)
				this.filled[row * 19 + col] = true;
	}

	static styles = [globalCSS, css`
		.board {
			display: grid;
			grid-template: repeat(21, 30px) / repeat(21, 30px);
			width: 630px;
			color: #111;
			background-color: #ca7;
			position: relative; /* for .grid */
		}
		.board > .point {
			z-index: 1;
			transition: background-color 0.2s;
		}
		.board > .point.filled {
			background-color: #0009;
		}
		.board > .point > svg {
			width: 30px;
			height: 30px;
			user-select: none;
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
	`];
}
