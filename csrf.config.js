// CSRF Configuration
export const CSRF_CONFIG = {
  // Token settings
  TOKEN_LENGTH: 32,
  TOKEN_EXPIRY: 30 * 60 * 1000, // 30 minutes
  SESSION_EXPIRY: 60 * 60 * 1000, // 1 hour
  
  // Security settings
  RATE_LIMIT_WINDOW: 50, // milliseconds between messages
  MAX_MESSAGE_SIZE: 10000, // bytes
  MAX_RECONNECT_ATTEMPTS: 5,
  
  // Allowed origins (should match your frontend URLs)
  ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  
  // Cookie settings
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600 // 1 hour
  },
  
  // Headers for security
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'"
  }
};