#!/usr/bin/env python3

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
	for subdir, _, filenames in root.walk():
		for filename in filenames:
			if not filename.endswith('.sgf'): continue
			path = (subdir / filename)
			print('processing', path)
			gamelist.process(path.read_bytes(), subdir.as_posix(), filename, glists)
			break

if __name__ == "__main__":
    main()
