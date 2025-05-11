export interface Env {
	// https://developers.cloudflare.com/workers/runtime-apis/r2/
	SGF_BUCKET: R2Bucket;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let key = decodeURIComponent(new URL(request.url).pathname);
		console.log('key', key);
		if (key.startsWith('/sgf/'))
			key = key.slice('/sgf/'.length);

		switch (request.method) {
			case 'HEAD': {
				const object = await env.SGF_BUCKET.head(key);
				if (object === null)
					return new Response('not found', {status: 404});
				return new Response('', {headers: headers(object)});
			}
			case 'GET': {
				const object = await env.SGF_BUCKET.get(key);
				if (object === null)
					return new Response('not found', {status: 404});
				return new Response(object.body, {headers: headers(object)});
			}
			default:
				return new Response('method not allowed', {status: 405, headers: {Allow: 'HEAD, GET'}});
		}
	},
};

function headers(object: R2Object): Headers {
	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set('etag', object.httpEtag);
	headers.set('access-control-allow-origin', '*');
	if (object.key.endsWith('.sgf'))
		headers.set('content-type', 'x-go-sgf');
	return headers;
}
