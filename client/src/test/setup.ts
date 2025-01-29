import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// WebGL context mock for Babylon.js
const mockWebGLContext = {
  getParameter: vi.fn(() => 'highp'),
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
  createShader: vi.fn(),
  createProgram: vi.fn(),
  createBuffer: vi.fn(),
  createTexture: vi.fn(),
  viewport: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  useProgram: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  clear: vi.fn(),
  drawArrays: vi.fn(),
  drawElements: vi.fn(),
  canvas: document.createElement('canvas')
} as unknown as WebGLRenderingContext;

// Mock canvas getContext
const getContextMock = vi.fn((contextType: string) => {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return mockWebGLContext;
  }
  return null;
});

// @ts-ignore - Override getContext prototype for testing
HTMLCanvasElement.prototype.getContext = getContextMock;

// Mock Babylon.js
vi.mock('react-babylonjs', () => ({
  Engine: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'babylon-canvas' }, children),
  Scene: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  SceneEventArgs: vi.fn()
}));

// Mock requestAnimationFrame and cancelAnimationFrame
const rAF = (cb: FrameRequestCallback): number => {
  return setTimeout(() => cb(performance.now()), 0);
};
window.requestAnimationFrame = vi.fn(rAF);
window.cancelAnimationFrame = vi.fn((id: number) => clearTimeout(id));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = vi.fn(() => new MockResizeObserver());

// Silence WebGL warnings in tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  if (!args[0]?.includes?.('WebGL')) {
    originalConsoleError(...args);
  }
};