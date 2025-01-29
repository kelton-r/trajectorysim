import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock WebGL context with proper shader precision format support
const mockWebGLContext = {
  getParameter: vi.fn(() => 'high'),
  getExtension: vi.fn(() => ({
    loseContext: vi.fn(),
    restoreContext: vi.fn()
  })),
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
  getShaderPrecisionFormat: vi.fn(() => ({
    precision: 'high',
    rangeMin: 1,
    rangeMax: 1
  })),
};

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = vi.fn((contextType) => {
  if (contextType === 'webgl2' || contextType === 'webgl') {
    return mockWebGLContext;
  }
  return null;
});

// Mock Three.js components
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
        precision: 'high',
      },
      getContext: () => mockWebGLContext,
      dispose: vi.fn(),
      info: {
        autoReset: true,
        reset: vi.fn(),
      },
    },
    scene: {},
  })),
}));

vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: () => null,
  OrbitControls: () => null,
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(() => cb(performance.now()), 0));
global.cancelAnimationFrame = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Set up WebGL context constructors
Object.defineProperty(window, 'WebGLRenderingContext', {
  value: vi.fn(() => mockWebGLContext),
  writable: true,
});

Object.defineProperty(window, 'WebGL2RenderingContext', {
  value: vi.fn(() => mockWebGLContext),
  writable: true,
});