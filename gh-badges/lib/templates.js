'use strict'

const fontFamily = 'DejaVu Sans,Verdana,Geneva,sans-serif'

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

function badgeLinks(
  [leftLink, rightLink] = [],
  leftWidth,
  rightWidth,
  badgeHeight
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
        hasRightLink ? leftWidth : leftWidth + rightWidth
      }" height="${badgeHeight}" fill="rgba(0,0,0,0)"/>
    </a>`
      : ''
  }
  ${
    hasRightLink
      ? `<a target="_blank" xlink:href="${rightLink}">
      <rect x="${leftWidth}" width="${rightWidth}" height="${badgeHeight}" fill="rgba(0,0,0,0)"/>
    </a>`
      : ''
  }
  `
}

function createBadge(
  badgeData,
  leftWidth,
  rightWidth,
  badgeHeight,
  badgeString
) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${leftWidth +
    rightWidth}" height="${badgeHeight}">
  ${badgeString}
  ${badgeLinks(badgeData.links, leftWidth, rightWidth, badgeHeight)}
  </svg>`
}

module.exports = {
  plastic(it) {
    it.escapedText = it.text.map(escapeXml)
    it.widths[0] -= it.text[0].length ? 0 : it.logo ? (it.colorA ? 0 : 7) : 11

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const badgeHeight = 18
    const hasLogo = !!it.logo
    const hasLabel = it.text[0] && it.text[0].length

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      badgeHeight,
      `
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0"  stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
    <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
    <stop offset="1"  stop-color="#000" stop-opacity=".5"/>
  </linearGradient>

  <clipPath id="round">
    <rect width="${leftWidth +
      rightWidth}" height="${badgeHeight}" rx="4" fill="#fff"/>
  </clipPath>

  <g clip-path="url(#round)">
    <rect width="${leftWidth}" height="${badgeHeight}" fill="${leftColor}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${badgeHeight}" fill="${rightColor}"/>
    <rect width="${leftWidth +
      rightWidth}" height="${badgeHeight}" fill="url(#smooth)"/>
  </g>

  <g fill="#fff" text-anchor="middle" font-family="${fontFamily}" font-size="110">
    ${
      hasLogo
        ? `<image x="5" y="3" width="${it.logoWidth}" height="14" xlink:href="${
            it.logo
          }"/>`
        : ''
    }
    ${
      hasLabel
        ? `<text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
            10}" y="140" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${(leftWidth -
            (10 + it.logoWidth + it.logoPadding)) *
            10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
          10}" y="130" transform="scale(0.1)" textLength="${(leftWidth -
            (10 + it.logoWidth + it.logoPadding)) *
            10}" lengthAdjust="spacing">${it.escapedText[0]}</text>`
        : ''
    }
    <text x="${(leftWidth + rightWidth / 2 - (it.text[0].length ? 1 : 0)) *
      10}" y="140" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${(rightWidth -
        10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
    <text x="${(leftWidth + rightWidth / 2 - (it.text[0].length ? 1 : 0)) *
      10}" y="130" transform="scale(0.1)" textLength="${(rightWidth - 10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
  </g>`
    )
  },

  flat(it) {
    it.escapedText = it.text.map(escapeXml)
    it.widths[0] -= it.text[0].length ? 0 : it.logo ? (it.colorA ? 0 : 7) : 11

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const badgeHeight = 20
    const hasLogo = !!it.logo
    const hasLabel = it.text[0] && it.text[0].length

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      badgeHeight,
      `
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>

  <clipPath id="round">
    <rect width="${leftWidth +
      rightWidth}" height="${badgeHeight}" rx="3" fill="#fff"/>
  </clipPath>

  <g clip-path="url(#round)">
    <rect width="${leftWidth}" height="${badgeHeight}" fill="${leftColor}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${badgeHeight}" fill="${rightColor}"/>
    <rect width="${leftWidth +
      rightWidth}" height="${badgeHeight}" fill="url(#smooth)"/>
  </g>

  <g fill="#fff" text-anchor="middle" font-family="${fontFamily}" font-size="110">
    ${
      hasLogo
        ? `<image x="5" y="3" width="${it.logoWidth}" height="14" xlink:href="${
            it.logo
          }"/>`
        : ''
    }
    ${
      hasLabel
        ? `<text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
            10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${(leftWidth -
            (10 + it.logoWidth + it.logoPadding)) *
            10}" lengthAdjust="spacing">${it.escapedText[0]}</text>
        <text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
          10}" y="140" transform="scale(0.1)" textLength="${(leftWidth -
            (10 + it.logoWidth + it.logoPadding)) *
            10}" lengthAdjust="spacing">${it.escapedText[0]}</text>`
        : ''
    }
    <text x="${(leftWidth + rightWidth / 2 - (it.text[0].length ? 1 : 0)) *
      10}" y="150" fill="#010101" fill-opacity=".3" transform="scale(0.1)" textLength="${(rightWidth -
        10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
    <text x="${(leftWidth + rightWidth / 2 - (it.text[0].length ? 1 : 0)) *
      10}" y="140" transform="scale(0.1)" textLength="${(rightWidth - 10) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
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
    const badgeHeight = 20
    const hasLogo = !!it.logo
    const hasLabel = it.text[0] && it.text[0].length

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      badgeHeight,
      `
  <g shape-rendering="crispEdges">
    <rect width="${leftWidth}" height="20" fill="${leftColor}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="20" fill="${rightColor}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="${fontFamily}" font-size="110">
    ${
      hasLogo
        ? `<image x="5" y="3" width="${it.logoWidth}" height="14" xlink:href="${
            it.logo
          }"/>`
        : ''
    }
    ${
      hasLabel
        ? `<text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2 + 1) *
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
    const badgeHeight = 40
    const hasLogo = !!it.logo

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      badgeHeight,
      `
  <linearGradient id="smooth" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>

  <clipPath id="round">
    <rect width="${leftWidth + rightWidth}" y="${10 -
        it.logoPosition}" height="${badgeHeight / 2}" rx="3" fill="#fff"/>
  </clipPath>

  <g clip-path="url(#round)">
    <rect width="${leftWidth}" y="${10 -
        it.logoPosition}" height="${badgeHeight / 2}" fill="${leftColor}"/>
    <rect x="${leftWidth}" y="${10 -
        it.logoPosition}" width="${rightWidth}" height="${badgeHeight /
        2}" fill="${rightColor}"/>
    <rect width="${leftWidth + rightWidth}" y="${10 -
        it.logoPosition}" height="${badgeHeight / 2}" fill="url(#smooth)"/>
  </g>

  <g fill="#fff" text-anchor="middle" font-family="${fontFamily}" font-size="110">
    ${
      hasLogo
        ? `<image x="5" y="3" width="${it.logoWidth}" height="32" xlink:href="${
            it.logo
          }"/>`
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

  popoutSquar(it) {
    it.escapedText = it.text.map(escapeXml)
    it.widths[0] -= it.text[0].length ? 0 : it.logo ? (it.colorA ? 0 : 6) : 11

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const badgeHeight = 40
    const hasLogo = !!it.logo

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      badgeHeight,
      `
  <g shape-rendering="crispEdges">
    <rect width="${leftWidth}" y="${10 -
        it.logoPosition}" height="${badgeHeight / 2}" fill="${leftColor}"/>
    <rect x="${leftWidth}" y="${10 -
        it.logoPosition}" width="${rightWidth}" height="${badgeHeight /
        2}" fill="${rightColor}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="${fontFamily}" font-size="110">
    ${
      hasLogo
        ? `<image x="5" y="3" width="${it.logoWidth}" height="32" xlink:href="${
            it.logo
          }"/>`
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
    const badgeHeight = 20
    const hasLogo = !!it.logo
    const hasMessage = it.text[1] && it.text[1].length

    return createBadge(
      it,
      leftWidth + 1,
      hasMessage ? rightWidth + 6 : 0,
      badgeHeight,
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
    <rect x="${leftWidth + 6}" y="7.5" width="0.5" height="5" stroke="#fafafa"/>
    <path d="M${leftWidth +
      6.5} 6.5 l-3 3v1 l3 3" stroke="d5d5d5" fill="#fafafa"/>`
        : ''
    }
  </g>
  ${
    hasLogo
      ? `<image x="5" y="3" width="${it.logoWidth}" height="14" xlink:href="${
          it.logo
        }"/>`
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

  forTheBadge(it) {
    it.text = it.text.map(value => value.toUpperCase())
    it.escapedText = it.text.map(escapeXml)

    it.widths[0] -= it.text[0].length
      ? -(10 + it.text[0].length * 1.5)
      : it.logo
      ? it.colorA
        ? -7
        : 7
      : 11
    it.widths[1] += 10 + it.text[1].length * 2

    const [leftWidth, rightWidth] = it.widths
    const leftColor = escapeXml(
      it.text[0].length || (it.logo && it.colorA)
        ? it.colorA || '#555'
        : it.colorB || '#4c1'
    )
    const rightColor = escapeXml(it.colorB || '#4c1')
    const hasLogo = !!it.logo
    const hasLabel = it.text[0] && it.text[0].length
    const badgeHeight = 28

    return createBadge(
      it,
      leftWidth,
      rightWidth,
      badgeHeight,
      `
  <g shape-rendering="crispEdges">
    <rect width="${leftWidth}" height="${badgeHeight}" fill="${leftColor}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${badgeHeight}" fill="${rightColor}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="${fontFamily}" font-size="100">
    ${
      hasLogo
        ? `<image x="9" y="7" width="${it.logoWidth}" height="14" xlink:href="${
            it.logo
          }"/>`
        : ''
    }
    ${
      hasLabel
        ? `<text x="${((leftWidth + it.logoWidth + it.logoPadding) / 2) *
            10}" y="175" transform="scale(0.1)" textLength="${(leftWidth -
            (24 + it.logoWidth + it.logoPadding)) *
            10}" lengthAdjust="spacing">${it.escapedText[0]}</text>`
        : ''
    }
    <text x="${(leftWidth + rightWidth / 2) *
      10}" y="175" font-weight="bold" transform="scale(0.1)" textLength="${(rightWidth -
        24) *
        10}" lengthAdjust="spacing">${it.escapedText[1]}</text>
  </g>`
    )
  },
}
