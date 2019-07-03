'use strict'

module.exports = {
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
            ? `<image x="5" y="3" width="${it.logoWidth}" height="32" xlink:href="${it.logo}"/>`
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
            ? `<image x="5" y="3" width="${it.logoWidth}" height="32" xlink:href="${it.logo}"/>`
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
}
