import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Loading } from '../Loading';

describe('Loading', () => {
  it('renders loading text', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
