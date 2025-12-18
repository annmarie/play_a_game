const crypto = require('crypto');

class CSRFProtection {
  constructor() {
    this.tokens = new Map();
    this.tokenExpiry = 30 * 60 * 1000; // 30 minutes
  }

  generateToken(sessionId) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + this.tokenExpiry;
    this.tokens.set(sessionId, { token, expiry });
    this.cleanup();
    return token;
  }

  validateToken(sessionId, providedToken) {
    const tokenData = this.tokens.get(sessionId);
    if (!tokenData || Date.now() > tokenData.expiry) {
      this.tokens.delete(sessionId);
      return false;
    }

    try {
      return crypto.timingSafeEqual(
        Buffer.from(tokenData.token),
        Buffer.from(providedToken)
      );
    } catch {
      return false;
    }
  }

  revokeToken(sessionId) {
    this.tokens.delete(sessionId);
  }

  cleanup() {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expiry) {
        this.tokens.delete(sessionId);
      }
    }
  }
}

module.exports = CSRFProtection;
