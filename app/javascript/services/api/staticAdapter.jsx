/**
 * Axios adapter for the standalone (self-contained HTML) build.
 *
 * Instead of hitting the network, it resolves every request the public crosswalk view makes
 * from the data embedded in `window.__DESM_STATIC__`, returning an axios-shaped response so
 * `apiRequest` (and everything downstream) runs byte-identical to the live app.
 *
 * The embedded data is the raw (snake_case) serializer output -- `apiRequest` camelizes it
 * downstream -- keyed to match the five endpoints the view loads:
 *   { domains, predicates, specificationsByDomain, spineTerms, alignments }
 */

const ok = (config, data) =>
  Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config,
    request: {},
  });

const SPINE_TERMS = /^\/api\/v1\/spines\/(\d+)\/terms$/;

const staticAdapter = (config) => {
  const data = window.__DESM_STATIC__ || {};
  // apiRequest appends the query string to the url, so parse path + params off it.
  const [path, search = ''] = (config.url || '').split('?');
  const params = new URLSearchParams(search);

  if (path === '/api/v1/domains') return ok(config, data.domains || []);
  if (path === '/api/v1/predicates') return ok(config, data.predicates || []);

  if (path === '/api/v1/specifications') {
    const domainId = params.get('domain_id');
    return ok(config, (data.specificationsByDomain || {})[domainId] || []);
  }

  const spineMatch = path.match(SPINE_TERMS);
  if (spineMatch) {
    return ok(config, (data.spineTerms || {})[spineMatch[1]] || []);
  }

  if (path === '/api/v1/alignments') {
    const spineId = params.get('spine_id');
    return ok(config, (data.alignments || {})[spineId] || []);
  }

  // Anything the standalone view doesn't need resolves empty rather than erroring.
  return ok(config, []);
};

export default staticAdapter;
