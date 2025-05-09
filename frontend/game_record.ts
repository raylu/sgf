import {Task} from '@lit/task';
import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
// @ts-ignore
import * as sgf from '@sabaki/sgf';
// @ts-ignore
import * as tenuki from 'tenuki';

import globalCSS, {tenukiCSS} from './style';

function sgf_to_coords(move: string): [number, number] {
	// https://red-bean.com/sgf/go.html
	return [parseInt(move[1], 36) - 10, parseInt(move[0], 36) - 10];
}

@customElement('game-record')
export class GameRecord extends LitElement {
	@property({type: String})
	path = '';
	@property({type: Number})
	moveNum: number | null = null;

	@state()
	moves: object[] = [];

	private _readTask = new Task(this, {
		args: () => [this.path] as const,
		task: async ([path], {signal}): Promise<any> => {
			const sgfContents = await fetch(`/sgf/${path}.sgf`, {signal});
			if (sgfContents.status !== 200)
				throw new Error(`${sgfContents.status} ${sgfContents.statusText}`);
			return sgf.parseBuffer(await sgfContents.bytes())[0];
		},
	});

	protected createRenderRoot() {
		const root = super.createRenderRoot();
		root.addEventListener('click', this._moveClicked);
		return root;
	}

	protected render() {
		return this._readTask.render({
			pending: () => html`loading...`,
			complete: this._renderSGF,
			error: (e) => html`${e}`
		});
	}

	private _renderSGF = (node: any) => {
		const tenukiEl = document.createElement('div');
		tenukiEl.classList.add('tenuki-board');
		const game = new tenuki.Game({'element': tenukiEl});
		const moves = [];

		let moveNum = 0;
		let player = 'B';
		while ((node = node.children[0])) {
			moveNum++;
			let [move] = node.data[player];
			moves.push(html`<div data-num="${moveNum}" class="${player.toLowerCase()} ${moveNum === this.moveNum ? 'active' : ''}">${moveNum}</div>`);
			if (this.moveNum === null || moveNum <= this.moveNum) {
				const [y, x] = sgf_to_coords(move);
				game.playAt(y, x);
			}
			if (player === 'B')
				player = 'W';
			else
				player = 'B';
		}
		const movesT = html`<div class="moves">${moves}</div>`
		return [tenukiEl, movesT];
	}

	private _moveClicked = (e: Event) => {
		const numStr = (e.target as HTMLDivElement).dataset['num'];
		if (numStr === undefined) return;
		this.moveNum = parseInt(numStr);
	}

	static styles = [globalCSS, tenukiCSS, css`
		:host {
			color: #eee;
			font-family: sans-serif;
		}
		.tenuki-board {
			margin: 1em auto;
		}
		.moves {
			background-color: #666;
			padding: 1em;
		}
		.moves > div {
			display: inline-block;
			margin: 2px;
			width: 24px;
			height: 24px;
			border-radius: 50%;
			text-align: center;
			line-height: 24px;
			font-size: 12px;
			cursor: pointer;
		}
		.moves > div.b {
			background-color: #222;
			color: #ddd;
		}
		.moves > div.w {
			background-color: #ddd;
			color: #222;
		}
		.moves > div.active {
			box-shadow: 0 0 1px 3px #157;
		}
	`];
}
