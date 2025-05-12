#!/usr/bin/env python3
from __future__ import annotations

import dataclasses
import enum
import pathlib

import kombilo

def get_gamelist() -> kombilo.GameList:
	opts = kombilo.ProcessOptions()
	opts.sgfInDB = False
	opts.processVariations = False
	opts.professional_tag = 2 # tag if 1p-9p
	return kombilo.GameList('game_records/kombilo.db', '', '[[path]]/[[filename]]', opts)

def search(pattern_str: str) -> SearchResult:
	gamelist = get_gamelist()
	pattern = kombilo.Pattern(kombilo.FULLBOARD_PATTERN, 19, 19, 19, pattern_str)
	gamelist.search(pattern)
	# for cont in gamelist.continuations:
	# 	cont: kombilo.Continuation
	# 	print(cont.label, 'has', cont.total())
	results = []
	for i in range(gamelist.num_hits):
		if not (result := gamelist.get_resultsStr(i)):
			continue
		path: str = gamelist.get_gameInfoStr(i).removeprefix('game_records/').removesuffix('.sgf')
		results.append((path, result))
		if len(results) >= 50:
			break
	return SearchResult(results)

@dataclasses.dataclass(eq=False, frozen=True, slots=True)
class SearchResult:
	results: list[tuple[str, str]]

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
