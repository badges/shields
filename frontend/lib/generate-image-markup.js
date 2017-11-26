export function markdown(badgeUri, link, title) {
  const withoutLink = `![${title || ''}](${badgeUri})`;
  if (link) {
    return `[${withoutLink}](${link})`;
  } else {
    return withoutLink;
  }
}

export function reStructuredText(badgeUri, link, title) {
  let result = `.. image:: ${badgeUri}`;
  if (title) {
    result += `   :alt: ${title}`;
  }
  if (link) {
    result += `   :target: ${link}`;
  }
  return result;
}

function quoteAsciiDocAttribute(attr) {
  if (typeof attr === 'string') {
    const withQuotesEscaped = attr.replace('"', '\\"');
    return `"${withQuotesEscaped}"`;
  } else if (attr == null) {
    return 'None';
  } else {
    return attr;
  }
}

// lodash.mapvalues is huge!
function mapValues(obj, iteratee) {
  const result = {};
  for (const k in obj) {
    result[k] = iteratee(obj[k]);
  }
  return result;
}

export function renderAsciiDocAttributes(positional, named) {
  // http://asciidoc.org/userguide.html#X21
  const needsQuoting = positional.some(attr => attr.includes(',')) ||
    Object.keys(named).length > 0;

  if (needsQuoting) {
    positional = positional.map(attr => quoteAsciiDocAttribute(attr));
    named = mapValues(named, attr => quoteAsciiDocAttribute(attr));
  }

  const items = positional
    .concat(Object.entries(named).map(([k, v]) => `${k}=${v}`));

  if (items.length) {
    return `[${items.join(',')}]`;
  } else {
    return '';
  }
}

export function asciiDoc(badgeUri, link, title) {
  const positional = title ? [title] : [];
  const named = link ? { link } : {};
  const attrs = renderAsciiDocAttributes(positional, named);
  return `image:${badgeUri}${attrs}`;
}

export default function generateAllMarkup(badgeUri, link, title) {
  // This is a wee bit "clever". It runs each of the three functions on the
  // parameters provided, and returns the result in an object.
  return mapValues(
    { markdown, reStructuredText, asciiDoc },
    fn => fn(badgeUri, link, title));
}
