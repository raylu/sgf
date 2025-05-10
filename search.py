#!/usr/bin/env python3

import enum
import pathlib
import typing

import kombilo

def search(pattern_str: str) -> typing.Iterator[tuple[str, str]]:
	gamelist = get_gamelist()
	pattern = kombilo.Pattern(kombilo.FULLBOARD_PATTERN, 19, 19, 19, pattern_str)
	print(pattern.printPattern())
	gamelist.search(pattern)
	print('got', gamelist.numHits(), 'in', gamelist.size(), 'games')
	# for cont in gamelist.continuations:
	# 	cont: kombilo.Continuation
	# 	print(cont.label, 'has', cont.total())
	for i in range(gamelist.num_hits):
		yield gamelist.get_gameInfoStr(i), repr(gamelist.get_resultsStr(i))

def get_gamelist() -> kombilo.GameList:
	opts = kombilo.ProcessOptions()
	opts.sgfInDB = False
	opts.processVariations = False
	opts.professional_tag = 2 # tag if 1p-9p
	return kombilo.GameList('game_records/kombilo.db', '', '[[path]]/[[filename]]', opts)

def process(gamelist: kombilo.GameList) -> None:
	root = pathlib.Path('game_records')
	glists = kombilo.vectorGL()
	gamelist.start_processing()
	for subdir, _, filenames in root.walk():
		for filename in filenames:
			if not filename.endswith('.sgf'):
				continue
			path = (subdir / filename)
			num_sgfs = gamelist.process(path.read_text(), subdir.as_posix(), filename, glists,
					flags=kombilo.CHECK_FOR_DUPLICATES | kombilo.OMIT_DUPLICATES)
			if num_sgfs != 1:
				print(f'error processing {path}: got {num_sgfs} SGFs')
				continue
			result = PROCESS_RESULT(gamelist.process_results(0))
			if result != 0:
				print(path, result.name)
			break
	gamelist.finalize_processing()

class PROCESS_RESULT(enum.IntFlag):
	UNACCEPTABLE_BOARDSIZE = kombilo.UNACCEPTABLE_BOARDSIZE
	SGF_ERROR = kombilo.SGF_ERROR
	IS_DUPLICATE = kombilo.IS_DUPLICATE
	NOT_INSERTED_INTO_DB = kombilo.NOT_INSERTED_INTO_DB
	INDEX_OUT_OF_RANGE = kombilo.INDEX_OUT_OF_RANGE

if __name__ == "__main__":
	for path, result in search('*' * (19 * 19)):
		print(path, result)
