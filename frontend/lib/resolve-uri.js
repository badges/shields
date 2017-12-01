import URLPath from 'url-path';

export default function resolveUri (uri, baseUri, options) {
  const { longCache } = options || {};
  const result = new URLPath(uri, baseUri);
  if (longCache) {
    result.searchParams.set('maxAge', '2592000');
  }
  return result.href;
}
