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
