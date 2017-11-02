'use strict';

const autosave = require('json-autosave');

class TokenPersistence {
  constructor (tokenProvider, path) {
    Object.assign(this, {
      tokenProvider,
      path,
      save: null,
    });
  }

  initialize () {
    return autosave(this.path, { data: [] }).then(save => {
      this.save = save;

      // Override the autosave handler to refresh the token data before
      // saving.
      save.autosave = () => {
        save.data = this.tokenProvider.toNative();
        return save.save();
      };
      // Put the change in autosave handler into effect.
      save.stop();
      save.start();

      save.data.forEach(tokenString => {
        this.tokenProvider.addToken(tokenString);
      });
    });
  }

  stop () {
    let result;
    if (this.save) {
      this.save.stop();
      result = this.save.autosave();
      this.save = null;
    } else {
      result = Promise.resolve();
    }
    return result;
  }
}

module.exports = TokenPersistence;
