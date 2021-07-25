function constEq(a, b) {
  if (a.length !== b.length) {
    return false
  }
  let zero = 0
  for (let i = 0; i < a.length; i++) {
    zero |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return zero === 0
}

function makeSecretIsValid(shieldsSecret) {
  return function secretIsValid(secret = '') {
    return shieldsSecret && constEq(secret, shieldsSecret)
  }
}

export { makeSecretIsValid }
