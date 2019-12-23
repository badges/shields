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
  logoWidth = 14,
  logoPadding = 0,
  extraPadding = 0,
}) {
  if (logo) {
    const x = 5 + extraPadding
    const y = 3 + extraPadding
    return {
      hasLogo: true,
      logoWidth: logoWidth + logoPadding,
      renderedLogo: `<image x="${x}" y="${y}" width="${logoWidth}" height="14" xlink:href="${escapeXml(
        escapeXml(logo)
      )}"/>`,
    }
  } else {
    return {
      hasLogo: false,
      logoWidth: 0,
      renderedLogo: '',
    }
  }
}

function renderText({
  leftMargin,
  horizPadding = 0,
  content,
  verticalMargin = 0,
  shadow = false,
}) {
  if (content.length) {
    const textLength = preferredWidthOf(content)
    const escapedContent = escapeXml(content)

    const shadowMargin = 150 + verticalMargin
    const textMargin = 140 + verticalMargin

    const outTextLength = 10 * textLength
    const x = 10 * (leftMargin + 0.5 * textLength + horizPadding)

    let renderedText = ''
    if (shadow) {
      renderedText = `<text x="${x}" y="${shadowMargin}" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${outTextLength}" lengthAdjust="spacing">${escapedContent}</text>`
    }
    renderedText += `<text x="${x}" y="${textMargin}" transform="scale(0.1)" textLength="${outTextLength}" lengthAdjust="spacing">${escapedContent}</text>`

    return {
      renderedText,
      width: textLength,
    }
  }
  return { renderedText: '', width: 0 }
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
    (hasLeftLink ? render({ link: leftLink, width: leftLinkWidth }) : '') +
    (hasRightLink ? render({ link: rightLink, width: messageWidth }) : '')
  )
}

