export function bareLink(badgeUrl: string, link?: string, title = ''): string {
  return badgeUrl
}

export function html(badgeUrl: string, link?: string, title?: string): string {
  // To be more robust, this should escape the title.
  const alt = title ? ` alt="${title}"` : ''
  const img = `<img${alt} src="${badgeUrl}">`
  if (link) {
    return `<a href="${link}">${img}</a>`
  } else {
    return img
  }
}

export function markdown(
  badgeUrl: string,
  link?: string,
  title?: string
): string {
  const withoutLink = `![${title || ''}](${badgeUrl})`
  if (link) {
    return `[${withoutLink}](${link})`
  } else {
    return withoutLink
  }
}

export function reStructuredText(
  badgeUrl: string,
  link?: string,
  title?: string
): string {
  let result = `.. image:: ${badgeUrl}`
  if (title) {
    result += `   :alt: ${title}`
  }
  if (link) {
    result += `   :target: ${link}`
  }
  return result
}

function quoteAsciiDocAttribute(attr: string | null): string {
  if (attr == null) {
    return 'None'
  } else {
    // String values are prepared and returned to users who want to include their badge
    // in an AsciiDoc document. We're not using the value in any actual processing, so
    // no need to perform proper sanitization. We simply escape quotes, as mandated by
    // http://asciidoc.org/userguide.html#X21
    const withQuotesEscaped = attr.replace(/"/g, '\\"') // lgtm [js/incomplete-sanitization]
    return `"${withQuotesEscaped}"`
  }
}

// lodash.mapvalues is huge!
function mapValues(
  obj: { [k: string]: string | null },
  iteratee: (value: string | null) => string
): { [k: string]: string } {
  const result = {} as { [k: string]: string }
  for (const k in obj) {
    result[k] = iteratee(obj[k])
  }
  return result
}

export function renderAsciiDocAttributes(
  positional: string[],
  named: { [k: string]: string | null }
): string {
  // http://asciidoc.org/userguide.html#X21
  const needsQuoting =
    positional.some(attr => attr && attr.includes(',')) ||
    Object.keys(named).length > 0

  if (needsQuoting) {
    positional = positional.map(attr => quoteAsciiDocAttribute(attr))
    named = mapValues(named, attr => quoteAsciiDocAttribute(attr))
  }

  const items = positional.concat(
    Object.entries(named).map(([k, v]) => `${k}=${v}`)
  )

  if (items.length) {
    return `[${items.join(',')}]`
  } else {
    return '[]'
  }
}

export function asciiDoc(
  badgeUrl: string,
  link?: string,
  title?: string
): string {
  const positional = title ? [title] : []
  const named = link ? { link } : ({} as { [k: string]: string })
  const attrs = renderAsciiDocAttributes(positional, named)
  return `image:${badgeUrl}${attrs}`
}

export type MarkupFormat = 'markdown' | 'rst' | 'asciidoc' | 'link' | 'html'

export function generateMarkup({
  badgeUrl,
  link,
  title,
  markupFormat,
}: {
  badgeUrl: string
  link?: string
  title?: string
  markupFormat: MarkupFormat
}): string {
  const generatorFn = {
    markdown,
    rst: reStructuredText,
    asciidoc: asciiDoc,
    link: bareLink,
    html,
  }[markupFormat]
  return generatorFn(badgeUrl, link, title)
}
