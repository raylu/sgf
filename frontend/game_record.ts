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


const navigate = new Event('navigate', {composed: true});

@customElement('game-record')
export class GameRecord extends LitElement {
	@property({type: String})
	path = '';

	@state()
	moves: object[] = [];

	private _readTask = new Task(this, {
		args: () => [this.path],
		task: async ([path], {signal}): Promise<any> => {
			const sgfContents = await fetch(`/sgf/${path}.sgf`, {signal});
			if (sgfContents.status !== 200)
				throw new Error(`${sgfContents.status} ${sgfContents.statusText}`);
			return sgf.parseBuffer(await sgfContents.bytes())[0];
		},
	});

	private _navigate(event: Event) {
		event.preventDefault();
		history.pushState({}, '', (event.target as HTMLAnchorElement).href);
		this.dispatchEvent(navigate);
	}

	render() {
		return this._readTask.render({
			pending: () => html`loading...`,
			complete: this._renderSGF,
			error: (e) => html`${e}`
		});
	}

	private _renderSGF(node: any) {
		const tenukiEl = document.createElement('div');
		tenukiEl.classList.add('tenuki-board');
		const game = new tenuki.Game({'element': tenukiEl});

		let moveNum = 0;
		while ((node = node.children[0])) {
			let move;
			const moveEl = document.createElement('div');
			moveEl.dataset['num'] = moveNum.toString();
			if (game.currentPlayer() == 'black') {
				if (!node.data['B']) throw new Error(`expecting black move, got ${node.data}`);
				[move] = node.data.B;
				moveEl.textContent = `B ${moveNum + 1}`;
			} else {
				if (!node.data['W']) throw new Error(`expecting white move, got ${node.data}`);
				[move] = node.data.W;
				moveEl.textContent = `W ${moveNum + 1}`;
			}
			const [y, x] = sgf_to_coords(move);
			game.playAt(y, x);
			moveNum++;
		}
		return tenukiEl;
	}

	static styles = [globalCSS, tenukiCSS, css`
		a {
			color: #58a;
			text-decoration: none;
		}
	`];
}
