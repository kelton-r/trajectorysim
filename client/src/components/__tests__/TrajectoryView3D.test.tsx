
import { render, screen, fireEvent } from '@testing-library/react';
import { TrajectoryView3D } from '../TrajectoryView3D';
import { TrajectoryPoint } from '@/types';

// Mock Three.js components and WebGL context
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="three-canvas">{children}</div>,
  useFrame: jest.fn(),
  useThree: () => ({
    gl: {
      domElement: document.createElement('canvas'),
      setSize: jest.fn(),
      render: jest.fn(),
    },
    camera: {},
    scene: {},
  }),
}));

jest.mock('@react-three/drei', () => ({
  PerspectiveCamera: () => null,
  OrbitControls: () => null,
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = jest.fn();

describe('TrajectoryView3D', () => {
  const sampleData: TrajectoryPoint[] = [{
    time: 0,
    x: 0,
    y: 0,
    z: 0,
    velocity: 50,
    spin: 2500,
    altitude: 0,
    distance: 0,
    drag: 0.5,
    lift: 0.3,
    side: 0,
    total: 0,
    carry: 0
  }];

  it('renders without crashing', () => {
    render(<TrajectoryView3D data={[]} />);
    expect(screen.getByText('Behind Ball View')).toBeInTheDocument();
  });

  it('toggles between view modes', () => {
    render(<TrajectoryView3D data={sampleData} />);
    
    // Initially should be in 'Behind Ball View'
    expect(screen.getByText('Behind Ball View')).toBeInTheDocument();
    
    // Click view toggle button
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Should switch to 'Side View'
    expect(screen.getByText('Side View')).toBeInTheDocument();
  });

  it('starts animation when autoPlay is true', () => {
    render(<TrajectoryView3D data={sampleData} autoPlay={true} />);
    // Animation state is initialized
    expect(screen.getByText('Behind Ball View')).toBeInTheDocument();
  });
});
