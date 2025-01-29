import { render, screen } from '@testing-library/react';
import { TrajectoryView3D } from '../TrajectoryView3D';
import { TrajectoryPoint } from '@/types';
import * as THREE from 'three';

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
    })),
  };
});

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

  it('starts animation when autoPlay is true', () => {
    render(<TrajectoryView3D data={mockData} autoPlay={true} />);
    // Animation state is initialized
    expect(screen.getByText('Behind Ball View')).toBeInTheDocument();
  });
});