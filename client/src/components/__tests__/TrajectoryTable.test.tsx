import { render, screen, fireEvent } from '@testing-library/react';
import { TrajectoryTable } from '../TrajectoryTable';
import { TrajectoryPoint } from '@/types';

describe('TrajectoryTable', () => {
  const mockOnExport = jest.fn();
  
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

  it('renders empty state when no data', () => {
    render(<TrajectoryTable data={[]} onExport={mockOnExport} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders data when provided', () => {
    render(<TrajectoryTable data={sampleData} onExport={mockOnExport} />);
    expect(screen.getByText('50.00')).toBeInTheDocument(); // velocity
    expect(screen.getByText('2500')).toBeInTheDocument(); // spin
  });

  it('calls export function when button clicked', () => {
    render(<TrajectoryTable data={sampleData} onExport={mockOnExport} />);
    const exportButton = screen.getByText(/export to csv/i);
    fireEvent.click(exportButton);
    expect(mockOnExport).toHaveBeenCalled();
  });
});
