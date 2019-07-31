export function bareLink(badgeUrl: string, link?: string, title = '') {
  return badgeUrl
}

export function html(badgeUrl: string, link?: string, title?: string) {
  // To be more robust, this should escape the title.
  const alt = title ? ` alt="${title}"` : ''
  const img = `<img${alt} src="${badgeUrl}">`
  if (link) {
    return `<a href="${link}">${img}</a>`
  } else {
    return img
  }
}

export function markdown(badgeUrl: string, link?: string, title?: string) {
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
) {
  let result = `.. image:: ${badgeUrl}`
  if (title) {
    result += `   :alt: ${title}`
  }
  if (link) {
    result += `   :target: ${link}`
  }
  return result
}

function quoteAsciiDocAttribute(attr: string | null) {
  if (attr == null) {
    return 'None'
  } else {
    const withQuotesEscaped = attr.replace(/"/g, '\\"')
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
) {
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

export function asciiDoc(badgeUrl: string, link?: string, title?: string) {
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
}) {
  const generatorFn = {
    markdown,
    rst: reStructuredText,
    asciidoc: asciiDoc,
    link: bareLink,
    html,
  }[markupFormat]
  return generatorFn(badgeUrl, link, title)
}
