'use strict';

const autosave = require('json-autosave');

class TokenPersistence {
  constructor (path, tokenProvider) {
    Object.assign(this, {
      path: path || './private/github-user-tokens.json',
      tokenProvider,
      save: null,
    });
  }

  initialize () {
    autosave(this.path, { data: [] }).then(save => {
      this.save = save;

      save.autosave = function () {
        // Override the autosave handler to refresh the token data before
        // saving.
        this.data(this.tokenProvider.toNative());
        this.save();
      };

      save.data.forEach(tokenString => {
        this.tokenProvider.addToken(tokenString);
      });
    }).catch(e => {
      console.error(`Could not create ${this.path}`);
    });
  }

  stop () {
    if (this.save) {
      this.save.stop();
      this.save.save();
      this.save = null;
    }
  }
}

module.exports = TokenPersistence;
