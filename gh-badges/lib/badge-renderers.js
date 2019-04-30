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

function computeWidths({ label, message }) {
  let labelWidth = (anafanafo(label) / 10) | 0
  // Increase chances of pixel grid alignment.
  if (labelWidth % 2 === 0) {
    labelWidth++
  }
  let messageWidth = (anafanafo(message) / 10) | 0
  // Increase chances of pixel grid alignment.
  if (messageWidth % 2 === 0) {
    messageWidth++
  }
  return { labelWidth, messageWidth }
}

function renderLogo({ logo, logoWidth, extraPadding = 0 }) {
  const x = 5 + extraPadding
  const y = 3 + extraPadding
  return `<image x="${x}" y="${y}" width="${logoWidth}" height="14" xlink:href="${logo}"/>`
}

function renderTextWithShadow({ x, textLength, content, verticalMargin = 0 }) {
  if (content.length) {
    const escapedContent = escapeXml(content)
    const shadowMargin = 150 + verticalMargin
    const textMargin = 140 + verticalMargin
    return `
    <text x="${x}" y="${shadowMargin}" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${textLength}" lengthAdjust="spacing">${escapedContent}</text>
    <text x="${x}" y="${textMargin}" transform="scale(0.1)" textLength="${textLength}" lengthAdjust="spacing">${escapedContent}</text>
  `
  } else {
    return ''
  }
}

function renderLinks(
  [leftLink, rightLink] = [],
  labelWidth,
  messageWidth,
  height
) {
  leftLink = escapeXml(leftLink)
  rightLink = escapeXml(rightLink)
  const hasLeftLink = leftLink && leftLink.length
  const hasRightLink = rightLink && rightLink.length
  return `
  ${
    hasLeftLink
      ? `<a target="_blank" xlink:href="${leftLink}">
      <rect width="${
        hasRightLink ? labelWidth : labelWidth + messageWidth
      }" height="${height}" fill="rgba(0,0,0,0)"/>
    </a>`
      : ''
  }
  ${
    hasRightLink
      ? `<a target="_blank" xlink:href="${rightLink}">
      <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="rgba(0,0,0,0)"/>
    </a>`
      : ''
  }
  `
}

function renderBadge({ labelWidth, messageWidth, height, links }, main) {
  const width = labelWidth + messageWidth
  return `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">
    ${main}
    ${renderLinks(links, labelWidth, messageWidth, height)}
    </svg>
  `
}

