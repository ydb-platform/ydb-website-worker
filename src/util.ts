export function changeUrl(req: Request, new_url: URL): Request {
    const {
        headers,
        method,
        redirect,
        referrer,
        referrerPolicy,
        body
    } = req;

    return new Request(new_url.toString(), {
      headers,
      method,
      redirect,
      referrer,
      referrerPolicy,
      body,
    });
  }

export function withCors(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Vary', 'Origin');
  return new Response(response.body, { ...response, headers: newHeaders });
}