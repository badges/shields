import Joi from 'joi'

const queryParamSchema = Joi.object({
  up_message: Joi.string(),
  down_message: Joi.string(),
  up_color: Joi.alternatives(Joi.string(), Joi.number()),
  down_color: Joi.alternatives(Joi.string(), Joi.number()),
}).required()

const exampleQueryParams = {
  up_message: 'online',
  up_color: 'blue',
  down_message: 'offline',
  down_color: 'lightgrey',
}

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
