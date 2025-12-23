require("@testing-library/jest-dom");
const { TextEncoder, TextDecoder } = require('text-encoding');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Suppress WebSocket console messages during tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = (...args) => {
    if (args[0]?.includes?.('WebSocket') || args[0]?.includes?.('Failed to connect')) {
      return; // Suppress WebSocket errors
    }
    originalConsoleError(...args);
  };

  console.log = (...args) => {
    if (args[0]?.includes?.('WebSocket')) {
      return; // Suppress WebSocket logs
    }
    originalConsoleLog(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

window.matchMedia = (query) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
});

Object.defineProperty(URL, "createObjectURL", {
  writable: true,
  value: jest.fn(),
});
