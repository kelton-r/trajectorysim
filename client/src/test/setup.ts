
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Three.js components
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useFrame: () => {},
}));

vi.mock('@react-three/drei', () => ({
  PerspectiveCamera: () => null,
}));

// Mock class implementations
class WebGLRenderer {
  setSize() {}
  render() {}
}

global.WebGLRenderer = WebGLRenderer;
