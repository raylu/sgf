import {html, css, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import './game_record';
import {PatternSearch} from './pattern';
import globalCSS from './style';

enum Page {
	Root,
	Game,
}

@customElement('sgf-app')
class SGFApp extends LitElement {
	@state()
	page = Page.Root;
	@state()
	patternSearch = new PatternSearch();
	@state()
	gamePath = '';

	constructor() {
		super();
		this.addEventListener('navigate', this._handleUrlChange);
	}

	connectedCallback() {
		super.connectedCallback();
		addEventListener('popstate', this._handleUrlChange.bind(this));
		this._handleUrlChange();
	}
	
	private _handleUrlChange() {
		if (location.pathname === '/')
			this.page = Page.Root;
		else if (location.pathname.startsWith('/game/')) {
			this.page = Page.Game;
			this.gamePath = location.pathname.substring(6);
		}
	}

	private _navigate(event: Event) {
		event.preventDefault();
		history.pushState({}, '', (event.target as HTMLAnchorElement).href);
		this._handleUrlChange();
	}

	private _post_json(path: RequestInfo, body: any): Promise<Response> {
		return fetch(path, {
			'method': 'POST',
			'headers': {'Content-Type': 'application/json'},
			'body': JSON.stringify(body),
		});
	}

	protected render() {
		switch (this.page) {
			case Page.Root: {
				return html`
					<a href="/game/2024 KifuDepot Games/2024-08-02 張羽喬 vs Liu Yifang" @click="${this._navigate}">game</a>
					${this.patternSearch}
					<button @click="${this._search}">search</button>
				`;
			}
			case Page.Game:
				return html`
					<a href="/" @click="${this._navigate}">back</a>
					<game-record path="${this.gamePath}"></game-record>
				`;
		}
	}

	private _search = async () => {
		const pattern = this.patternSearch.pattern.join('');
		await this._post_json('/api/search', pattern);
	}

	static styles = [globalCSS, css`
		:host {
			display: block;
			width: 900px;
			margin: 0 auto;
			background-color: #111;
			color: #eee;
			font-family: sans-serif;
		}
		a {
			color: #58a;
			text-decoration: none;
		}
		pattern-search {
			margin: 1em auto;
		}
	`];
}

(async function() {
	const app = new SGFApp();
	(document.querySelector('body') as HTMLBodyElement).appendChild(app);
})();
