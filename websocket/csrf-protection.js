import crypto from 'crypto';

class CSRFProtection {
  constructor() {
    this.crypto = crypto;
    this.tokens = new Map(); // Store tokens with expiration
    this.tokenExpiry = 30 * 60 * 1000; // 30 minutes
  }

  generateToken(sessionId) {
    const token = this.crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + this.tokenExpiry;

    this.tokens.set(sessionId, { token, expiry });

    this.cleanupExpiredTokens();

    return token;
  }
  validateToken(sessionId, providedToken) {
    const tokenData = this.tokens.get(sessionId);

    if (!tokenData) return false;
    if (Date.now() > tokenData.expiry) {
      this.tokens.delete(sessionId);
      return false;
    }

    try {
      return this.crypto.timingSafeEqual(Buffer.from(tokenData.token), Buffer.from(providedToken));
    } catch (err) {
      return false;
    }
  }
  cleanupExpiredTokens() {
    const now = Date.now();
    for (const [sessionId, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expiry) {
        this.tokens.delete(sessionId);
      }
    }
  }

  revokeToken(sessionId) {
    this.tokens.delete(sessionId);
  }
}

module.exports = CSRFProtection;
