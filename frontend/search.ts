import {Task} from '@lit/task';
import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {LitDropdown, setupClose, type Option} from './dropdown';
import globalCSS from './style';
import {GoBoard, tools, type Tool} from './board';

const navigate = new Event('navigate', {composed: true});

@customElement('sgf-search')
export class SGFSearch extends LitElement {
	@property()
	player1 = '';
	@property()
	player2 = '';
	@state()
	player1Dropdown = new LitDropdown();
	@state()
	player2Dropdown = new LitDropdown();

	@state()
	goBoard = new GoBoard();
	@state()
	searchPattern = this.goBoard.pattern.join('');

	connectedCallback(): void {
		super.connectedCallback();
		setupClose(this.player1Dropdown, this.player2Dropdown);
		this.player1Dropdown.others = this.player2Dropdown.others = [this.player1Dropdown, this.player2Dropdown];
		fetch('/api/players').then((response) => response.json()).then((players: string[]) => {
			const options: Option[] = [{'id': '', 'name': '(any)'}];
			for (const player of players)
				options.push({'id': player, 'name': player});
			this.player1Dropdown.setOptions(options);
			this.player2Dropdown.setOptions(options.slice());
			this.player1Dropdown.select('');
			this.player2Dropdown.select('');
		});
		this.addEventListener('dropdown-select', this._playerSelected);
	}

	protected render() {
		const {games, continuations} = this._searchTask.render({
			pending: () => {return {games: html`searching...`, continuations: null};},
			complete: this._renderSearchResults,
			error: (e) => {return {games: html`${e}`, continuations: null}},
		})!;
		return html`
			<section class="top">
				${this.goBoard}
				<section class="right">
					<div class="palette" @click="${this._paletteClicked}">
						${Object.entries(tools).map(([sym, desc]) =>
							html`<div data-sym="${sym}" class="${this.goBoard.activeTool === sym ? 'active' : ''}">${desc}</div>`
						)}
					</div>
					${continuations}
				</section>
			</section>
			<div class="players">${this.player1Dropdown}${this.player2Dropdown}</div>
			<button @click="${this._searchClicked}">search</button>
			${games}
		`;
	}

	private _renderSearchResults = (results: SearchResults) => {
		const games = html`
			hits: ${results.num_hits.toLocaleString()}
			${results.results.map(([path, result]) => {
				return html`
				<div>
					${path}
					${result.split(', ').map((continuation) =>
						html`<a href="game/${path}?m=${continuation.match(/\d+/)![0]}" @click=${this._navigate}>${continuation}</a> `)}
					<a href="game/${path}?guess=1" @click=${this._navigate}>[guess]</a>
				</div>`;
			})}
		`;
		const sortedContinuations = Object.values(results.continuations)
				.filter((cont) => cont.label != '?').sort((a, b) => b.total - a.total);
		const continuations = html`<div class="continuations">
			${sortedContinuations.map((cont) => html`<div>${cont.label}: ${cont.total.toLocaleString()}</div>`)}
		</div>`;
		this.goBoard.continuations = results.continuations;
		return {games, continuations};
	}

	private _paletteClicked = (e: MouseEvent) => {
		const sym = (e.target as HTMLDivElement).dataset['sym'];
		if (sym === undefined)
			return;
		this.goBoard.activeTool = sym as Tool;
		this.requestUpdate();
	};

	private _playerSelected = (_event: Event) => {
		this.player1 = this.player1Dropdown.selected.id;
		this.player2 = this.player2Dropdown.selected.id;
	}

	private _searchClicked = async () => {
		this.searchPattern = this.goBoard.pattern.join('');
	}

	private _searchTask = new Task(this, {
		args: () => [this.searchPattern, this.player1, this.player2] as const,
		task: async ([pattern, player1, player2], {signal}): Promise<SearchResults> => {
			const results = await this._post_json('/api/search', {pattern, player1, player2}, signal);
			if (results.status !== 200)
				throw new Error(`${results.status} ${results.statusText}`);
			return results.json();
		},
	});

	private _post_json(path: RequestInfo, body: any, signal: AbortSignal): Promise<Response> {
		return fetch(path, {
			'method': 'POST',
			'headers': {'Content-Type': 'application/json'},
			'body': JSON.stringify(body),
			signal,
		});
	}

	private _navigate = (event: Event) => {
		event.preventDefault();
		history.pushState({}, '', (event.target as HTMLAnchorElement).href);
		this.dispatchEvent(navigate);
	}

	static styles = [globalCSS, css`
		section.top {
			display: flex;
			justify-content: space-evenly;
			height: 630px;
		}
		section.top > section.right {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
		section.top > section.right > .palette {
			width: 140px;
			padding: 6px 10px;
			background-color: #666;
		}
		section.top > section.right > .palette > div {
			cursor: pointer;
		}
		section.top > section.right > .palette > div.active {
			background-color: #157;
		}
		section.top > section.right > .continuations {
			max-height: calc(630px - 140px);
			overflow-y: auto;
			padding: 6px 10px;
			background-color: #222;
		}
		.players {
			display: flex;
			margin: 1em 0;
		}
		.players > lit-dropdown {
			margin-right: 20px;
		}
	`];
}

interface SearchResults {
	num_hits: number;
	results: string[][];
	continuations: {[index: number]: Continuation};
	black_wins: number;
	white_wins: number;
}

export interface Continuation {
	label: string;
	index: number;
	total: number;
}
