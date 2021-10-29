/**
 * @module
 */

import crypto from 'crypto'
import PriorityQueue from 'priorityqueuejs'

/**
 * Compute a one-way hash of the input string.
 *
 * @param {string} id token
 * @returns {string} hash
 */
function sanitizeToken(id) {
  return crypto.createHash('sha256').update(id, 'utf-8').digest('hex')
}

function getUtcEpochSeconds() {
  return (Date.now() / 1000) >>> 0
}

/**
 * Encapsulate a rate-limited token, with a user-provided ID and user-provided data.
 *
 * Each token has a notion of the number of uses remaining until exhausted,
 * and the next reset time, when it can be used again even if it's exhausted.
 */
class Token {
  /**
   * Token Constructor
   *
   * @param {string} id token string
   * @param {*} data reserved for future use
   * @param {number} usesRemaining
   *    Number of uses remaining until the token is exhausted
   * @param {number} nextReset
   *    Time when the token can be used again even if it's exhausted (unix timestamp)
   */
  constructor(id, data, usesRemaining, nextReset) {
    // Use underscores to avoid conflict with property accessors.
    Object.assign(this, {
      _id: id,
      _data: data,
      _usesRemaining: usesRemaining,
      _nextReset: nextReset,
      _isValid: true,
      _isFrozen: false,
    })
  }

  get id() {
    return this._id
  }

  get data() {
    return this._data
  }

  get usesRemaining() {
    return this._usesRemaining
  }

  get nextReset() {
    return this._nextReset
  }

  get isValid() {
    return this._isValid
  }

  get isFrozen() {
    return this._isFrozen
  }

  get hasReset() {
    return getUtcEpochSeconds() >= this.nextReset
  }

  get isExhausted() {
    return this.usesRemaining <= 0 && !this.hasReset
  }

  get decrementedUsesRemaining() {
    return this._usesRemaining - 1
  }

  /**
   * Update the uses remaining and next reset time for a token.
   *
   * @param {number} usesRemaining
   *    Number of uses remaining until the token is exhausted
   * @param {number} nextReset
   *    Time when the token can be used again even if it's exhausted (unix timestamp)
   */
  update(usesRemaining, nextReset) {
    if (!Number.isInteger(usesRemaining)) {
      throw Error('usesRemaining must be an integer')
    }
    if (!Number.isInteger(nextReset)) {
      throw Error('nextReset must be an integer')
    }

    if (this._isFrozen) {
      return
    }

    // Since the token pool will typically return the same token for many uses
    // before moving on to another, `update()` may be called many times. Since
    // the sequence of responses may be indeterminate, keep the "worst case"
    // value for uses remaining.
    if (
      this._nextReset === this.constructor.nextResetNever ||
      nextReset > this._nextReset
    ) {
      this._nextReset = nextReset
      this._usesRemaining = usesRemaining
    } else if (nextReset === this._nextReset) {
      this._usesRemaining = Math.min(this._usesRemaining, usesRemaining)
    } else {
      // Discard the new update; it's older than the values we have.
    }
  }

  /**
   * Indicate that the token should no longer be used.
   */
  invalidate() {
    this._isValid = false
  }

  /**
   * Freeze the uses remaining and next reset values. Helpful for keeping
   * stable ordering for a valid priority queue.
   */
  freeze() {
    this._isFrozen = true
  }

  /**
   * Unfreeze the uses remaining and next reset values.
   */
  unfreeze() {
    this._isFrozen = false
  }

  getDebugInfo({ sanitize = true } = {}) {
    const { id, data, usesRemaining, nextReset, isValid, isFrozen } = this

    if (sanitize) {
      return {
        id: sanitizeToken(id),
        data: '[redacted]',
        usesRemaining,
        nextReset,
        isValid,
        isFrozen,
      }
    } else {
      return { id, data, usesRemaining, nextReset, isValid, isFrozen }
    }
  }
}

// Large sentinel value which means "never reset".
Token.nextResetNever = Number.MAX_SAFE_INTEGER

/**
 * Encapsulate a collection of rate-limited tokens and choose the next
 * available token when one is needed.
 *
 * Designed for the Github API, though may be also useful with other rate-
 * limited APIs.
 */
