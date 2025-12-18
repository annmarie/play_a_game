class CSRFHttpClient {
  constructor(allowedHosts = ['localhost', '127.0.0.1']) {
    this.token = null;
    this.sessionId = null;
    this.allowedHosts = allowedHosts;
  }

  async fetchToken() {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      this.token = data.token;
      this.sessionId = data.sessionId;

      return this.token;
    } catch (error) {
      console.error('CSRF token fetch failed:', error);
      throw error;
    }
  }

  validateUrl(url) {
    try {
      const urlObj = new URL(url, window.location.origin);
      return this.allowedHosts.includes(urlObj.hostname);
    } catch {
      return false;
    }
  }

  async request(url, options = {}) {
    if (!this.validateUrl(url)) {
      throw new Error('URL not allowed');
    }

    if (!this.token) {
      await this.fetchToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': this.token,
      ...options.headers
    };

    const body = options.body ? {
      ...options.body,
      csrfToken: this.token,
      sessionId: this.sessionId
    } : undefined;

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (response.status === 403) {
      // Token might be expired, retry once
      await this.fetchToken();
      headers['X-CSRF-Token'] = this.token;

      if (!this.validateUrl(url)) {
        throw new Error('URL not allowed');
      }

      const retryBody = body ? {
        ...options.body,
        csrfToken: this.token,
        sessionId: this.sessionId
      } : undefined;

      return fetch(url, {
        ...options,
        credentials: 'include',
        headers,
        body: retryBody ? JSON.stringify(retryBody) : undefined
      });
    }

    return response;
  }
}

export const csrfHttpClient = new CSRFHttpClient();
