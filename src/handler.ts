import config from './config';
import { changeUrl, withCors } from './util';


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
  return new Response('404 Not Found', {status: 404});
}

async function handleGithubRequest(request: Request, env?: { GITHUB_TOKEN?: string }): Promise<Response> {
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
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Cloudflare-Workers/1.20230601.0',
    'Accept-Language': 'en-US,en;q=0.9',
    ...(referer ? { 'Referer': referer } : {})
  };
  if (env && env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${env.GITHUB_TOKEN}`;
  }
  const apiResp = await fetch(apiUrl, {
    headers,
    // Cloudflare cache for 6h
    cf: { cacheTtl: 21600, cacheEverything: false },
  } as any);
  if (!apiResp.ok) {
    return withCors(apiResp);
  }
  const data = await apiResp.json();
  if (data.state === 'open') {
    // SVG for minus sign
    const minusSvg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"5\" y=\"11\" width=\"14\" height=\"2\" rx=\"1\" fill=\"#888\"/></svg>`;
    const headers = new Headers({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=60',
    });
    return withCors(new Response(minusSvg, { status: 200, headers }));
  } else if (data.state === 'closed') {
    // SVG for plus sign
    const plusSvg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"11\" y=\"5\" width=\"2\" height=\"14\" rx=\"1\" fill=\"#4caf50\"/><rect x=\"5\" y=\"11\" width=\"14\" height=\"2\" rx=\"1\" fill=\"#4caf50\"/></svg>`;
    const headers = new Headers({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=60',
    });
    return withCors(new Response(plusSvg, { status: 200, headers }));
  } else {
    // SVG for question mark
    const questionSvg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"#ffc107\"/><text x=\"12\" y=\"17\" text-anchor=\"middle\" font-size=\"14\" fill=\"#fff\" font-family=\"Arial, sans-serif\">?</text></svg>`;
    const headers = new Headers({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=60',
    });
    return withCors(new Response(questionSvg, { status: 200, headers }));
  }
}

const hostname_mapping = new Map([
  ['blog-redirect.ydb.tech', handleBlogRedirectRequest],
  ['install.ydb.tech', handleInstallRequest],
  ['github.ydb.tech', handleGithubRequest],
]);

async function default_response(request: Request): Promise<Response> {
  return withCors(new Response('404 Not Found', {status: 404}));
}

const handler = {
  async fetch(request: Request, env?: { GITHUB_TOKEN?: string }): Promise<Response> {
    let url = new URL(request.url);
    const hostname_handler = hostname_mapping.get(url.hostname) || default_response;
    // Pass env to handler if it accepts it
    if (hostname_handler === handleGithubRequest) {
      return handleGithubRequest(request, env);
    }
    return hostname_handler(request);
  },
};

export default handler;
