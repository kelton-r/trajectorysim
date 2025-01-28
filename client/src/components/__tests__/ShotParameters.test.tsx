
import { render, screen, fireEvent } from '@testing-library/react';
import { ShotParameters } from '../ShotParameters';
import userEvent from '@testing-library/user-event';

describe('ShotParameters', () => {
  const mockOnCalculate = jest.fn();

  beforeEach(() => {
    render(<ShotParameters onCalculate={mockOnCalculate} />);
  });

  it('renders all input fields', () => {
    expect(screen.getByLabelText(/Launch Velocity/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Launch Angle/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Spin/)).toBeInTheDocument();
    expect(screen.getByText(/Ball Type/)).toBeInTheDocument();
    expect(screen.getByText(/Wind Direction/)).toBeInTheDocument();
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

  it('validates inputs before calculation', async () => {
    const velocityInput = screen.getByLabelText(/Launch Velocity/);
    await userEvent.clear(velocityInput);
    await userEvent.type(velocityInput, '-1');
    
    const calculateButton = screen.getByText(/DISPLAY SHOT/i);
    await userEvent.click(calculateButton);

    expect(mockOnCalculate).not.toHaveBeenCalled();
  });
});
