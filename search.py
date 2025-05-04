#!/usr/bin/env python3

import enum
import pathlib

import kombilo

def main():
	opts = kombilo.ProcessOptions()
	opts.sgfInDB = False
	opts.processVariations = False
	opts.professional_tag = 2 # tag if 1p-9p
	gamelist = kombilo.GameList("game_records/kombilo.db", "", "", opts)

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
    main()
