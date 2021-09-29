import LibrariesIoApiProvider from './librariesio-api-provider.js'

// Convenience class with all the stuff related to the Libraries.io API and its
// authorization tokens, to simplify server initialization.
export default class LibrariesIoConstellation {
  constructor({ private: { librariesio_tokens: tokens } }) {
    this.apiProvider = new LibrariesIoApiProvider({
      baseUrl: 'https://libraries.io/api',
      tokens,
      defaultRateLimit: 60,
    })
  }
}
