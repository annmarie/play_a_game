const crypto = require('crypto');

class CSRFMiddleware {
  constructor() {
    this.tokens = new Map();
    this.tokenExpiry = 15 * 60 * 1000; // 15 minutes
  }

  generateToken(req, res, next) {
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = req.sessionID || crypto.randomUUID();
    
    this.tokens.set(sessionId, {
      token,
      expiry: Date.now() + this.tokenExpiry,
      origin: req.headers.origin
    });

    res.locals.csrfToken = token;
    res.locals.sessionId = sessionId;
    
    // Set secure cookie
    res.cookie('csrfToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.tokenExpiry
    });

    next();
  }

  validateToken(req, res, next) {
    const token = req.body.csrfToken || req.headers['x-csrf-token'];
    const sessionId = req.sessionID || req.cookies.sessionId;

    if (!token || !sessionId) {
      return res.status(403).json({ error: 'CSRF token missing' });
    }

    const tokenData = this.tokens.get(sessionId);
    if (!tokenData || Date.now() > tokenData.expiry) {
      this.tokens.delete(sessionId);
      return res.status(403).json({ error: 'CSRF token expired' });
    }

    if (tokenData.origin !== req.headers.origin) {
      return res.status(403).json({ error: 'Origin mismatch' });
    }

    try {
      const isValid = crypto.timingSafeEqual(
        Buffer.from(tokenData.token),
        Buffer.from(token)
      );
      
      if (!isValid) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
      }
    } catch (err) {
      return res.status(403).json({ error: 'CSRF validation failed' });
    }

    next();
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

module.exports = CSRFMiddleware;