class TokenPool {
  /**
   * TokenPool Constructor
   *
   * @param {number} batchSize
   *    The maximum number of times we use each token before moving
   *    on to the next one.
   */
  constructor({ batchSize = 1 } = {}) {
    this.batchSize = batchSize

    this.currentBatch = { currentToken: null, remaining: 0 }

    // A set of IDs used for deduplication.
    this.tokenIds = new Set()

    // See discussion on the FIFO and priority queues in `next()`.
    this.fifoQueue = []
    this.priorityQueue = new PriorityQueue(this.constructor.compareTokens)
  }

  /**
   * compareTokens
   *
   * @param {module:core/token-pooling/token-pool~Token} first first token to compare
   * @param {module:core/token-pooling/token-pool~Token} second second token to compare
   * @returns {module:core/token-pooling/token-pool~Token} The token whose current rate allotment is expiring soonest.
   */
  static compareTokens(first, second) {
    return second.nextReset - first.nextReset
  }

  /**
   * Add a token with user-provided ID and data.
   *
   * @param {string} id token string
   * @param {*} data reserved for future use
   * @param {number} usesRemaining
   *    Number of uses remaining until the token is exhausted
   * @param {number} nextReset
   *    Time when the token can be used again even if it's exhausted (unix timestamp)
   *
   * @returns {boolean} Was the token added to the pool?
   */
  add(id, data, usesRemaining, nextReset) {
    if (this.tokenIds.has(id)) {
      return false
    }
    this.tokenIds.add(id)

    usesRemaining = usesRemaining === undefined ? this.batchSize : usesRemaining
    nextReset = nextReset === undefined ? Token.nextResetNever : nextReset

    const token = new Token(id, data, usesRemaining, nextReset)
    this.fifoQueue.push(token)

    return true
  }

  // Prepare to start a new batch by obtaining and returning the next usable
  // token.
  _nextBatch() {
    let next

    while ((next = this.fifoQueue.shift())) {
      if (!next.isValid) {
        // Discard, and
        continue
      } else if (next.isExhausted) {
        next.freeze()
        this.priorityQueue.enq(next)
      } else {
        return next
      }
    }

    while (
      !this.priorityQueue.isEmpty() &&
      (next = this.priorityQueue.peek())
    ) {
      if (!next.isValid) {
        // Discard, and
        continue
      } else if (next.isExhausted) {
        // No need to check any more tokens, since they all reset after this
        // one.
        break
      } else {
        this.priorityQueue.deq() // deq next
        next.unfreeze()
        return next
      }
    }

    throw Error('Token pool is exhausted')
  }

  /**
   * Obtain the next available token, returning `null` if no tokens are
   * available.
   *
   * Tokens are initially pulled from a FIFO queue. The first token is used
   * for a batch of requests, then returned to the queue to give those
   * requests the opportunity to complete. The next token is used for the next
   * batch of requests.
   *
   * This strategy allows a token to be used for concurrent requests, not just
   * sequential request, and simplifies token recovery after errored and timed
   * out requests.
   *
   * By the time the original token re-emerges, its requests should have long
   * since completed. Even if a couple them are still running, they can
   * reasonably be ignored. The uses remaining won't be 100% correct, but
   * that's fine, because Shields uses only 75%
   *
   * The process continues until an exhausted token is pulled from the FIFO
   * queue. At that time it's placed in the priority queue based on its
   * scheduled reset time. To ensure the priority queue works as intended,
   * the scheduled reset time is frozen then.
   *
   * After obtaining a token using `next()`, invoke `update()` on it to set a
   * new use-remaining count and next-reset time. Invoke `invalidate()` to
   * indicate it should not be reused.
   *
   * @returns {module:core/token-pooling/token-pool~Token} token
   */
  next() {
    let token = this.currentBatch.token
    const remaining = this.currentBatch.remaining

    if (remaining <= 0 || !token.isValid || token.isExhausted) {
      token = this._nextBatch()
      this.currentBatch = {
        token,
        remaining: token.hasReset
          ? this.batchSize
          : Math.min(this.batchSize, token.usesRemaining),
      }
      this.fifoQueue.push(token)
    }

    this.currentBatch.remaining -= 1

    return token
  }

  /**
   * Iterate over all valid tokens.
   *
   * @param {Function} callback function to execute on each valid token
   */
  forEach(callback) {
    function visit(item) {
      if (item.isValid) {
        callback(item)
      }
    }

    this.fifoQueue.forEach(visit)
    this.priorityQueue.forEach(visit)
  }
}

export { sanitizeToken, Token, TokenPool }
