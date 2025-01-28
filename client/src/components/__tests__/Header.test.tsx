import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../layout/Header';

describe('Header', () => {
  beforeEach(() => {
    render(<Header />);
  });

  it('renders the header with logo and title', () => {
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { 
      name: /golf shot trajectory optimizer/i 
    })).toBeInTheDocument();
    expect(screen.getByTestId('golf-logo')).toBeInTheDocument();
  });

  it('renders settings button and dropdown', () => {
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();

    fireEvent.click(settingsButton);
    expect(screen.getByText(/units: imperial/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByText(/help/i)).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('h-[60px]', 'border-b', 'bg-white');
    
    const logo = screen.getByTestId('golf-logo');
    expect(logo).toHaveClass('h-8', 'w-8', 'text-[#D92429]');
  });
});
