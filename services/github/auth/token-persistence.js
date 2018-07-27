'use strict';

const autosave = require('json-autosave');

class TokenPersistence {
  constructor(tokenProvider, path) {
    Object.assign(this, {
      tokenProvider,
      path,
      save: null,
    });
  }

  async initialize() {
    const save = await autosave(this.path, { data: [] });

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
  }

  async stop() {
    if (this.save) {
      this.save.stop();
      await this.save.autosave();
      this.save = undefined;
    }
  }
}

module.exports = TokenPersistence;
