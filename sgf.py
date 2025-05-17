#!/usr/bin/env python3

from __future__ import annotations

import dataclasses
import mimetypes
import pathlib
import sys
import typing

from pigwig import PigWig, Response

import db

if typing.TYPE_CHECKING:
	from pigwig import Request
	from pigwig.routes import RouteDefinition

def root(request: Request, catchall: str | None = None) -> Response:
	return Response(pathlib.Path('frontend/index.html').read_bytes(), content_type='text/html; charset=utf-8')

def players(request: Request) -> Response:
	return Response.json(list(db.players()))

def search_route(request: Request) -> Response:
	return Response.json(dataclasses.asdict(db.search(request.body['pattern'], request.body['player1'], request.body['player2'])))

def sgf(request: Request, file_path: str) -> Response:
	try:
		content = pathlib.Path('game_records', file_path).read_bytes()
	except FileNotFoundError:
		return Response('not found', 404)
	return Response(body=content, content_type='application/x-go-sgf')

def static(request: Request, file_path: str) -> Response:
	try:
		content = pathlib.Path('static', file_path).read_bytes()
	except FileNotFoundError:
		return Response('not found', 404)
	content_type, _ = mimetypes.guess_type(file_path)
	assert content_type is not None
	return Response(body=content, content_type=content_type)

routes: RouteDefinition = [
	('GET', '/', root),
	('GET', '/<path:catchall>', root),
	('GET', '/api/players', players),
	('POST', '/api/search', search_route),
	('GET', '/sgf/<path:file_path>', sgf),
	('GET', '/static/<path:file_path>', static),
]

app = PigWig(routes)

if __name__ == '__main__':
	mimetypes.add_type('application/json', '.map')
	if len(sys.argv) == 2: # production
		import waitress
		waitress.serve(app, listen=sys.argv[1])
	else: # dev
		app.main()
