'use strict'

const anafanafo = require('anafanafo')

const fontFamily = 'font-family="DejaVu Sans,Verdana,Geneva,sans-serif"'

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
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

function badgeLinks([leftLink, rightLink] = [], leftWidth, rightWidth, height) {
  leftLink = escapeXml(leftLink)
  rightLink = escapeXml(rightLink)
  const hasLeftLink = leftLink && leftLink.length
  const hasRightLink = rightLink && rightLink.length
  return `
  ${
    hasLeftLink
      ? `<a target="_blank" xlink:href="${leftLink}">
      <rect width="${
        hasRightLink ? leftWidth : leftWidth + rightWidth
      }" height="${height}" fill="rgba(0,0,0,0)"/>
    </a>`
      : ''
  }
  ${
    hasRightLink
      ? `<a target="_blank" xlink:href="${rightLink}">
      <rect x="${leftWidth}" width="${rightWidth}" height="${height}" fill="rgba(0,0,0,0)"/>
    </a>`
      : ''
  }
  `
}

function createBadge(badgeData, leftWidth, rightWidth, height, body) {
  const width = leftWidth + rightWidth
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}">
  ${body}
  ${badgeLinks(badgeData.links, leftWidth, rightWidth, height)}
  </svg>`
}

/*
    let { labelWidth, messageWidth } = computeWidths({ label, message })
    labelWidth += 10 + logoWidth + logoPadding
    messageWidth += 10
*/

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
    const labelTextX = ((labelWidth + logoWidth + logoPadding) / 2 + 1) * 10
    const labelTextLength = (labelWidth - (10 + logoWidth + logoPadding)) * 10
    const messageTextX =
      (labelWidth + messageWidth / 2 - (hasLabel ? 1 : 0)) * 10
    const messageTextLength = (messageWidth - 10) * 10

    const escapedLabel = escapeXml(label)
    const escapedMessage = escapeXml(message)

    // TODO Validate the color externally so it's not necessary to escape it.
    color = escapeXml(color)
    labelColor = escapeXml(labelColor)

    function renderLogo() {
      return `<image x="5" y="3" width="${logoWidth}" height="14" xlink:href="${logo}"/>`
    }

    function renderLabelText() {
      return `<text x="${labelTextX}" y="140" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing"
         >
           ${escapedLabel}
         </text>
         <text x="${labelTextX}" y="130" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">
           ${escapedLabel}
         </text>`
    }

    return createBadge(
      { links },
      labelWidth,
      messageWidth,
      height,
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
        ${hasLogo ? renderLogo() : ''}
        ${hasLabel ? renderLabelText() : ''}
        <text x="${messageTextX}" y="140" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">
          ${escapedMessage}
        </text>
        <text x="${messageTextX}" y="130" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">
          ${escapedMessage}
        </text>
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

    function renderLogo() {
      return `<image x="5" y="3" width="${logoWidth}" height="14" xlink:href="${logo}"/>`
    }

    function renderLabelText() {
      const labelTextX = ((labelWidth + logoWidth + logoPadding) / 2 + 1) * 10
      const labelTextLength = (labelWidth - (10 + logoWidth + logoPadding)) * 10

      const escapedLabel = escapeXml(label)

      return `
        <text x="${labelTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
        <text x="${labelTextX}" y="140" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">${escapedLabel}</text>
      `
    }

    const width = labelWidth + messageWidth
    const messageTextX =
      (labelWidth + messageWidth / 2 - (message.length ? 1 : 0)) * 10
    const messageTextLength = (messageWidth - 10) * 10
    const escapedMessage = escapeXml(message)

    labelColor = escapeXml(labelColor)
    color = escapeXml(color)

    return createBadge(
      { links },
      labelWidth,
      messageWidth,
      height,
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
        ${hasLogo ? renderLogo() : ''}
        ${hasLabel ? renderLabelText() : ''}
        <text x="${messageTextX}" y="150" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">${escapedMessage}</text>
        <text x="${messageTextX}" y="140" transform="scale(0.1)" textLength="${messageTextLength}" lengthAdjust="spacing">${escapedMessage}</text>
      </g>`
    )
  },

  flatSquare(it) {
    it.escapedText = it.text.map(escapeXml)
    it.widths[0] -= it.text[0].length ? 0 : it.logo ? (it.colorA ? 0 : 7) : 11

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const height = 20
    const hasLogo = !!it.logo
    const hasLabel = it.text[0] && it.text[0].length

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      height,
      `
      <g shape-rendering="crispEdges">
        <rect width="${leftWidth}" height="20" fill="${leftColor}"/>
        <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${rightColor}"/>
      </g>
      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="110">
        ${
          hasLogo
            ? `<image x="5" y="3" width="${
                it.logoWidth
              }" height="14" xlink:href="${it.logo}"/>`
            : ''
        }
        ${
          hasLabel
            ? `<text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 +
                1) *
                10}" y="140" transform="scale(0.1)" textLength="${(leftWidth -
                (10 + it.logoWidth + it.logoPadding)) *
                10}" lengthAdjust="spacing">${it.escapedText[0]}</text>`
            : ''
        }
        <text x="${(leftWidth + rightWidth / 2 - (it.text[0].length ? 1 : 0)) *
          10}" y="140" transform="scale(0.1)" textLength="${(rightWidth - 10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
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

  social(it) {
    it.text[0] = capitalize(it.text[0])
    it.escapedText = it.text.map(escapeXml)

    it.widths[1] -= 4

    const [leftWidth, rightWidth] = it.widths
    const height = 20
    const hasLogo = !!it.logo
    const hasMessage = it.text[1] && it.text[1].length

    return createBadge(
      it,
      leftWidth + 1,
      hasMessage ? rightWidth + 6 : 0,
      height,
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
        <rect stroke="none" fill="#fcfcfc" x="0.5" y="0.5" width="${leftWidth}" height="19" rx="2"/>
        <rect stroke="#d5d5d5" fill="url(#a)" x="0.5" y="0.5" width="${leftWidth}" height="19" rx="2"/>
        ${
          hasMessage
            ? `<rect y="0.5" x="${leftWidth +
                6.5}" width="${rightWidth}" height="19" rx="2" fill="#fafafa"/>
        <rect x="${leftWidth +
          6}" y="7.5" width="0.5" height="5" stroke="#fafafa"/>
        <path d="M${leftWidth +
          6.5} 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa"/>`
            : ''
        }
      </g>
      ${
        hasLogo
          ? `<image x="5" y="3" width="${
              it.logoWidth
            }" height="14" xlink:href="${it.logo}"/>`
          : ''
      }
      <g fill="#333" text-anchor="middle" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-weight="700" font-size="110px" line-height="14px">
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2) *
          10}" y="150" fill="#fff" transform="scale(0.1)" textLength="${(leftWidth -
        (10 + it.logoWidth + it.logoPadding)) *
        10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2) *
          10}" y="140" transform="scale(0.1)" textLength="${(leftWidth -
        (10 + it.logoWidth + it.logoPadding)) *
        10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        ${
          hasMessage
            ? `<text x="${(leftWidth + rightWidth / 2 + 6) *
                10}" y="150" fill="#fff" transform="scale(0.1)" textLength="${(rightWidth -
                8) *
                10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
          <text x="${(leftWidth + rightWidth / 2 + 6) *
            10}" y="140" transform="scale(0.1)" textLength="${(rightWidth - 8) *
                10}" lengthAdjust="spacing">${it.escapedText[1]}</text>`
            : ''
        }
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
    // be measured using the correct characaters.
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

    function renderLogo() {
      return `<image x="9" y="7" width="${logoWidth}" height="14" xlink:href="${logo}"/>`
    }

    function renderLabelText() {
      const labelTextX = ((labelWidth + logoWidth + logoPadding) / 2) * 10
      const labelTextLength = (labelWidth - (24 + logoWidth + logoPadding)) * 10
      const escapedLabel = escapeXml(label)
      return `<text x="${labelTextX}" y="175" transform="scale(0.1)" textLength="${labelTextLength}" lengthAdjust="spacing">
                ${escapedLabel}
              </text>`
    }

    return createBadge(
      { links },
      labelWidth,
      messageWidth,
      height,
      `
      <g shape-rendering="crispEdges">
        <rect width="${labelWidth}" height="${height}" fill="${labelColor}"/>
        <rect x="${labelWidth}" width="${messageWidth}" height="${height}" fill="${color}"/>
      </g>
      <g fill="#fff" text-anchor="middle" ${fontFamily} font-size="100">
        ${hasLogo ? renderLogo() : ''}
        ${hasLabel ? renderLabelText() : ''}
        <text
          x="${(labelWidth + messageWidth / 2) * 10}" y="175"
          font-weight="bold" transform="scale(0.1)"
          textLength="${(messageWidth - 24) * 10}" lengthAdjust="spacing">
            ${escapeXml(message)}
          </text>
        </g>`
    )
  },
}
