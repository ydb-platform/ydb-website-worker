import config from './config';
import { changeUrl } from './util';


async function handleBlogRedirectRequest(request: Request): Promise<Response> {
  // @ts-ignore: Cloudflare Workers may provide cf property
  const country = (request as any).cf?.country;
  if (country === 'RU') {
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
  else if (requested_url.pathname == '/dstool-windows' || requested_url.pathname == '/dstool-win') {
    return fetch(changeUrl(request, config.install_sh_location.dstool_win));
  }
  return new Response('404 Not Found', {status: 404})
}

async function handleGithubRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/issues\/([^\/]+)\/(\d+)$/);
  if (!match) {
    return new Response('404 Not Found', { status: 404 });
  }
  const repo = match[1];
  const issueId = match[2];
  const apiUrl = `https://api.github.com/repos/ydb-platform/${repo}/issues/${issueId}`;
  const incomingHeaders = request.headers;
  const referer = incomingHeaders.get('referer') || undefined;
  const apiResp = await fetch(apiUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Cloudflare-Workers/1.20230601.0',
      'Accept-Language': 'en-US,en;q=0.9',
      ...(referer ? { 'Referer': referer } : {})
    }
  });
  if (!apiResp.ok) {
    return new Response('404 Not Found', { status: 404 });
  }
  const data = await apiResp.json();
  if (data.state === 'open') {
    return new Response('-', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } else if (data.state === 'closed') {
    return new Response('+', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  } else {
    return new Response('?', { status: 200, headers: { 'Content-Type': 'text/plain' } });
  }
}

const hostname_mapping = new Map([
  ['blog-redirect.ydb.tech', handleBlogRedirectRequest],
  ['install.ydb.tech', handleInstallRequest],
  ['github.ydb.tech', handleGithubRequest],
]);

async function default_response(request: Request): Promise<Response> {
  return new Response('404 Not Found', {status: 404})
}

const handler = {
  async fetch(request: Request): Promise<Response> {
    let url = new URL(request.url);
    const hostname_handler = hostname_mapping.get(url.hostname) || default_response;
    return hostname_handler(request);
  },
};

export default handler;
