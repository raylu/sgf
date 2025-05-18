import {Task} from '@lit/task';
import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

import {LitDropdown, setupClose, type Option} from './dropdown';
import globalCSS from './style';
import {GoBoard} from './board';

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
			${this.goBoard}
			<div class="players">${this.player1Dropdown}${this.player2Dropdown}</div>
			<button @click="${this._searchClicked}">search</button>
			${searchResults}
		`;
	}

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
		go-board {
			margin: 1em auto;
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
}


