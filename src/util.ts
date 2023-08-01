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