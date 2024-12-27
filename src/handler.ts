import config from './config';
import { changeUrl } from './util';


async function handleBlogRedirectRequest(request: Request): Promise<Response> {
  if (request.cf.country === 'RU') {
    return Response.redirect(config.blog_location.ru, 307);
  } else {
    return Response.redirect(config.blog_location.en, 307);
  }
}

async function handleInstallRequest(request: Request): Promise<Response> {
  let requested_url = new URL(request.url);
  if (requested_url.pathname == '/') {
    return fetch(changeUrl(request, config.install_sh_location.server));
  } 
  else if (requested_url.pathname == '/cli') {
    return fetch(changeUrl(request, config.install_sh_location.cli));
  }
  else if (requested_url.pathname == '/cli-windows' || requested_url.pathname == '/cli-win') {
    return fetch(changeUrl(request, config.install_sh_location.cli_win));
  }
  else if (requested_url.pathname == '/dstool') {
    return fetch(changeUrl(request, config.install_sh_location.dstool));
  }
  return new Response('404 Not Found', {status: 404})
}

const hostname_mapping = new Map([
  ['blog-redirect.ydb.tech', handleBlogRedirectRequest],
  ['install.ydb.tech', handleInstallRequest],
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
