import resolveUrl from './resolve-url';

export default function resolveBadgeUrl(url, baseUrl, options) {
  const { longCache, style, queryParams: inQueryParams } = options || {};
  const outQueryParams = Object.assign({}, inQueryParams);
  if (longCache) {
    outQueryParams.maxAge = '2592000';
  }
  if (style) {
    outQueryParams.style = style;
  }
  return resolveUrl(url, baseUrl, outQueryParams);
}

export function encodeField(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
}

export function staticBadgeUrl(baseUrl, subject, status, color, options) {
  const path = [subject, status, color].map(encodeField).join('-');
  return resolveUrl(`/badge/${path}.svg`, baseUrl, options);
}

// Options can include: { prefix, suffix, color, longCache, style, queryParams }
export function dynamicBadgeUrl(baseUrl, datatype, label, dataUrl, query, options = {}) {
  const { prefix, suffix, color, queryParams = {}, ...rest } = options;

  Object.assign(queryParams, {
    label,
    url: dataUrl,
    query,
  });

  if (color) {
    queryParams.colorB = color;
  }
  if (prefix) {
    queryParams.prefix = prefix;
  }
  if (suffix) {
    queryParams.suffix = suffix;
  }

  const outOptions = Object.assign({ queryParams }, rest);

  return resolveBadgeUrl(`/badge/dynamic/${datatype}.svg`, baseUrl, outOptions);
}
