import got from 'got'

// https://github.com/nock/nock/issues/1523
export default got.extend({ retry: { limit: 0 } })
