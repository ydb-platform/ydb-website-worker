import config from './config';


async function handleBlogRedirectRequest(request: Request): Promise<Response> {
  if (request.cf.country === 'RU') {
    return Response.redirect(config.blog_location.ru, 301);
  } else {
    return Response.redirect(config.blog_location.en, 301);
  }
}

const hostname_mapping = new Map([
  ['blog-redirect.ydb.tech', handleBlogRedirectRequest],
]);

async function default_response(request: Request): Promise<Response> {
  return new Response('404 Not Found', {status: 404})
}

const handler: ExportedHandler = {
  async fetch(request: Request): Promise<Response> {
    let url = new URL(request.url);
    const hostname_handler = hostname_mapping.get(url.hostname) || default_response;
    return hostname_handler(request);
  },
};

export default handler;