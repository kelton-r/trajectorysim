import { render, screen, fireEvent } from '@testing-library/react';
import { ShotParameters } from '../ShotParameters';

describe('ShotParameters', () => {
  const mockOnCalculate = jest.fn();

  beforeEach(() => {
    render(<ShotParameters onCalculate={mockOnCalculate} />);
  });

  it('renders all input fields', () => {
    expect(screen.getByLabelText(/Launch Velocity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Launch Angle/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Spin/)).toBeInTheDocument();
    expect(screen.getByText(/Wind Direction/)).toBeInTheDocument();
    expect(screen.getByText(/Ball Type/)).toBeInTheDocument();
  });

  it('updates launch velocity and allows calculation', async () => {
    const velocityInput = screen.getByLabelText(/Launch Velocity/);
    await userEvent.type(velocityInput, '45');
    
    const calculateButton = screen.getByText(/DISPLAY SHOT/i);
    await userEvent.click(calculateButton);

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
