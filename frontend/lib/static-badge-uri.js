import URLPath from 'url-path';

export function encodeField(s) {
  return encodeURIComponent(s.replace(/-/g, '--').replace(/_/g, '__'));
}

export default function staticBadgeUri(baseUri, subject, status, color, options) {
  const path = [subject, status, color].map(encodeField).join('-');
  const uri = new URLPath(`/badge/${path}.svg`, baseUri);
  Object.keys(options || {}).forEach(k => {
    uri.searchParams.set(k, options[k]);
  })
  return uri.href;
}
