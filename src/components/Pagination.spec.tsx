import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPaginate = vi.fn();

  beforeEach(() => {
    mockOnPaginate.mockClear();
  });

  it('should not render when totalItems fit on one page', () => {
    const { container } = render(
      <Pagination totalItems={3} onPaginate={mockOnPaginate} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls when there are more items than fit on one page', () => {
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();
    expect(screen.getByLabelText('Next page')).toBeDefined();
    expect(screen.getByLabelText('Previous page')).toBeDefined();
    expect(screen.getByLabelText('First page')).toBeDefined();
    expect(screen.getByLabelText('Last page')).toBeDefined();
  });

  it('should call onPaginate with initial pagination on mount', () => {
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    expect(mockOnPaginate).toHaveBeenCalledWith(0, 5);
  });

  it('should navigate to next page when next button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    mockOnPaginate.mockClear();
    const nextButton = screen.getByLabelText('Next page');
    await user.click(nextButton);

    expect(screen.getByText('Showing 6-10 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(5, 10);
  });

  it('should navigate to previous page when previous button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    // Go to page 2
    const nextButton = screen.getByLabelText('Next page');
    await user.click(nextButton);

    mockOnPaginate.mockClear();
    // Go back to page 1
    const prevButton = screen.getByLabelText('Previous page');
    await user.click(prevButton);

    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(0, 5);
  });

  it('should navigate to specific page when page number is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    mockOnPaginate.mockClear();
    // Click on page 5
    const page5Button = screen.getByLabelText('Page 5');
    await user.click(page5Button);

    expect(screen.getByText('Showing 21-25 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(20, 25);
  });

  it('should navigate to first page when first page button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    // Click last page button
    const lastButton = screen.getByLabelText('Last page');
    await user.click(lastButton);
    expect(screen.getByText('Showing 21-25 of 25 tasks')).toBeDefined();

    mockOnPaginate.mockClear();
    // Go to first page
    const firstButton = screen.getByLabelText('First page');
    await user.click(firstButton);

    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(0, 5);
  });

  it('should navigate to last page when last page button is clicked', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    mockOnPaginate.mockClear();
    const lastButton = screen.getByLabelText('Last page');
    await user.click(lastButton);

    expect(screen.getByText('Showing 21-25 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(20, 25);
    const page5Button = screen.getByLabelText('Page 5');
    expect(page5Button.getAttribute('aria-current')).toBe('page');
  });

  it('should disable previous and first buttons on first page', () => {
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    const prevButton = screen.getByLabelText(
      'Previous page'
    ) as HTMLButtonElement;
    const firstButton = screen.getByLabelText(
      'First page'
    ) as HTMLButtonElement;

    expect(prevButton.disabled).toBe(true);
    expect(firstButton.disabled).toBe(true);
  });

  it('should disable next and last buttons on last page', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    const lastButton = screen.getByLabelText('Last page');
    await user.click(lastButton);

    const nextButton = screen.getByLabelText('Next page') as HTMLButtonElement;
    const lastButtonAfter = screen.getByLabelText(
      'Last page'
    ) as HTMLButtonElement;

    expect(nextButton.disabled).toBe(true);
    expect(lastButtonAfter.disabled).toBe(true);
  });

  it('should change items per page when selector is changed', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();

    mockOnPaginate.mockClear();
    // Change to 10 items per page
    const selector = screen.getByDisplayValue('5') as HTMLSelectElement;
    await user.selectOptions(selector, '10');

    expect(screen.getByText('Showing 1-10 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(0, 10);
  });

  it('should reset to page 1 when changing items per page', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    // Go to page 2
    const nextButton = screen.getByLabelText('Next page');
    await user.click(nextButton);
    expect(screen.getByText('Showing 6-10 of 25 tasks')).toBeDefined();

    mockOnPaginate.mockClear();
    // Change items per page
    const selector = screen.getByDisplayValue('5') as HTMLSelectElement;
    await user.selectOptions(selector, '10');

    // Should be back on page 1
    expect(screen.getByText('Showing 1-10 of 25 tasks')).toBeDefined();
    expect(mockOnPaginate).toHaveBeenCalledWith(0, 10);
  });

  it('should show ellipsis between non-consecutive page numbers', () => {
    render(<Pagination totalItems={100} onPaginate={mockOnPaginate} />);

    // Should show ellipsis between page 1 and current page area
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('should highlight current page button', () => {
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    const page1Button = screen.getByLabelText('Page 1');
    expect(page1Button.className).toContain('bg-blue-500');
    expect(page1Button.className).toContain('text-white');
    expect(page1Button.getAttribute('aria-current')).toBe('page');
  });

  it('should use custom itemsLabel when provided', () => {
    render(
      <Pagination
        totalItems={25}
        onPaginate={mockOnPaginate}
        itemsLabel="items"
      />
    );

    expect(screen.getByText('Showing 1-5 of 25 items')).toBeDefined();
  });

  it('should update pagination when totalItems changes', () => {
    const { rerender } = render(
      <Pagination totalItems={25} onPaginate={mockOnPaginate} />
    );

    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();

    mockOnPaginate.mockClear();
    rerender(<Pagination totalItems={15} onPaginate={mockOnPaginate} />);

    expect(screen.getByText('Showing 1-5 of 15 tasks')).toBeDefined();
  });

  it('should reset to page 1 when totalItems changes and current page exceeds new total pages', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <Pagination totalItems={25} onPaginate={mockOnPaginate} />
    );

    // Go to page 5
    const page5Button = screen.getByLabelText('Page 5');
    await user.click(page5Button);
    expect(screen.getByText('Showing 21-25 of 25 tasks')).toBeDefined();

    mockOnPaginate.mockClear();
    // Reduce total items so page 5 no longer exists
    rerender(<Pagination totalItems={8} onPaginate={mockOnPaginate} />);

    // Should reset to page 1
    expect(screen.getByText('Showing 1-5 of 8 tasks')).toBeDefined();
  });

  it('should handle navigation with all page buttons', async () => {
    const user = userEvent.setup();
    render(<Pagination totalItems={25} onPaginate={mockOnPaginate} />);

    // Go to last page
    const lastButton = screen.getByLabelText('Last page');
    await user.click(lastButton);
    expect(screen.getByText('Showing 21-25 of 25 tasks')).toBeDefined();

    // Go to first page
    const firstButton = screen.getByLabelText('First page');
    await user.click(firstButton);
    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();

    // Go next
    const nextButton = screen.getByLabelText('Next page');
    await user.click(nextButton);
    expect(screen.getByText('Showing 6-10 of 25 tasks')).toBeDefined();

    // Go previous
    const prevButton = screen.getByLabelText('Previous page');
    await user.click(prevButton);
    expect(screen.getByText('Showing 1-5 of 25 tasks')).toBeDefined();
  });
});
