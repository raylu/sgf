import {Task} from '@lit/task';
import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {LitDropdown, setupClose} from './dropdown';
import globalCSS from './style';

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
	patternSearch = new PatternSearch();
	@state()
	searchPattern = this.patternSearch.pattern.join('');

	connectedCallback(): void {
		super.connectedCallback();
		setupClose(this.player1Dropdown, this.player2Dropdown);
		this.player1Dropdown.others = this.player2Dropdown.others = [this.player1Dropdown, this.player2Dropdown];
		fetch('/api/players').then((response) => response.json()).then((players: string[]) => {
			const options = players.map((player) => ({'id': null, 'name': player}));
			this.player1Dropdown.setOptions(options);
			this.player2Dropdown.setOptions(options.slice());
		});
		this.addEventListener('dropdown-select', this._playerSelected);
	}

	protected render() {
		const searchResults = this._searchTask.render({
			pending: () => html`searching...`,
			complete: (results) => html`
				hits: ${results.num_hits.toLocaleString()}
				${results.results.map(([path, result]) => {
					return html`<div><a href="game/${path}" @click="${this._navigate}">${path}</a> ${result}</div>`;
				})}
			`,
			error: (e) => html`${e}`
		});
		return html`
			${this.patternSearch}
			${this.player1Dropdown}
			${this.player2Dropdown}
			<button @click="${this._searchClicked}">search</button>
			${searchResults}
		`;
	}

	private _playerSelected = (_event: Event) => {
		this.player1 = this.player1Dropdown.selected.name;
		this.player2 = this.player2Dropdown.selected.name;
	}

	private _searchClicked = async () => {
		this.searchPattern = this.patternSearch.pattern.join('');
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

	private _navigate(event: Event) {
		event.preventDefault();
		history.pushState({}, '', (event.target as HTMLAnchorElement).href);
		this.dispatchEvent(navigate);
    }

	static styles = [globalCSS, css`
		a {
			color: #58a;
			text-decoration: none;
		}
		pattern-search {
			margin: 1em auto;
		}
	`];
}

interface SearchResults {
	num_hits: number;
	results: string[][];
}

@customElement('pattern-search')
class PatternSearch extends LitElement {
	@property({attribute: false})
	pattern: string[] = Array(19*19).fill('*');

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
				${this.pattern.map((sym, i) => html`<div class="point" data-i="${i}">${sym}</div>`)}
			</div>
			<div class="palette" @click="${this._paletteClicked}">
				${tools.map(([sym, desc]) => { return html`
					<div data-sym="${sym}" class="${this.activeTool === sym ? 'active' : ''}">${desc}</div>
				`})}
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
		.palette > div.active {
			background-color: #157;
		}
	`];
}
