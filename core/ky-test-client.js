import ky from 'ky'

// https://github.com/nock/nock/issues/1523
const client = ky.create({
  retry: { limit: 0 },
  throwHttpErrors: status => status >= 400,
  timeout: false,
})

async function request(url, options) {
  const response = await client(url, options)
  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers),
    body: await response.text(),
  }
}

request.post = (url, options = {}) =>
  request(url, { ...options, method: 'POST' })

export default request