function renderBadge({ labelWidth, messageWidth, height, links }, main) {
  const width = labelWidth + messageWidth
  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">
    ${main}
    ${renderLinks({ links, labelWidth, messageWidth, height })}
    </svg>
  `
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
    logoWidth: inLogoWidth,
    logoPadding,
    color = '#4c1',
    labelColor = '#555',
  }) {
    const { hasLogo, logoWidth, renderedLogo } = renderLogo({
      logo,
      logoWidth: inLogoWidth,
      logoPadding,
    })
    const hasLabel = label.length

    labelColor = hasLabel || (hasLogo && labelColor) ? labelColor : color
    labelColor = escapeXml(labelColor)
    color = escapeXml(color)

    const horizPadding = 5

    const labelMargin = logoWidth + 1

    const { renderedText: renderedLabel, width: labelWidth } = renderText({
      leftMargin: labelMargin,
      horizPadding,
      content: label,
      verticalMargin: this.constructor.verticalMargin,
      shadow: this.constructor.shadow,
    })

    const leftWidth = hasLabel ? labelWidth + 2 * horizPadding + logoWidth : 0

    let messageMargin = leftWidth - (message.length ? 1 : 0)
    if (!hasLabel) {
      messageMargin = messageMargin + 1
    }

    const { renderedText: renderedMessage, width: messageWidth } = renderText({
      leftMargin: messageMargin,
      horizPadding,
      content: message,
      verticalMargin: this.constructor.verticalMargin,
      shadow: this.constructor.shadow,
    })

    const rightWidth = messageWidth + 2 * horizPadding

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
        labelWidth: this.leftWidth,
        messageWidth: this.rightWidth,
        height: this.constructor.height,
      },
      `
      <linearGradient id="smooth" x2="0" y2="100%">
        <stop offset="0"  stop-color="#fff" stop-opacity=".7"/>
        <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
        <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
        <stop offset="1"  stop-color="#000" stop-opacity=".5"/>
      </linearGradient>

      <clipPath id="round">
        <rect width="${this.width}" height="${this.constructor.height}" rx="4" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#round)">
        <rect width="${this.leftWidth}" height="${this.constructor.height}" fill="${this.labelColor}"/>
        <rect x="${this.leftWidth}" width="${this.rightWidth}" height="${this.constructor.height}" fill="${this.color}"/>
        <rect width="${this.width}" height="${this.constructor.height}" fill="url(#smooth)"/>
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
        labelWidth: this.leftWidth,
        messageWidth: this.rightWidth,
        height: this.constructor.height,
      },
      `
      <linearGradient id="smooth" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>

      <clipPath id="round">
        <rect width="${this.width}" height="${this.constructor.height}" rx="3" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#round)">
        <rect width="${this.leftWidth}" height="${this.constructor.height}" fill="${this.labelColor}"/>
        <rect x="${this.leftWidth}" width="${this.rightWidth}" height="${this.constructor.height}" fill="${this.color}"/>
        <rect width="${this.width}" height="${this.constructor.height}" fill="url(#smooth)"/>
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
        labelWidth: this.leftWidth,
        messageWidth: this.rightWidth,
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

function plastic(obj) {
  const badge = new Plastic(obj)
  return badge.render()
}

function flat(obj) {
  const badge = new Flat(obj)
  return badge.render()
}

function flatSquare(obj) {
  const badge = new FlatSquare(obj)
  return badge.render()
}

function social({
  label,
  message,
  links,
  logo,
  logoWidth: inLogoWidth,
  logoPadding,
  color = '#4c1',
  labelColor = '#555',
}) {
  // Social label is styled with a leading capital. Convert to caps here so
  // width can be measured using the correct characters.
  label = capitalize(label)

  const height = 20
  const { hasLogo, logoWidth, renderedLogo } = renderLogo({
    logo,
    logoWidth: inLogoWidth,
    logoPadding,
  })
  const hasMessage = message.length

  let { labelWidth, messageWidth } = computeWidths({ label, message })
  labelWidth += 10 + logoWidth
  messageWidth += 10
  messageWidth -= 4

  function renderMessageBubble() {
    const messageBubbleMainX = labelWidth + 6.5
    const messageBubbleNotchX = labelWidth + 6
    return `
      <rect x="${messageBubbleMainX}" y="0.5" width="${messageWidth}" height="19" rx="2" fill="#fafafa"/>
      <rect x="${messageBubbleNotchX}" y="7.5" width="0.5" height="5" stroke="#fafafa"/>
      <path d="M${messageBubbleMainX} 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa"/>
    `
  }

  function renderMessageText() {
    const messageTextX = (labelWidth + messageWidth / 2 + 6) * 10
    const messageTextLength = (messageWidth - 8) * 10
    const escapedMessage = escapeXml(message)
    return `
      <text x="${messageTextX}" y="150" fill="#fff" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">${escapedMessage}</text>
      <text x="${messageTextX}" y="140" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">${escapedMessage}</text>
    `
  }

  const labelTextX = ((labelWidth + logoWidth) / 2) * 10
  const labelTextLength = (labelWidth - (10 + logoWidth)) * 10
  const escapedLabel = escapeXml(label)

  return renderBadge(
    {
      links,
      labelWidth: labelWidth + 1,
      messageWidth: hasMessage ? messageWidth + 6 : 0,
      height,
    },
    `
    <linearGradient id="a" x2="0" y2="100%">
      <stop offset="0" stop-color="#fcfcfc" stop-opacity="0"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <linearGradient id="b" x2="0" y2="100%">
      <stop offset="0" stop-color="#ccc" stop-opacity=".1"/>
      <stop offset="1" stop-opacity=".1"/>
    </linearGradient>
    <g stroke="#d5d5d5">
      <rect stroke="none" fill="#fcfcfc" x="0.5" y="0.5" width="${labelWidth}" height="19" rx="2"/>
      <rect stroke="#d5d5d5" fill="url(#a)" x="0.5" y="0.5" width="${labelWidth}" height="19" rx="2"/>
      ${hasMessage ? renderMessageBubble() : ''}
    </g>
    ${renderedLogo}
    <g fill="#333" text-anchor="middle" ${socialFontFamily} font-weight="700" font-size="110px" line-height="14px">
      <text x="${labelTextX}" y="150" fill="#fff" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
      <text x="${labelTextX}" y="140" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
      ${hasMessage ? renderMessageText() : ''}
    </g>`
  )
}

function forTheBadge({
  label,
  message,
  links,
  logo,
  logoColor,
  logoWidth: inLogoWidth,
  logoPadding,
  color = '#4c1',
  labelColor = '#555',
}) {
  // For the Badge is styled in all caps. Convert to caps here so widths can
  // be measured using the correct characters.
  label = label.toUpperCase()
  message = message.toUpperCase()

  let { labelWidth, messageWidth } = computeWidths({ label, message })
  const { hasLogo, logoWidth, renderedLogo } = renderLogo({
    logo,
    logoWidth: inLogoWidth,
    logoPadding,
    extraPadding: 4,
  })
  labelWidth += 10 + logoWidth
  labelWidth -= label.length
    ? -(10 + label.length * 1.5)
    : logo
    ? labelColor
      ? -7
      : 7
    : 11
  messageWidth += 10
  messageWidth += 10 + message.length * 2

  labelColor = label.length || (logo && logoColor) ? labelColor : color

  const hasLabel = label.length
  const height = 28

  color = escapeXml(color)
  labelColor = escapeXml(labelColor)

  function renderLabelText() {
    const labelTextX = ((labelWidth + logoWidth) / 2) * 10
    const labelTextLength = (labelWidth - (24 + logoWidth)) * 10
    const escapedLabel = escapeXml(label)
    return `
      <text x="${labelTextX}" y="175" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
    `
  }

  return renderBadge(
    {
      links,
      labelWidth,
      messageWidth,
      height,
    },
    `
    <g shape-rendering="crispEdges">
      <rect width="${labelWidth}" height="${height}" fill="${labelColor}"/>
      <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
    </g>
    <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="100">
      ${renderedLogo}
      ${hasLabel ? renderLabelText() : ''}
      <text
        x="${(labelWidth + messageWidth / 2) * 10}"
        y="175" font-weight="bold" transform="scale(0.1)"
        textLength="${(messageWidth - 24) * 10}" lengthAdjust="spacing">
          ${escapeXml(message)}
        </text>
      </g>`
  )
}

module.exports = { plastic, flat, flatSquare, social, forTheBadge }
