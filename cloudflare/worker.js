addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  let response;

  switch (url.pathname) {
    case '/':
      response = Response.redirect('/docs', 301);
      break;
    case '/api/titles':
      response = await fetchTitles(request);
      break;
    case '/api/page':
      response = await fetchPage(request);
      break;
    case '/docs':
      // Cloudflare Workers do not natively support serving OpenAPI documentation like FastAPI.
      // You would need to serve static HTML or redirect to an external documentation site.
      response = new Response('API documentation not directly supported in Cloudflare Workers.', { status: 200 });
      break;
    default:
      response = new Response('Not Found', { status: 404 });
  }

  return response;
}

async function fetchTitles(request) {
  const query = new URL(request.url).searchParams.get('q');
  const url = generateTitlesURL(query);
  const apiResponse = await fetch(url);
  const data = await apiResponse.json();
  const pages = Object.values(data.query.pages).sort((a, b) => a.index - b.index);
  return new Response(JSON.stringify({ pages }), { headers: { 'Content-Type': 'application/json' } });
}

async function fetchPage(request) {
  const pageid = new URL(request.url).searchParams.get('pageid');
  const url = generatePageURL(pageid);
  const apiResponse = await fetch(url);
  const data = await apiResponse.json();
  return new Response(JSON.stringify(data.query.pages[pageid]), { headers: { 'Content-Type': 'application/json' } });
}

function generateTitlesURL(query) {
  return `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=8&gsrsearch=${query}&format=json`;
}

function generatePageURL(pageId) {
  return `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&pageids=${pageId}&format=json&explaintext=true`;
}

export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request);
  },
};
