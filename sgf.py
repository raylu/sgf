#!/usr/bin/env python3

from __future__ import annotations

import mimetypes
import pathlib
import sys
import typing

from pigwig import PigWig, Response
from pigwig.exceptions import HTTPException

if typing.TYPE_CHECKING:
	from pigwig import Request
	from pigwig.routes import RouteDefinition

def root(request: Request) -> Response:
	return Response(pathlib.Path('frontend/index.html').read_bytes(), content_type='text/html; charset=utf-8')

def search_route(request: Request) -> Response:
	return 'hi'

def sgf(request, file_path: str) -> Response:
	try:
		content = pathlib.Path('game_records', file_path).read_bytes()
	except FileNotFoundError:
		return Response('not found', 404)
	return Response(body=content, content_type='application/x-go-sgf')

def static(request, file_path: str) -> Response:
	try:
		content = pathlib.Path('static', file_path).read_bytes()
	except FileNotFoundError:
		return Response('not found', 404)
	content_type, _ = mimetypes.guess_type(file_path)
	assert content_type is not None
	return Response(body=content, content_type=content_type)

routes: RouteDefinition = [
	('GET', '/', root),
	('GET', '/search', search_route),
	('GET', '/sgf/<path:file_path>', sgf),
	('GET', '/static/<path:file_path>', static),
]

app = PigWig(routes)

if __name__ == '__main__':
	mimetypes.add_type('application/json', '.map')
	port = 8000
	if len(sys.argv) == 2: # production
		import fastwsgi
		port = int(sys.argv[1])
		fastwsgi.run(app, '127.0.0.1', port)
	else: # dev
		app.main()
