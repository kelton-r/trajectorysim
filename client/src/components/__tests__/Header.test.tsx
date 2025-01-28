import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../layout/Header';

describe('Header', () => {
  beforeEach(() => {
    render(<Header />);
  });

  it('renders the header with logo and title', () => {
    // Check for logo
    const logo = screen.getByTestId('golf-logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveClass('text-[#D92429]');

    // Check for title
    const title = screen.getByRole('heading', { name: /golf shot trajectory optimizer/i });
    expect(title).toBeInTheDocument();
  });

  it('renders settings button and opens dropdown', () => {
    // Find the settings button
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();

    // Click settings and check dropdown
    fireEvent.click(settingsButton);
    expect(screen.getByText(/units: imperial/i)).toBeInTheDocument();
    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByText(/help/i)).toBeInTheDocument();
  });

  it('maintains proper layout structure', () => {
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('h-[60px]', 'border-b', 'bg-white');
  });
});