/**
 * @module
 */

import difference from 'lodash.difference'

/**
 * Given a pull request title like
 * '[Travis Sonar] Support user token authentication'
 * extract the list of service names in square brackets
 * as an array of strings.
 *
 * @param {string} title Pull Request title
 * @returns {string[]} Array of service names
 */
function servicesForTitle(title) {
  const bracketed = /\[([^\]]+)\]/g

  const preNormalized = title.toLowerCase()

  let services = []
  let match
  while ((match = bracketed.exec(preNormalized))) {
    const [, bracketed] = match
    services = services.concat(bracketed.split(' '))
  }
  services = services.filter(Boolean).map(service => service.toLowerCase())

  const ignored = ['wip', 'rfc', 'security']
  return difference(services, ignored)
}

export default servicesForTitle
