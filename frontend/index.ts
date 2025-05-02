import * as tenuki from 'tenuki';
import * as sgf from '@sabaki/sgf';

(async () => {
	const sgfContents = await fetch('/sgf/2024 KifuDepot Games/2024-08-02 張羽喬 vs Liu Yifang.sgf');
	let node = sgf.parseBuffer(await sgfContents.bytes())[0]

	const game = new tenuki.Game({'element': document.querySelector('#tenuki') as HTMLDivElement});
	const movesEl = document.querySelector('#moves') as HTMLDivElement;
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
		movesEl.appendChild(moveEl);
		moveNum++;
	}
	const moves = game._moves;
	movesEl.addEventListener('click', (e) => {
		const numStr = (e.target as HTMLDivElement).dataset['num'];
		if (numStr === undefined) return;
		const num = parseInt(numStr);
		game._moves = moves.slice(0, num + 1);
		game.render(num);
	});
})();

function sgf_to_coords(move: string): [number, number] {
	// https://red-bean.com/sgf/go.html
	return [parseInt(move[1], 36) - 10, parseInt(move[0], 36) - 10];
}
