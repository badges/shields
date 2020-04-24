'use strict'

const anafanafo = require('anafanafo')

const fontFamily = 'font-family="DejaVu Sans,Verdana,Geneva,sans-serif"'
const socialFontFamily =
  'font-family="Helvetica Neue,Helvetica,Arial,sans-serif"'

function capitalize(s) {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`
}

function escapeXml(s) {
  if (s === undefined || typeof s !== 'string') {
    return undefined
  } else {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }
}

function roundUpToOdd(val) {
  // Increase chances of pixel grid alignment.
  return val % 2 === 0 ? val + 1 : val
}

function preferredWidthOf(str) {
  return roundUpToOdd((anafanafo(str) / 10) | 0)
}

function computeWidths({ label, message }) {
  return {
    labelWidth: preferredWidthOf(label),
    messageWidth: preferredWidthOf(message),
  }
}

function renderLogo({
  logo,
  badgeHeight,
  horizPadding,
  logoWidth = 14,
  logoPadding = 0,
}) {
  if (!logo) {
    return {
      hasLogo: false,
      totalLogoWidth: 0,
      renderedLogo: '',
    }
  }
  const logoHeight = 14
  const y = (badgeHeight - logoHeight) / 2
  const x = horizPadding
  return {
    hasLogo: true,
    totalLogoWidth: logoWidth + logoPadding,
    renderedLogo: `<image x="${x}" y="${y}" width="${logoWidth}" height="14" xlink:href="${escapeXml(
      logo
    )}"/>`,
  }
}

function renderText({
  leftMargin,
  horizPadding = 0,
  content,
  verticalMargin = 0,
  shadow = false,
}) {
  if (!content.length) {
    return { renderedText: '', width: 0 }
  }

  const textLength = preferredWidthOf(content)
  const escapedContent = escapeXml(content)

  const shadowMargin = 150 + verticalMargin
  const textMargin = 140 + verticalMargin

  const outTextLength = 10 * textLength
  const x = 10 * (leftMargin + 0.5 * textLength + horizPadding)

  let renderedText = ''
  if (shadow) {
    renderedText = `<text x="${x}" y="${shadowMargin}" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${outTextLength}">${escapedContent}</text>`
  }
  renderedText += `<text x="${x}" y="${textMargin}" transform="scale(.1)" textLength="${outTextLength}">${escapedContent}</text>`

  return {
    renderedText,
    width: textLength,
  }
}

function renderLinks({
  links: [leftLink, rightLink] = [],
  labelWidth,
  messageWidth,
  height,
}) {
  leftLink = escapeXml(leftLink)
  rightLink = escapeXml(rightLink)
  const hasLeftLink = leftLink && leftLink.length
  const hasRightLink = rightLink && rightLink.length
  const leftLinkWidth = hasRightLink ? labelWidth : labelWidth + messageWidth

  function render({ link, width }) {
    return `<a target="_blank" xlink:href="${link}"><rect width="${width}" height="${height}" fill="rgba(0,0,0,0)"/></a>`
  }

  return (
    (hasRightLink
      ? render({ link: rightLink, width: labelWidth + messageWidth })
      : '') +
    (hasLeftLink ? render({ link: leftLink, width: leftLinkWidth }) : '')
  )
}

