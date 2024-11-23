import { randomBytes } from 'crypto'

/**
 * A class to manage OAuth states.
 *
 * Used to prevent CSRF attacks.
 *
 * @class OauthStateManager
 * @property {Map<string, { clientId: string, expiry: number }>} states A map of states to client ids.
 */
class OAuthStateManager {
  constructor() {
    this.states = new Map()
    this.maxSize = 1000
    this.expiry = 1000 * 60 * 60 // 1 hour
    this.cleanInterval = setInterval(() => this.cleanExpired(), this.expiry)
  }

  /**
   * Generate a new state and store it.
   *
   * @param {string} clientId The client id to associate with the state.
   * @returns {string} The generated state.
   */
  new(clientId) {
    const state = OAuthStateManager.generateState()
    this.states.set(state, { clientId, expiry: Date.now() + this.expiry })
    if (this.states.size > this.maxSize) {
      const oldestState = this.states.keys().next().value
      this.states.delete(oldestState)
    }
    return state
  }

  /**
   * Generate a random state for OAuth authentication.
   *
   * Used to prevent CSRF attacks.
   *
   * @returns {string} A random 128bit state base64 url safe encoded.
   */
  static generateState() {
    return randomBytes(16).toString('base64url')
  }

  /**
   * Generate a random client id for OAuth authentication.
   *
   * CSRF protection requires a client id to be associated with
   * the state so attacker cannot use their own valid state.
   * This function generates a random client id to bind a specific
   * client to a state to prevent usage of a valid state by an attacker.
   *
   * @returns {string} A random 128bit client id base64 url safe encoded.
   */
  static generateAnonymizedClientId() {
    return randomBytes(16).toString('base64url')
  }

  /**
   * Remove a state from the manager.
   *
   * @param {string} state The state to remove.
   * @returns {void}
   */
  remove(state) {
    this.states.delete(state)
  }

  /**
   * Check if a state is valid.
   *
   * @param {string} state state to check
   * @param {string} clientId client id to check against
   * @returns {boolean} true if the state is valid, false otherwise
   */
  isValid(state, clientId) {
    return (
      this.states.get(state).clientId === clientId &&
      this.states.get(state).expiry > Date.now()
    )
  }

  /**
   * Remove all expired states.
   *
   * @returns {void}
   */
  cleanExpired() {
    for (const [state, { expiry }] of this.states) {
      if (expiry < Date.now()) {
        this.states.delete(state)
      }
    }
  }

  /**
   * Destroy the manager.
   *
   * @returns {void}
   */
  destroy() {
    clearInterval(this.cleanInterval)
  }
}

export { OAuthStateManager }
