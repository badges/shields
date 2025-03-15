import * as originalSimpleIcons from 'simple-icons/icons'

function loadSimpleIcons() {
  const simpleIcons = {}
  // As of v5 the exported keys are the svg slugs
  // Historically, Shields has supported logo specification via
  // name, name with spaces replaced by hyphens, and partially slugs
  // albeit only in cases where the slug happened to match one of those.
  // For backwards compatibility purposes we now support all three, but
  // do not broadcast the support for by-title references due to our strong
  // preference to steer users towards using the actual slugs.
  // https://github.com/badges/shields/pull/6591
  // https://github.com/badges/shields/issues/4273
  Object.keys(originalSimpleIcons).forEach(key => {
    const icon = originalSimpleIcons[key]
    const { title, slug, hex } = icon

    icon.styles = {
      default: icon.svg.replace('<svg', `<svg fill="#${hex}"`),
      light: icon.svg.replace('<svg', '<svg fill="whitesmoke"'),
      dark: icon.svg.replace('<svg', '<svg fill="#333"'),
    }

    // There are a few instances where multiple icons have the same title
    // (e.g. 'Hive'). If a by-title reference we generate for
    // backwards compatibility collides with a proper slug from Simple Icons
    // then do nothing, so that the proper slug will always map to the correct icon.
    // Starting in v7, the exported object with the full icon set has updated the keys
    // to include a lowercase `si` prefix, and utilizes proper case naming conventions.
    if (!(`si${title}` in originalSimpleIcons)) {
      simpleIcons[title.toLowerCase()] = icon
    }
    const legacyTitle = title.replace(/ /g, '-')
    if (!(`si${legacyTitle}` in originalSimpleIcons)) {
      simpleIcons[legacyTitle.toLowerCase()] = icon
    }

    simpleIcons[slug] = icon
  })
  return simpleIcons
}

export default loadSimpleIcons
