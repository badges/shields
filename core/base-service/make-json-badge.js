import { normalizeColor } from 'badge-maker/lib/color.js'

export function makeJsonBadge(badgeData) {
  const { label, message, logoWidth, color, labelColor, links } = badgeData

  return {
    label,
    message,
    logoWidth,
    color: normalizeColor(color),
    labelColor: normalizeColor(labelColor),
    link: links,
    name: label,
    value: message,
  }
}