function renderBadge({ links, leftWidth, rightWidth, height }, main) {
  const width = leftWidth + rightWidth
  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">
    ${main}
    ${renderLinks({ links, leftWidth, rightWidth, height })}
    </svg>`
}

function stripXmlWhitespace(xml) {
  return xml
    .replace(/>\s+/g, '>')
    .replace(/<\s+/g, '<')
    .trim()
}

class Badge {
  static get fontFamily() {
    throw new Error('Not implemented')
  }

  static get height() {
    throw new Error('Not implemented')
  }

  static get verticalMargin() {
    throw new Error('Not implemented')
  }

  static get shadow() {
    throw new Error('Not implemented')
  }

  constructor({
    label,
    message,
    links,
    logo,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor,
  }) {
    const horizPadding = 5
    const { hasLogo, totalLogoWidth, renderedLogo } = renderLogo({
      logo,
      badgeHeight: this.constructor.height,
      horizPadding,
      logoWidth,
      logoPadding,
    })
    const hasLabel = label.length || labelColor
    if (labelColor == null) {
      labelColor = '#555'
    }

    labelColor = hasLabel || hasLogo ? labelColor : color
    labelColor = escapeXml(labelColor)
    color = escapeXml(color)

    const labelMargin = totalLogoWidth + 1

    const { renderedText: renderedLabel, width: labelWidth } = renderText({
      leftMargin: labelMargin,
      horizPadding,
      content: label,
      verticalMargin: this.constructor.verticalMargin,
      shadow: this.constructor.shadow,
    })

    const leftWidth = hasLabel
      ? labelWidth + 2 * horizPadding + totalLogoWidth
      : 0

    let messageMargin = leftWidth - (message.length ? 1 : 0)
    if (!hasLabel) {
      if (hasLogo) {
        messageMargin = messageMargin + totalLogoWidth + horizPadding
      } else {
        messageMargin = messageMargin + 1
      }
    }

    const { renderedText: renderedMessage, width: messageWidth } = renderText({
      leftMargin: messageMargin,
      horizPadding,
      content: message,
      verticalMargin: this.constructor.verticalMargin,
      shadow: this.constructor.shadow,
    })

    let rightWidth = messageWidth + 2 * horizPadding
    if (hasLogo && !hasLabel) {
      rightWidth += totalLogoWidth + horizPadding - 1
    }

    const width = leftWidth + rightWidth

    this.links = links
    this.leftWidth = leftWidth
    this.rightWidth = rightWidth
    this.width = width
    this.labelColor = labelColor
    this.color = color
    this.renderedLogo = renderedLogo
    this.renderedLabel = renderedLabel
    this.renderedMessage = renderedMessage
  }

  render() {
    throw new Error('Not implemented')
  }
}

class Plastic extends Badge {
  static get fontFamily() {
    return fontFamily
  }

  static get height() {
    return 18
  }

  static get verticalMargin() {
    return -10
  }

  static get shadow() {
    return true
  }

  render() {
    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        height: this.constructor.height,
      },
      `
      <linearGradient id="s" x2="0" y2="100%">
        <stop offset="0"  stop-color="#fff" stop-opacity=".7"/>
        <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
        <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
        <stop offset="1"  stop-color="#000" stop-opacity=".5"/>
      </linearGradient>

      <clipPath id="r">
        <rect width="${this.width}" height="${this.constructor.height}" rx="4" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#r)">
        <rect width="${this.leftWidth}" height="${this.constructor.height}" fill="${this.labelColor}"/>
        <rect x="${this.leftWidth}" width="${this.rightWidth}" height="${this.constructor.height}" fill="${this.color}"/>
        <rect width="${this.width}" height="${this.constructor.height}" fill="url(#s)"/>
      </g>

      <g fill="#fff" text-anchor="middle" ${this.constructor.fontFamily} font-size="110">
        ${this.renderedLogo}
        ${this.renderedLabel}
        ${this.renderedMessage}
      </g>`
    )
  }
}

class Flat extends Badge {
  static get fontFamily() {
    return fontFamily
  }

  static get height() {
    return 20
  }

  static get verticalMargin() {
    return 0
  }

  static get shadow() {
    return true
  }

  render() {
    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        height: this.constructor.height,
      },
      `
      <linearGradient id="s" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>

      <clipPath id="r">
        <rect width="${this.width}" height="${this.constructor.height}" rx="3" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#r)">
        <rect width="${this.leftWidth}" height="${this.constructor.height}" fill="${this.labelColor}"/>
        <rect x="${this.leftWidth}" width="${this.rightWidth}" height="${this.constructor.height}" fill="${this.color}"/>
        <rect width="${this.width}" height="${this.constructor.height}" fill="url(#s)"/>
      </g>

      <g fill="#fff" text-anchor="middle" ${this.constructor.fontFamily} font-size="110">
        ${this.renderedLogo}
        ${this.renderedLabel}
        ${this.renderedMessage}
      </g>`
    )
  }
}

class FlatSquare extends Badge {
  static get fontFamily() {
    return fontFamily
  }

  static get height() {
    return 20
  }

  static get verticalMargin() {
    return 0
  }

  static get shadow() {
    return false
  }

  render() {
    return renderBadge(
      {
        links: this.links,
        leftWidth: this.leftWidth,
        rightWidth: this.rightWidth,
        height: this.constructor.height,
      },
      `
      <g shape-rendering="crispEdges">
        <rect width="${this.leftWidth}" height="${this.constructor.height}" fill="${this.labelColor}"/>
        <rect x="${this.leftWidth}" width="${this.rightWidth}" height="${this.constructor.height}" fill="${this.color}"/>
      </g>

      <g fill="#fff" text-anchor="middle" ${this.constructor.fontFamily} font-size="110">
        ${this.renderedLogo}
        ${this.renderedLabel}
        ${this.renderedMessage}
      </g>`
    )
  }
}

function plastic(params) {
  const badge = new Plastic(params)
  if (params.minify) {
    return stripXmlWhitespace(badge.render())
  }
  return badge.render()
}

function flat(params) {
  const badge = new Flat(params)
  if (params.minify) {
    return stripXmlWhitespace(badge.render())
  }
  return badge.render()
}

function flatSquare(params) {
  const badge = new FlatSquare(params)
  if (params.minify) {
    return stripXmlWhitespace(badge.render())
  }
  return badge.render()
}

function social({
  label,
  message,
  links = [],
  logo,
  logoWidth,
  logoPadding,
  color = '#4c1',
  labelColor = '#555',
  minify,
}) {
  // Social label is styled with a leading capital. Convert to caps here so
  // width can be measured using the correct characters.
  label = capitalize(label)

  const externalHeight = 20
  const internalHeight = 19
  const horizPadding = 5
  const { totalLogoWidth, renderedLogo } = renderLogo({
    logo,
    badgeHeight: externalHeight,
    horizPadding,
    logoWidth,
    logoPadding,
  })
  const hasMessage = message.length

  let { labelWidth, messageWidth } = computeWidths({ label, message })
  labelWidth += 10 + totalLogoWidth
  messageWidth += 10
  messageWidth -= 4

  const labelTextX = ((labelWidth + totalLogoWidth) / 2) * 10
  const labelTextLength = (labelWidth - (10 + totalLogoWidth)) * 10
  const escapedLabel = escapeXml(label)

  let [leftLink, rightLink] = links
  leftLink = escapeXml(leftLink)
  rightLink = escapeXml(rightLink)
  const hasLeftLink = leftLink && leftLink.length
  const hasRightLink = rightLink && rightLink.length

  function renderMessageBubble() {
    const messageBubbleMainX = labelWidth + 6.5
    const messageBubbleNotchX = labelWidth + 6
    return `
      <rect x="${messageBubbleMainX}" y="0.5" width="${messageWidth}" height="${internalHeight}" rx="2" fill="#fafafa"/>
      <rect x="${messageBubbleNotchX}" y="7.5" width="0.5" height="5" stroke="#fafafa"/>
      <path d="M${messageBubbleMainX} 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa"/>
    `
  }

  function renderMessageText() {
    const messageTextX = (labelWidth + messageWidth / 2 + 6) * 10
    const messageTextLength = (messageWidth - 8) * 10
    const escapedMessage = escapeXml(message)
    const shadow = `<text x="${messageTextX}" y="150" fill="#fff" transform="scale(.1)" textLength="${messageTextLength}">${escapedMessage}</text>`
    const text = `<text id="rlink" x="${messageTextX}" y="140" transform="scale(.1)" textLength="${messageTextLength}">${escapedMessage}</text>`
    if (hasRightLink) {
      return `
      ${shadow}
      <a target="_blank" xlink:href="${rightLink}">${text}</a>
      `
    }
    return `
      ${shadow}
      ${text}
    `
  }

  function renderLeftLink() {
    const rect = `<rect id="llink" stroke="#d5d5d5" fill="url(#a)" x=".5" y=".5" width="${labelWidth}" height="${internalHeight}" rx="2" />`
    if (hasLeftLink) {
      return `<a target="_blank" xlink:href="${leftLink}">${rect}</a>`
    }
    return rect
  }

  const badge = renderBadge(
    {
      links: [],
      leftWidth: labelWidth + 1,
      rightWidth: hasMessage ? messageWidth + 6 : 0,
      height: externalHeight,
    },
    `
    <style>a #llink:hover{fill:url(#b);stroke:#ccc}a #rlink:hover{fill:#4183c4}</style>
    <linearGradient id="a" x2="0" y2="100%">
      <stop offset="0" stop-color="#fcfcfc" stop-opacity="0"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#ccc" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <g stroke="#d5d5d5">
      <rect stroke="none" fill="#fcfcfc" x="0.5" y="0.5" width="${labelWidth}" height="${internalHeight}" rx="2"/>
      ${hasMessage ? renderMessageBubble() : ''}
    </g>
    ${renderedLogo}
    <g fill="#333" text-anchor="middle" ${socialFontFamily} font-weight="700" font-size="110px" line-height="14px">
      <text x="${labelTextX}" y="150" fill="#fff" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>
      <text x="${labelTextX}" y="140" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>
      ${hasMessage ? renderMessageText() : ''}
    </g>
    ${renderLeftLink()}
    `
  )

  if (minify) {
    return stripXmlWhitespace(badge)
  }
  return badge
}

function forTheBadge({
  label,
  message,
  links,
  logo,
  logoWidth,
  logoPadding,
  color = '#4c1',
  labelColor,
  minify,
}) {
  // For the Badge is styled in all caps. Convert to caps here so widths can
  // be measured using the correct characters.
  label = label.toUpperCase()
  message = message.toUpperCase()

  let { labelWidth, messageWidth } = computeWidths({ label, message })
  const height = 28
  const hasLabel = label.length || labelColor
  if (labelColor == null) {
    labelColor = '#555'
  }
  const horizPadding = 9
  const { hasLogo, totalLogoWidth, renderedLogo } = renderLogo({
    logo,
    badgeHeight: height,
    horizPadding,
    logoWidth,
    logoPadding,
  })

  labelWidth += 10 + totalLogoWidth
  if (label.length) {
    labelWidth += 10 + label.length * 1.5
  } else if (hasLogo) {
    if (hasLabel) {
      labelWidth += 7
    } else {
      labelWidth -= 7
    }
  } else {
    labelWidth -= 11
  }

  messageWidth += 10
  messageWidth += 10 + message.length * 2
  const leftWidth = hasLogo && !hasLabel ? 0 : labelWidth
  const rightWidth =
    hasLogo && !hasLabel ? messageWidth + labelWidth : messageWidth

  labelColor = hasLabel || hasLogo ? labelColor : color

  color = escapeXml(color)
  labelColor = escapeXml(labelColor)

  function renderLabelText() {
    const labelTextX = ((labelWidth + totalLogoWidth) / 2) * 10
    const labelTextLength = (labelWidth - (24 + totalLogoWidth)) * 10
    const escapedLabel = escapeXml(label)
    return `
      <text x="${labelTextX}" y="175" transform="scale(.1)" textLength="${labelTextLength}">${escapedLabel}</text>
    `
  }

  const badge = renderBadge(
    {
      links,
      leftWidth,
      rightWidth,
      height,
    },
    `
    <g shape-rendering="crispEdges">
      <rect width="${leftWidth}" height="${height}" fill="${labelColor}"/>
      <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="${color}"/>
    </g>
    <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="100">
      ${renderedLogo}
      ${hasLabel ? renderLabelText() : ''}
      <text x="${(labelWidth + messageWidth / 2) *
        10}" y="175" font-weight="bold" transform="scale(.1)" textLength="${(messageWidth -
      24) *
      10}">
        ${escapeXml(message)}</text>
    </g>`
  )

  if (minify) {
    return stripXmlWhitespace(badge)
  }
  return badge
}

module.exports = { plastic, flat, flatSquare, social, forTheBadge }
