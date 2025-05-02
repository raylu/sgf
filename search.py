#!/usr/bin/env python3

import zipfile

import pysgf

def main():
	zipf = zipfile.ZipFile('aesalon.zip', 'r')
	for i, filename in enumerate(zipf.namelist()):
		if not filename.endswith('.sgf'):
			continue
		print(filename)
		sgf = pysgf.SGF.parse(zipf.read(filename).decode())
		print(sgf.board_size, sgf.komi, sgf.ruleset)
		print(sgf.properties)
		print(sgf.player)
		if i >= 10: break

if __name__ == "__main__":
    main()
