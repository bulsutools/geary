/// <reference types="bun" />
import { describe, expect, test } from 'bun:test';
import {
  getArticle,
  getFreshness,
  listCategories,
  searchArticles,
  type Corpus,
} from '../../mcp/corpus';
import { handleJsonRpc } from '../../mcp/worker';

const CORPUS: Corpus = {
  categories: [
    { slug: 'enrollment', title: 'Enrollment', description: 'd', order: 1 },
    { slug: 'documents', title: 'Documents', description: 'd', order: 2 },
  ],
  articles: [
    {
      slug: 'how-to-request-transcript',
      title: 'How to Request a Transcript of Records (TOR)',
      category: 'documents',
      categoryLabel: 'Documents',
      subcategory: 'Academic Records',
      updatedDate: '2026-01-10',
      preview: 'TOR request steps at the Registrar.',
      sources: [{ label: 'Registrar Office' }],
      content:
        '---\ntitle: "How to Request a Transcript of Records (TOR)"\ncategory: "documents"\n---\n\n# TOR Steps\n\nBring a valid ID to the Registrar window.\n',
    },
    {
      slug: 'how-to-transfer-to-bulsu',
      title: 'How to Transfer to BulSU',
      category: 'enrollment',
      categoryLabel: 'Enrollment',
      subcategory: 'Shifting & Transferring',
      updatedDate: '2026-03-01',
      preview: 'Transferee requirements and portals.',
      sources: [],
      content:
        '---\ntitle: "How to Transfer to BulSU"\ncategory: "enrollment"\n---\n\n# Transfer Steps\n\nSubmit form 137 and transcript of records.\n',
    },
    {
      slug: 'lost-student-id',
      title: 'How to Replace a Lost Student ID',
      category: 'documents',
      categoryLabel: 'Documents',
      subcategory: 'IDs & Clearances',
      updatedDate: '2025-12-01',
      preview: 'ID replacement affidavit steps.',
      sources: [],
      content: '---\ntitle: "Lost ID"\n---\n\n# ID Replacement\n\nFile an affidavit at the OSFS.\n',
    },
  ],
};

function rpc(method: string, params?: unknown, id: unknown = 1) {
  return handleJsonRpc({ jsonrpc: '2.0', id, method, params }, CORPUS) as {
    result?: { content?: Array<{ text: string }>; isError?: boolean; tools?: unknown[] };
    error?: { code: number; message: string };
  };
}

function toolPayload(res: ReturnType<typeof rpc>) {
  return JSON.parse(res.result!.content![0].text);
}

describe('mcp corpus tools', () => {
  test('search_articles ranks title matches and filters by category', () => {
    const all = searchArticles(CORPUS, 'transcript');
    expect(all.map((r) => r.slug)).toContain('how-to-request-transcript');
    expect(all[0].slug).toBe('how-to-request-transcript');

    const filtered = searchArticles(CORPUS, 'transcript', 'enrollment');
    expect(filtered.map((r) => r.slug)).toEqual(['how-to-transfer-to-bulsu']);
  });

  test('search_articles matches body text and special characters literally', () => {
    const results = searchArticles(CORPUS, 'form 137');
    expect(results[0].slug).toBe('how-to-transfer-to-bulsu');
    expect(searchArticles(CORPUS, '[INC]*')).toEqual([]);
    expect(searchArticles(CORPUS, '   ')).toEqual([]);
  });

  test('get_article returns verbatim content; misses return undefined', () => {
    const hit = getArticle(CORPUS, 'lost-student-id');
    expect(hit?.content).toContain('File an affidavit');
    expect(getArticle(CORPUS, 'nope')).toBeUndefined();
  });

  test('list_categories builds subcategory tree with counts', () => {
    const tree = listCategories(CORPUS);
    expect(tree).toHaveLength(2);
    const docs = tree.find((c) => c.slug === 'documents')!;
    expect(docs.articleCount).toBe(2);
    expect(docs.subcategories.map((s) => s.name)).toEqual([
      'Academic Records',
      'IDs & Clearances',
    ]);
  });

  test('get_freshness returns oldest updatedDate per category', () => {
    const freshness = getFreshness(CORPUS);
    expect(freshness.find((f) => f.category === 'documents')?.oldestUpdatedDate).toBe(
      '2025-12-01',
    );
    expect(freshness.find((f) => f.category === 'enrollment')?.oldestUpdatedDate).toBe(
      '2026-03-01',
    );
  });
});

describe('mcp JSON-RPC dispatch', () => {
  test('initialize negotiates protocol version', () => {
    const res = rpc('initialize', { protocolVersion: '2025-03-26' });
    expect(res.result).toMatchObject({
      protocolVersion: '2025-03-26',
      serverInfo: { name: 'geary-mcp' },
    });
    const fallback = rpc('initialize', { protocolVersion: '1999-01-01' });
    expect((fallback.result as { protocolVersion: string }).protocolVersion).toBe(
      '2025-06-18',
    );
  });

  test('tools/list exposes the four read-only tools', () => {
    const res = rpc('tools/list');
    const tools = res.result!.tools as Array<{ name: string }>;
    expect(tools.map((t) => t.name).sort()).toEqual([
      'get_article',
      'get_freshness',
      'list_categories',
      'search_articles',
    ]);
  });

  test('tools/call get_article returns verbatim markdown', () => {
    const res = rpc('tools/call', {
      name: 'get_article',
      arguments: { slug: 'how-to-request-transcript' },
    });
    const payload = toolPayload(res);
    expect(payload.markdown).toBe(CORPUS.articles[0].content);
    expect(payload.frontmatter.title).toBe(CORPUS.articles[0].title);
  });

  test('tools/call get_article unknown slug errors cleanly', () => {
    const res = rpc('tools/call', {
      name: 'get_article',
      arguments: { slug: 'does-not-exist' },
    });
    expect(res.result!.isError).toBe(true);
    expect(res.result!.content![0].text).toContain('does-not-exist');
  });

  test('tools/call search_articles honors category filter and rejects bad category', () => {
    const ok = rpc('tools/call', {
      name: 'search_articles',
      arguments: { query: 'transcript', category: 'documents' },
    });
    expect(toolPayload(ok).results).toHaveLength(1);

    const bad = rpc('tools/call', {
      name: 'search_articles',
      arguments: { query: 'x', category: 'bogus' },
    });
    expect(bad.result!.isError).toBe(true);
    expect(bad.result!.content![0].text).toContain('bogus');
  });

  test('tools/call list_categories and get_freshness', () => {
    const cats = rpc('tools/call', { name: 'list_categories' });
    expect(toolPayload(cats).categories).toHaveLength(2);
    const fresh = rpc('tools/call', { name: 'get_freshness' });
    expect(toolPayload(fresh).freshness).toHaveLength(2);
  });

  test('protocol errors: unknown method, unknown tool, missing params, notification', () => {
    expect(rpc('bogus/method').error?.code).toBe(-32601);
    expect(
      rpc('tools/call', { name: 'nope' }).error?.code,
    ).toBe(-32602);
    expect(
      rpc('tools/call', { arguments: {} }).error?.code,
    ).toBe(-32602);
    // Notifications (no id) produce no response.
    expect(
      handleJsonRpc({ jsonrpc: '2.0', method: 'notifications/initialized' }, CORPUS),
    ).toBeNull();
    expect(handleJsonRpc(null, CORPUS)).toBeNull();
    expect(handleJsonRpc('garbage', CORPUS)).toBeNull();
  });
});
