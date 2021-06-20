import { NotFound, InvalidResponse, Inaccessible } from './errors.js'

const defaultErrorMessages = {
  404: 'not found',
}

export default function checkErrorResponse(errorMessages = {}) {
  return async function ({ buffer, res }) {
    let error
    errorMessages = { ...defaultErrorMessages, ...errorMessages }
    if (res.statusCode === 404) {
      error = new NotFound({ prettyMessage: errorMessages[404] })
    } else if (res.statusCode !== 200) {
      const underlying = Error(
        `Got status code ${res.statusCode} (expected 200)`
      )
      const props = { underlyingError: underlying }
      if (errorMessages[res.statusCode] !== undefined) {
        props.prettyMessage = errorMessages[res.statusCode]
      }
      if (res.statusCode >= 500) {
        error = new Inaccessible(props)
      } else {
        error = new InvalidResponse(props)
      }
    }
    if (error) {
      error.response = res
      error.buffer = buffer
      throw error
    } else {
      return { buffer, res }
    }
  }
}
