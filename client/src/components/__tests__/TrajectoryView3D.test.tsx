import { render, screen, act } from '@testing-library/react';
import { TrajectoryView3D } from '../TrajectoryView3D';
import { TrajectoryPoint } from '@/types';
import * as THREE from 'three';

// Mock performance.now()
const mockPerformanceNow = jest.fn(() => 0);
global.performance.now = mockPerformanceNow;

// Mock Three.js WebGLRenderer
jest.mock('three', () => {
  const actualThree = jest.requireActual('three');
  return {
    ...actualThree,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      domElement: document.createElement('canvas'),
      shadowMap: {},
      setPixelRatio: jest.fn(),
      setClearColor: jest.fn(),
      forceContextLoss: jest.fn(),
      getContext: jest.fn(),
    })),
  };
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 0);
});

const mockCancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

global.requestAnimationFrame = mockRequestAnimationFrame;
global.cancelAnimationFrame = mockCancelAnimationFrame;

describe('TrajectoryView3D', () => {
  const mockData: TrajectoryPoint[] = [
    { x: 0, y: 0, z: 0, carry: 0, total: 0, time: 0 },
    { x: 1, y: 1, z: 1, carry: 1, total: 1, time: 0.1 },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<TrajectoryView3D data={mockData} />);
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('renders with empty data', () => {
    render(<TrajectoryView3D data={[]} />);
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });

  it('switches view modes correctly', () => {
    render(<TrajectoryView3D data={mockData} />);
    const viewButton = screen.getByRole('button', { name: /Eye/i });
    expect(viewButton).toBeInTheDocument();
  });
  it('toggles between view modes', () => {
    render(<TrajectoryView3D data={mockData} />);
    
    // Initially should be in 'Behind Ball View'
    expect(screen.getByText('Behind Ball View')).toBeInTheDocument();
    
    // Click view toggle button
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Should switch to 'Side View'
    expect(screen.getByText('Side View')).toBeInTheDocument();
  });

  it('starts animation when autoPlay is true', async () => {
    jest.useFakeTimers();
    render(<TrajectoryView3D data={mockData} autoPlay={true} />);
    
    // Advance timers to trigger animation frames
    act(() => {
      jest.advanceTimersByTime(2000); // Animation duration
    });
    
    expect(mockRequestAnimationFrame).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<TrajectoryView3D data={mockData} autoPlay={true} />);
    
    unmount();
    
    expect(mockCancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles WebGL context loss gracefully', () => {
    const { container } = render(<TrajectoryView3D data={mockData} />);
    const canvas = container.querySelector('canvas');
    
    // Simulate WebGL context loss
    if (canvas) {
      const contextLostEvent = new Event('webglcontextlost');
      act(() => {
        canvas.dispatchEvent(contextLostEvent);
      });
    }
    
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
  });
});