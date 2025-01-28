import { render, screen, fireEvent } from '@testing-library/react';
import { ShotParameters } from '../ShotParameters';

describe('ShotParameters', () => {
  const mockOnCalculate = jest.fn();

  beforeEach(() => {
    render(<ShotParameters onCalculate={mockOnCalculate} />);
  });

  it('renders all input fields', () => {
    expect(screen.getByLabelText(/launch velocity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/launch angle/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/spin rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/wind direction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ball type/i)).toBeInTheDocument();
  });

  it('updates launch velocity and allows calculation', () => {
    const velocityInput = screen.getByLabelText(/launch velocity/i);
    fireEvent.change(velocityInput, { target: { value: '45' } });
    
    const calculateButton = screen.getByText(/display shot/i);
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).toHaveBeenCalledWith(expect.objectContaining({
      launchVelocity: 45
    }));
  });

  it('validates inputs before calculation', () => {
    const velocityInput = screen.getByLabelText(/launch velocity/i);
    fireEvent.change(velocityInput, { target: { value: '-1' } });
    
    const calculateButton = screen.getByText(/display shot/i);
    fireEvent.click(calculateButton);

    expect(mockOnCalculate).not.toHaveBeenCalled();
  });
});
