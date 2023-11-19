/**
 * Commonly used functions and utilities for tasks related to website status.
 *
 * @module
 */

import Joi from 'joi'

/**
 * Joi schema for validating query params.
 * Checks if the query params object has valid up_message, down_message, up_color and down_color properties.
 *
 * @type {Joi}
 */
const queryParamSchema = Joi.object({
  up_message: Joi.string(),
  down_message: Joi.string(),
  up_color: Joi.alternatives(Joi.string(), Joi.number()),
  down_color: Joi.alternatives(Joi.string(), Joi.number()),
}).required()

/**
 * Example query param object.
 * Contains up_message, down_message, up_color and down_color properties.
 *
 * @type {object}
 */
const exampleQueryParams = {
  up_message: 'online',
  up_color: 'blue',
  down_message: 'offline',
  down_color: 'lightgrey',
}

/**
 * Creates a badge object that displays information about website status.
 *
 * @param {object} options - The options for rendering the status
 * @param {boolean} options.isUp - Whether the website or service is up or down
 * @param {string} [options.upMessage='up'] - The message to display when the website or service is up
 * @param {string} [options.downMessage='down'] - The message to display when the website or service is down
 * @param {string} [options.upColor='brightgreen'] - The color to use when the website or service is up
 * @param {string} [options.downColor='red'] - The color to use when the website or service is down
 * @returns {object} An object with a message and a color property
 * @example
 * renderWebsiteStatus({ isUp: true }) // returns { message: 'up', color: 'brightgreen' }
 * renderWebsiteStatus({ isUp: false }) // returns { message: 'down', color: 'red' }
 */
function renderWebsiteStatus({
  isUp,
  upMessage = 'up',
  downMessage = 'down',
  upColor = 'brightgreen',
  downColor = 'red',
}) {
  if (isUp) {
    return { message: upMessage, color: upColor }
  } else {
    return { message: downMessage, color: downColor }
  }
}

export { queryParamSchema, exampleQueryParams, renderWebsiteStatus }
