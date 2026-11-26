/**
 * Geary MCP Worker — read-only Streamable HTTP (JSON-RPC 2.0) endpoint.
 *
 * Serves the four handbook tools from the static `/corpus.json` build artifact
 * (`SW-INT-05`/`SW-INT-06`). No auth, no state, no site-code imports.
 * Deploy: `bunx wrangler deploy` from `mcp/` (see README § MCP server).
 */

import {
  getArticle,
  getFreshness,
  listCategories,
  searchArticles,
  type Corpus,
} from './corpus';

const PROTOCOL_VERSION = '2025-06-18';
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  '2025-06-18',
  '2025-03-26',
  '2024-11-05',
]);
const SERVER_INFO = { name: 'geary-mcp', version: '0.1.0' };
const DEFAULT_SITE_URL = 'https://geary.bulsu.tools';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version, Mcp-Session-Id',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function rpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

function rpcResult(id: unknown, result: unknown) {
  return { jsonrpc: '2.0', id, result };
}

function toolResult(data: unknown, isError = false) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    ...(isError ? { isError: true } : {}),
  };
}

function toolError(message: string) {
  return toolResult({ error: message }, true);
}

const TOOL_DEFINITIONS = (categorySlugs: string[]) => [
  {
    name: 'search_articles',
    description:
      'Search Geary handbook articles by keyword across title, subcategory, preview, and full Markdown body. Returns ranked slug/title/preview matches.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search keywords (multi-term supported).' },
        category: {
          type: 'string',
          enum: categorySlugs,
          description: 'Optional category slug filter.',
        },
      },
      required: ['query'],
      additionalProperties: false,
    },
  },
  {
    name: 'get_article',
    description:
      'Get one handbook article by slug. Returns the complete source Markdown (frontmatter + body) byte-identical to the repo file, plus parsed frontmatter fields.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'Article slug, e.g. "how-to-transfer-to-bulsu".' },
      },
      required: ['slug'],
      additionalProperties: false,
    },
  },
  {
    name: 'list_categories',
    description:
      'List the 7 Geary categories as a tree of subcategories with their article slugs and titles, for content discovery.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
  {
    name: 'get_freshness',
    description:
      'Get the oldest updatedDate per category so agents can warn users about potentially stale handbook information.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  },
];

const KNOWN_TOOLS = new Set([
  'search_articles',
  'get_article',
  'list_categories',
  'get_freshness',
]);

function callTool(name: string, args: Record<string, unknown>, corpus: Corpus) {
  const categorySlugs = corpus.categories.map((c) => c.slug);

  switch (name) {
    case 'search_articles': {
      const query = args.query;
      if (typeof query !== 'string' || query.trim().length === 0) {
        return toolError('"query" must be a non-empty string.');
      }
      const category = args.category;
      if (category !== undefined) {
        if (typeof category !== 'string' || !categorySlugs.includes(category)) {
          return toolError(
            `Unknown category "${String(category)}". Valid categories: ${categorySlugs.join(', ')}.`,
          );
        }
      }
      const results = searchArticles(corpus, query, category as string | undefined);
      return results.length === 0
        ? toolResult({ results: [], note: 'No articles matched. Try list_categories or a broader query.' })
        : toolResult({ results });
    }
    case 'get_article': {
      const slug = args.slug;
      if (typeof slug !== 'string' || slug.trim().length === 0) {
        return toolError('"slug" must be a non-empty string.');
      }
      const article = getArticle(corpus, slug.trim());
      if (!article) {
        return toolError(
          `Unknown article slug "${slug}". Use search_articles or list_categories to discover valid slugs.`,
        );
      }
      return toolResult({
        slug: article.slug,
        frontmatter: {
          title: article.title,
          category: article.category,
          categoryLabel: article.categoryLabel,
          subcategory: article.subcategory,
          updatedDate: article.updatedDate,
          sources: article.sources,
        },
        markdown: article.content,
      });
    }
    case 'list_categories':
      return toolResult({ categories: listCategories(corpus) });
    case 'get_freshness':
      return toolResult({ freshness: getFreshness(corpus) });
    default:
      return toolError(`Unknown tool "${name}".`);
  }
}

/**
 * Dispatch one JSON-RPC message against the corpus.
 * Returns the response object, or `null` for notifications (no `id`).
 */
export function handleJsonRpc(message: unknown, corpus: Corpus): Record<string, unknown> | null {
  const hasId =
    typeof message === 'object' &&
    message !== null &&
    'id' in message &&
    (message as { id: unknown }).id !== undefined;
  const id = hasId ? (message as { id: unknown }).id : null;

  if (typeof message !== 'object' || message === null) {
    return hasId ? rpcError(id, -32600, 'Invalid Request') : null;
  }
  const msg = message as Record<string, unknown>;
  if (msg.jsonrpc !== '2.0' || typeof msg.method !== 'string') {
    return hasId ? rpcError(id, -32600, 'Invalid Request') : null;
  }

  // Notifications never produce a response.
  if (!hasId) return null;

  switch (msg.method) {
    case 'initialize': {
      const params = msg.params as { protocolVersion?: unknown } | undefined;
      const requested =
        typeof params?.protocolVersion === 'string' ? params.protocolVersion : '';
      return rpcResult(id, {
        protocolVersion: SUPPORTED_PROTOCOL_VERSIONS.has(requested)
          ? requested
          : PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
      });
    }
    case 'ping':
      return rpcResult(id, {});
    case 'tools/list':
      return rpcResult(id, {
        tools: TOOL_DEFINITIONS(corpus.categories.map((c) => c.slug)),
      });
    case 'tools/call': {
      const params = msg.params as
        | { name?: unknown; arguments?: unknown }
        | undefined;
      if (typeof params?.name !== 'string') {
        return rpcError(id, -32602, 'Invalid params: "name" is required.');
      }
      const args =
        typeof params.arguments === 'object' && params.arguments !== null
          ? (params.arguments as Record<string, unknown>)
          : {};
      if (!KNOWN_TOOLS.has(params.name)) {
        return rpcError(id, -32602, `Unknown tool: ${params.name}`);
      }
      return rpcResult(id, callTool(params.name, args, corpus));
    }
    default:
      if (msg.method.startsWith('notifications/')) return null;
      return rpcError(id, -32601, `Method not found: ${msg.method}`);
  }
}

interface Env {
  SITE_URL?: string;
  CORPUS_URL?: string;
}

function corpusUrl(env: Env): string {
  if (env.CORPUS_URL) return env.CORPUS_URL;
  const site = (env.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '');
  return `${site}/corpus.json`;
}

let corpusPromise: Promise<Corpus> | null = null;

function loadCorpus(env: Env): Promise<Corpus> {
  corpusPromise ??= fetch(corpusUrl(env))
    .then(async (res) => {
      if (!res.ok) throw new Error(`corpus fetch failed: HTTP ${res.status}`);
      return (await res.json()) as Corpus;
    })
    .catch((err) => {
      corpusPromise = null; // allow retry on next request
      throw err;
    });
  return corpusPromise;
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (request.method === 'GET' || request.method === 'DELETE') {
    return json(
      rpcError(null, -32601, 'This MCP endpoint only accepts POST requests.'),
      405,
    );
  }
  if (request.method !== 'POST') {
    return json(rpcError(null, -32600, 'Method not allowed.'), 405);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json(rpcError(null, -32700, 'Parse error: body is not valid JSON.'));
  }
  if (Array.isArray(payload)) {
    return json(rpcError(null, -32600, 'Batch requests are not supported.'));
  }

  let corpus: Corpus;
  try {
    corpus = await loadCorpus(env);
  } catch (err) {
    return json(
      rpcError(
        null,
        -32603,
        `Corpus unavailable: ${err instanceof Error ? err.message : String(err)}`,
      ),
      503,
    );
  }

  const response = handleJsonRpc(payload, corpus);
  if (response === null) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }
  return json(response);
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};
