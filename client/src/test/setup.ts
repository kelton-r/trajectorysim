import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Enhanced WebGL context mock with proper shader precision format support
const mockWebGLContext = {
  getParameter: vi.fn(() => 'high'),
  getShaderPrecisionFormat: vi.fn(() => ({
    precision: 23,
    rangeMin: 126,
    rangeMax: 127
  })),
  getExtension: vi.fn((name) => {
    if (name === 'WEBGL_lose_context') {
      return {
        loseContext: vi.fn(),
        restoreContext: vi.fn()
      };
    }
    return null;
  }),
  createShader: vi.fn(() => ({ /* mock shader object */ })),
  createProgram: vi.fn(() => ({ /* mock program object */ })),
  createBuffer: vi.fn(() => ({ /* mock buffer object */ })),
  createTexture: vi.fn(() => ({ /* mock texture object */ })),
  viewport: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  useProgram: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  clear: vi.fn(),
};

// Mock canvas getContext to return our enhanced WebGL context
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return mockWebGLContext;
  }
  return null;
});

// Enhanced Three.js components mocking
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => 
    React.createElement('div', { 'data-testid': 'three-canvas' }, children),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({
    camera: {
      position: { set: vi.fn() },
      rotation: { set: vi.fn() },
      updateProjectionMatrix: vi.fn(),
    },
    gl: {
      domElement: document.createElement('canvas'),
      setSize: vi.fn(),
      render: vi.fn(),
      capabilities: {
        isWebGL2: true,
        precision: 'highp',
        maxPrecision: 'highp',
      },
      getContext: () => mockWebGLContext,
      dispose: vi.fn(),
      info: {
        autoReset: true,
        reset: vi.fn(),
      },
    },
    scene: {
      add: vi.fn(),
      remove: vi.fn(),
      children: [],
    },
  })),
}));

vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: () => null,
  OrbitControls: () => null,
  Loader: () => null,
}));

// Mock requestAnimationFrame and cancelAnimationFrame
window.requestAnimationFrame = vi.fn((cb) => setTimeout(() => cb(performance.now()), 0));
window.cancelAnimationFrame = vi.fn((id) => clearTimeout(id));

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock WebGL context constructors with enhanced precision support
const WebGLMock = vi.fn(() => ({
  ...mockWebGLContext,
  canvas: document.createElement('canvas'),
}));

Object.defineProperty(window, 'WebGLRenderingContext', {
  value: WebGLMock,
  writable: true,
});

Object.defineProperty(window, 'WebGL2RenderingContext', {
  value: WebGLMock,
  writable: true,
});

// Mock console methods to catch WebGL warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (!args[0]?.includes?.('WebGL')) {
    originalConsoleError(...args);
  }
};