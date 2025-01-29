import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock HTMLCanvasElement methods
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  getParameter: vi.fn(),
  getExtension: vi.fn(),
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
}));

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'three-canvas' }, children),
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
      capabilities: { isWebGL2: true },
      getContext: vi.fn(() => ({
        canvas: document.createElement('canvas'),
        isContextLost: () => false,
        loseContext: vi.fn(),
        restoreContext: vi.fn(),
      })),
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

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = vi.fn();

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));