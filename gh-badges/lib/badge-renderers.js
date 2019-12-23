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
        logo
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

function renderTextWithShadow({
  leftMargin,
  horizPadding = 0,
  content,
  verticalMargin = 0,
}) {
  if (content.length) {
    const textLength = preferredWidthOf(content)
    const escapedContent = escapeXml(content)

    const shadowMargin = 150 + verticalMargin
    const textMargin = 140 + verticalMargin

    const outTextLength = 10 * textLength
    const x = 10 * (leftMargin + 0.5 * textLength + 0.5 * horizPadding)

    return {
      renderedText: `
    <text x="${x}" y="${shadowMargin}" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${outTextLength}" lengthAdjust="spacing">${escapedContent}</text>
    <text x="${x}" y="${textMargin}" transform="scale(0.1)" textLength="${outTextLength}" lengthAdjust="spacing">${escapedContent}</text>
  `,
      width: textLength,
    }
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

function plastic({
  label,
  message,
  links,
  logo,
  logoWidth: inLogoWidth,
  logoPadding,
  color = '#4c1',
  labelColor = '#555',
}) {
  const height = 18

  const { hasLogo, logoWidth, renderedLogo } = renderLogo({
    logo,
    logoWidth: inLogoWidth,
    logoPadding,
  })

  const hasLabel = label.length
  labelColor = hasLabel || (hasLogo && labelColor) ? labelColor : color

  // TODO Validate the color externally so it's not necessary to escape it.
  color = escapeXml(color)
  labelColor = escapeXml(labelColor)

  // if (hasLabel) {
  //   labelWidth += 10
  //   messageWidth += 10
  // } else {
  //   if (!logo) {
  //     // No left.
  //     labelWidth -= 1
  //   } else if (logo && !labelColor) {
  //     // Just the logo on the left.
  //     labelWidth += 3
  //   } else {
  //     // Show logo with label color.
  //     labelWidth += 10
  //     messageWidth += 10
  //   }
  // }

  const {
    renderedText: renderedLabel,
    width: labelWidth,
  } = renderTextWithShadow({
    leftMargin: logoWidth / 2 + 6,
    content: label,
    // The plastic badge is a little bit shorter.
    verticalMargin: -10,
  })

  const width = labelWidth + messageWidth

  const {
    renderedText: renderedMessage,
    width: messageWidth,
  } = renderTextWithShadow({
    leftMargin: labelWidth / 2 - (hasLabel ? 1 : 0),
    content: message,
    verticalMargin: -10,
  })

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
      ${renderedLogo}
      ${renderedLabel}
      ${renderedMessage}
    </g>`
  )
}

function flat({
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

  labelColor = hasLabel || (hasLogo && labelColor) ? labelColor : color
  labelColor = escapeXml(labelColor)
  color = escapeXml(color)

  const horizPadding = 5
  const {
    renderedText: renderedLabel,
    width: labelWidth,
  } = renderTextWithShadow({
    leftMargin: (logoWidth + logoPadding) / 2 + 1,
    horizPadding,
    content: label,
  })

  const {
    renderedText: renderedMessage,
    width: messageWidth,
  } = renderTextWithShadow({
    leftMargin:
      (logoWidth + logoPadding) / 2 + labelWidth - (message.length ? 1 : 0),
    content: message,
  })

  const leftWidth = labelWidth + 2 * horizPadding
  const width = labelWidth + messageWidth

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
      <rect width="${leftWidth}" height="${height}" fill="${labelColor}"/>
      <rect x="${leftWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
      <rect width="${width}" height="${height}" fill="url(#smooth)"/>
    </g>

    <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
      ${hasLogo ? renderLogo({ logo, logoWidth }) : ''}
      ${renderedLabel}
      ${renderedMessage}
    </g>`
  )
}

function flatSquare({
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
}

function social({
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
}

function forTheBadge({
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
}

module.exports = { plastic, flat, flatSquare, social, forTheBadge }