module.exports = {
  plastic({
    label,
    message,
    links,
    logo,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor = '#555',
  }) {
    const hasLabel = label.length
    const hasLogo = !!logo

    labelColor = hasLabel || (hasLogo && labelColor) ? labelColor : color

    let { labelWidth, messageWidth } = computeWidths({ label, message })
    labelWidth += 10 + logoWidth + logoPadding
    messageWidth += 10
    labelWidth -= hasLabel ? 0 : logo ? (labelColor ? 0 : 7) : 11

    const width = labelWidth + messageWidth
    const height = 18

    // TODO Validate the color externally so it's not necessary to escape it.
    color = escapeXml(color)
    labelColor = escapeXml(labelColor)

    return renderBadge(
      {
        links,
        labelWidth,
        messageWidth,
        height,
      },
      `
      <linearGradient id="smooth" x2="0" y2="100%">
        <stop offset="0"  stop-color="#fff" stop-opacity=".7"/>
        <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
        <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
        <stop offset="1"  stop-color="#000" stop-opacity=".5"/>
      </linearGradient>

      <clipPath id="round">
        <rect width="${width}" height="${height}" rx="4" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#round)">
        <rect width="${labelWidth}" height="${height}" fill="${labelColor}"/>
        <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
        <rect width="${width}" height="${height}" fill="url(#smooth)"/>
      </g>

      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
        ${hasLogo ? renderLogo({ logo, logoWidth }) : ''}
        ${renderTextWithShadow({
          x: ((labelWidth + logoWidth + logoPadding) / 2 + 1) * 10,
          textLength: (labelWidth - (10 + logoWidth + logoPadding)) * 10,
          content: label,
          // The plastic badge is a little bit shorter.
          margin: -10,
        })}
        ${renderTextWithShadow({
          x: (labelWidth + messageWidth / 2 - (hasLabel ? 1 : 0)) * 10,
          textLength: (messageWidth - 10) * 10,
          content: message,
          margin: -10,
        })}
      </g>`
    )
  },

  flat({
    label,
    message,
    links,
    logo,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor = '#555',
  }) {
    const height = 20
    const hasLogo = Boolean(logo)
    const hasLabel = label.length

    let { labelWidth, messageWidth } = computeWidths({ label, message })
    labelWidth += 10 + logoWidth + logoPadding
    labelWidth -= label.length ? 0 : logo ? (labelColor ? 0 : 7) : 11
    messageWidth += 10

    labelColor = hasLabel || (hasLogo && labelColor) ? labelColor : color

    const width = labelWidth + messageWidth

    labelColor = escapeXml(labelColor)
    color = escapeXml(color)

    return renderBadge(
      {
        links,
        labelWidth,
        messageWidth,
        height,
      },
      `
      <linearGradient id="smooth" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>

      <clipPath id="round">
        <rect width="${width}" height="${height}" rx="3" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#round)">
        <rect width="${labelWidth}" height="${height}" fill="${labelColor}"/>
        <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
        <rect width="${width}" height="${height}" fill="url(#smooth)"/>
      </g>

      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
        ${hasLogo ? renderLogo({ logo, logoWidth }) : ''}
        ${renderTextWithShadow({
          x: ((labelWidth + logoWidth + logoPadding) / 2 + 1) * 10,
          textLength: (labelWidth - (10 + logoWidth + logoPadding)) * 10,
          content: label,
        })}
        ${renderTextWithShadow({
          x: (labelWidth + messageWidth / 2 - (message.length ? 1 : 0)) * 10,
          textLength: (messageWidth - 10) * 10,
          content: message,
        })}
      </g>`
    )
  },

  flatSquare({
    label,
    message,
    links,
    logo,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor = '#555',
  }) {
    const height = 20
    const hasLogo = Boolean(logo)
    const hasLabel = label.length

    let { labelWidth, messageWidth } = computeWidths({ label, message })
    labelWidth += 10 + logoWidth + logoPadding
    labelWidth -= label.length ? 0 : logo ? (labelColor ? 0 : 7) : 11
    messageWidth += 10

    labelColor = hasLabel || (hasLogo && labelColor) ? labelColor : color

    function renderLabelText() {
      const labelTextX = ((labelWidth + logoWidth + logoPadding) / 2 + 1) * 10
      const labelTextLength = (labelWidth - (10 + logoWidth + logoPadding)) * 10
      const escapedLabel = escapeXml(label)
      return `
        <text x="${labelTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
        <text x="${labelTextX}" y="140" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
      `
    }

    const messageTextX =
      (labelWidth + messageWidth / 2 - (message.length ? 1 : 0)) * 10
    const messageTextLength = (messageWidth - 10) * 10
    const escapedMessage = escapeXml(message)

    labelColor = escapeXml(labelColor)
    color = escapeXml(color)

    return renderBadge(
      {
        links,
        labelWidth,
        messageWidth,
        height,
      },
      `
      <g shape-rendering="crispEdges">
        <rect width="${labelWidth}" height="20" fill="${labelColor}"/>
        <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="${color}"/>
      </g>
      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
        ${hasLogo ? renderLogo({ logo, logoWidth }) : ''}
        ${hasLabel ? renderLabelText() : ''}
        <text x="${messageTextX}" y="140" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">${escapedMessage}</text>
      </g>`
    )
  },

  popout(it) {
    it.escapedText = it.text.map(escapeXml)
    it.widths[0] -= it.text[0].length ? 0 : it.logo ? (it.colorA ? 0 : 6) : 11

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const height = 40
    const hasLogo = !!it.logo

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      height,
      `
      <linearGradient id="smooth" x2="0" y2="100%">
        <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
        <stop offset="1" stop-opacity=".1"/>
      </linearGradient>

      <clipPath id="round">
        <rect width="${leftWidth + rightWidth}" y="${10 -
        it.logoPosition}" height="${height / 2}" rx="3" fill="#fff"/>
      </clipPath>

      <g clip-path="url(#round)">
        <rect width="${leftWidth}" y="${10 -
        it.logoPosition}" height="${height / 2}" fill="${leftColor}"/>
        <rect x="${leftWidth}" y="${10 -
        it.logoPosition}" width="${rightWidth}" height="${height /
        2}" fill="${rightColor}"/>
        <rect width="${leftWidth + rightWidth}" y="${10 -
        it.logoPosition}" height="${height / 2}" fill="url(#smooth)"/>
      </g>

      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
        ${
          hasLogo
            ? `<image x="5" y="3" width="${
                it.logoWidth
              }" height="32" xlink:href="${it.logo}"/>`
            : ''
        }
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
          10}" y="${(25 - it.logoPosition) *
        10}" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${(leftWidth -
        (10 + it.logoWidth + it.logoPadding)) *
        10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
          10}" y="${(24 - it.logoPosition) *
        10}" transform="scale(0.1)" textLength="${(leftWidth -
        (10 + it.logoWidth + it.logoPadding)) *
        10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        <text x="${(leftWidth + rightWidth / 2 - 1) * 10}" y="${(25 -
        it.logoPosition) *
        10}" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${(rightWidth -
        10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
        <text x="${(leftWidth + rightWidth / 2 - 1) * 10}" y="${(24 -
        it.logoPosition) *
        10}" transform="scale(0.1)" textLength="${(rightWidth - 10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
      </g>`
    )
  },

  popoutSquare(it) {
    it.escapedText = it.text.map(escapeXml)
    it.widths[0] -= it.text[0].length ? 0 : it.logo ? (it.colorA ? 0 : 6) : 11

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const height = 40
    const hasLogo = !!it.logo

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      height,
      `
      <g shape-rendering="crispEdges">
        <rect width="${leftWidth}" y="${10 -
        it.logoPosition}" height="${height / 2}" fill="${leftColor}"/>
        <rect x="${leftWidth}" y="${10 -
        it.logoPosition}" width="${rightWidth}" height="${height /
        2}" fill="${rightColor}"/>
      </g>
      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
        ${
          hasLogo
            ? `<image x="5" y="3" width="${
                it.logoWidth
              }" height="32" xlink:href="${it.logo}"/>`
            : ''
        }
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
          10}" y="${(24 - it.logoPosition) *
        10}" transform="scale(0.1)" textLength="${(leftWidth -
        (10 + it.logoWidth + it.logoPadding)) *
        10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        <text x="${(leftWidth + rightWidth / 2 - 1) * 10}" y="${(24 -
        it.logoPosition) *
        10}" transform="scale(0.1)" textLength="${(rightWidth - 10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
      </g>`
    )
  },

  social({
    label,
    message,
    links,
    logo,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor = '#555',
  }) {
    // Social label is styled with a leading capital. Convert to caps here so
    // width can be measured using the correct characters.
    label = capitalize(label)

    const height = 20
    const hasLogo = Boolean(logo)
    const hasMessage = message.length

    let { labelWidth, messageWidth } = computeWidths({ label, message })
    labelWidth += 10 + logoWidth + logoPadding
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

    const labelTextX = ((labelWidth + logoWidth + logoPadding) / 2) * 10
    const labelTextLength = (labelWidth - (10 + logoWidth + logoPadding)) * 10
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
      ${hasLogo ? renderLogo({ logo, logoWidth }) : ''}
      <g fill="#333" text-anchor="middle" ${socialFontFamily} font-weight="700" font-size="110px" line-height="14px">
        <text x="${labelTextX}" y="150" fill="#fff" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
        <text x="${labelTextX}" y="140" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
        ${hasMessage ? renderMessageText() : ''}
      </g>`
    )
  },

  forTheBadge({
    label,
    message,
    links,
    logo,
    logoColor,
    logoWidth,
    logoPadding,
    color = '#4c1',
    labelColor = '#555',
  }) {
    // For the Badge is styled in all caps. Convert to caps here so widths can
    // be measured using the correct characters.
    label = label.toUpperCase()
    message = message.toUpperCase()

    let { labelWidth, messageWidth } = computeWidths({ label, message })
    labelWidth += 10 + logoWidth + logoPadding
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

    const hasLogo = Boolean(logo)
    const hasLabel = label.length
    const height = 28

    color = escapeXml(color)
    labelColor = escapeXml(labelColor)

    function renderLabelText() {
      const labelTextX = ((labelWidth + logoWidth + logoPadding) / 2) * 10
      const labelTextLength = (labelWidth - (24 + logoWidth + logoPadding)) * 10
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
        ${hasLogo ? renderLogo({ logo, logoWidth, extraPadding: 4 }) : ''}
        ${hasLabel ? renderLabelText() : ''}
        <text
          x="${(labelWidth + messageWidth / 2) * 10}"
          y="175" font-weight="bold" transform="scale(0.1)"
          textLength="${(messageWidth - 24) * 10}" lengthAdjust="spacing">
            ${escapeXml(message)}
          </text>
        </g>`
    )
  },
}
