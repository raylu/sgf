#!/usr/bin/env python3
from __future__ import annotations

import dataclasses
import enum
import pathlib
import typing

import kombilo

def get_gamelist() -> kombilo.GameList:
	opts = kombilo.ProcessOptions()
	opts.sgfInDB = False
	opts.processVariations = False
	opts.professional_tag = 2 # tag if 1p-9p
	return kombilo.GameList('game_records/kombilo.db', '', '[[path]]/[[filename]]|', opts)

def search(pattern_str: str, player1: str, player2: str, page: int) -> SearchResult:
	gamelist = get_gamelist()

	where = []
	params = []
	if player1:
		where.append("(PB = ? OR PW = ?)")
		params.extend([player1, player1])
	if player2:
		where.append("(PB = ? OR PW = ?)")
		params.extend([player2, player2])
	if where:
		try:
			gamelist.gisearch(' AND '.join(where), params)
		except kombilo.DBError as e:
			print(e.msg)
			raise

	pattern = kombilo.Pattern(kombilo.FULLBOARD_PATTERN, 19, 19, 19, pattern_str)
	gamelist.search(pattern)
	results = []
	for i in range((page-1) * 50, min(gamelist.size(), page * 50)):
		result: str = gamelist.currentEntryAsString(i)
		path, continuations = result.split('|', 1)
		path = path.removeprefix('game_records/').removesuffix('.sgf')
		results.append((path, continuations.removesuffix(', ')))
	continuations = {}
	for index, (label, cont) in enumerate(zip(gamelist.labels, gamelist.continuations)):
		cont: kombilo.Continuation
		assert (label == '.') ^ (cont.total() > 0)
		if cont.total():
			continuations[index] = Continuation(label, index, cont.total())
	return SearchResult(gamelist.num_hits, gamelist.size(), results, continuations, gamelist.BwinsG, gamelist.WwinsG)

@dataclasses.dataclass(eq=False, frozen=True, slots=True)
class SearchResult:
	num_hits: int
	num_games: int
	results: list[tuple[str, str]]
	continuations: dict[int, Continuation]
	black_wins: int
	white_wins: int

@dataclasses.dataclass(eq=False, frozen=True, slots=True)
class Continuation:
	label: str
	index: int
	total: int
	def __lt__(self, other: Continuation) -> bool:
		return self.total < other.total

def players() -> typing.Iterator[str]:
	gamelist = get_gamelist()
	for i in range(gamelist.plSize()):
		yield gamelist.plEntry(i)

def process() -> None:
	gamelist = get_gamelist()
	root = pathlib.Path('game_records')
	glists = kombilo.vectorGL()
	for subdir, dirnames, filenames in root.walk(top_down=True):
		if subdir.name.endswith('Fox Games'):
			print('skipping', subdir)
			dirnames.clear()
			continue
		print('processing', subdir)
		gamelist.start_processing()
		for filename in filenames:
			if not filename.endswith('.sgf'):
				continue
			path = (subdir / filename)
			try:
				num_sgfs = gamelist.process(path.read_text(), subdir.as_posix(), filename, glists,
						flags=kombilo.CHECK_FOR_DUPLICATES | kombilo.OMIT_DUPLICATES)
			except kombilo.SGFError as e:
				print(f'error processing {path}: {e}')
				continue
			if num_sgfs != 1:
				print(f'error processing {path}: got {num_sgfs} SGFs')
				continue
			result = PROCESS_RESULT(gamelist.process_results(0))
			if result != 0:
				print(path, result.name)
		gamelist.finalize_processing()

class PROCESS_RESULT(enum.IntFlag):
	UNACCEPTABLE_BOARDSIZE = kombilo.UNACCEPTABLE_BOARDSIZE
	SGF_ERROR = kombilo.SGF_ERROR
	IS_DUPLICATE = kombilo.IS_DUPLICATE
	NOT_INSERTED_INTO_DB = kombilo.NOT_INSERTED_INTO_DB
	INDEX_OUT_OF_RANGE = kombilo.INDEX_OUT_OF_RANGE

if __name__ == "__main__":
	process()
