import {html, css, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';

import './game_record';
import {SGFSearch} from './search';
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
	gamePath = '';
	@state()
	moveNum: number | null = null;
	@state()
	guess = false;
	@state()
	sgfSearch = new SGFSearch();

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
			if (location.search.startsWith('?m='))
				this.moveNum = parseInt(location.search.substring(3));
			else if (location.search == '?guess=1') {
				this.guess = true;
				this.moveNum = 4;
			}
		}
	}

	private _navigate(event: Event) {
		event.preventDefault();
		history.pushState({}, '', (event.target as HTMLAnchorElement).href);
		this._handleUrlChange();
	}

	protected render() {
		switch (this.page) {
		case Page.Root: {
			return this.sgfSearch;
		}
		case Page.Game:
			return html`
				<a href="/" @click="${this._navigate}">back</a>
				<game-record path="${this.gamePath}" moveNum="${this.moveNum}" mode="${this.guess ? 'guess' : 'view'}"></game-record>
			`;
		}
	}

	static styles = [globalCSS, css`
		:host {
			display: block;
			min-width: 630px;
			max-width: 900px;
			margin: 0 auto;
			padding: 20px;
			background-color: #111;
			color: #eee;
		}
		@media (max-width: 900px) {
			:host {
				padding: 0;
			}
		}
	`];
}

(async function() {
	const app = new SGFApp();
	(document.querySelector('body') as HTMLBodyElement).appendChild(app);
})();
