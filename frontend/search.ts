import {Task} from '@lit/task';
import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {LitDropdown, setupClose} from './dropdown';
import globalCSS from './style';

const navigate = new Event('navigate', {composed: true});

@customElement('sgf-search')
export class SGFSearch extends LitElement {
	@property({attribute: false})
	playerA = new LitDropdown();
	@property({attribute: false})
	playerB = new LitDropdown();

	@state()
	patternSearch = new PatternSearch();
	@state()
	searchPattern = this.patternSearch.pattern.join('');

	connectedCallback(): void {
		super.connectedCallback();
		setupClose(this.playerA, this.playerB);
		this.playerA.others = this.playerB.others = [this.playerA, this.playerB];
		fetch('/api/players').then((response) => response.json()).then((players: string[]) => {
			const options = players.map((player) => ({'id': player, 'name': player}));
			this.playerA.setOptions(options);
			this.playerB.setOptions(options.slice());
		});
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
			${this.playerA}
			${this.playerB}
			<button @click="${this._searchClicked}">search</button>
			${searchResults}
		`;
	}

	private _searchClicked = async () => {
		this.searchPattern = this.patternSearch.pattern.join('');
	}

	private _searchTask = new Task(this, {
		args: () => [this.searchPattern] as const,
		task: async ([pattern], {signal}): Promise<SearchResults> => {
			const results = await this._post_json('/api/search', pattern, signal);
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
