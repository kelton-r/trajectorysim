import { render, screen, fireEvent } from '@testing-library/react';
import { WeatherConditions } from '../WeatherConditions';

describe('WeatherConditions', () => {
  const mockOnWeatherChange = jest.fn();

  beforeEach(() => {
    render(<WeatherConditions onWeatherChange={mockOnWeatherChange} />);
  });

  it('renders all weather inputs', () => {
    expect(screen.getByLabelText(/wind speed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/air pressure/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/humidity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temperature/i)).toBeInTheDocument();
  });

  it('updates wind speed and calls onChange', () => {
    const windInput = screen.getByLabelText(/wind speed/i);
    fireEvent.change(windInput, { target: { value: '15' } });
    expect(mockOnWeatherChange).toHaveBeenCalledWith(expect.objectContaining({
      windSpeed: 15
    }));
  });

  it('updates air pressure and calls onChange', () => {
    const pressureInput = screen.getByLabelText(/air pressure/i);
    fireEvent.change(pressureInput, { target: { value: '1020' } });
    expect(mockOnWeatherChange).toHaveBeenCalledWith(expect.objectContaining({
      airPressure: 1020
    }));
  });

  it('constrains inputs to their min/max values', () => {
    const windInput = screen.getByLabelText(/wind speed/i);
    fireEvent.change(windInput, { target: { value: '1000' } });
    expect(windInput).toHaveAttribute('max', '50');
  });
});
