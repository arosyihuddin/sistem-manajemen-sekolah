import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generatePaginationRange(
  currentPage: number,
  totalPages: number,
  displayPages: number = 5
): (number | string)[] {
  const pages: (number | string)[] = [];

  if (totalPages <= displayPages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, currentPage - Math.floor(displayPages / 2));
  const rangeEnd = Math.min(totalPages - 1, rangeStart + displayPages - 3);

  // Add dots after first page if needed
  if (rangeStart > 2) {
    pages.push('...');
  }

  // Add pages in range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add dots before last page if needed
  if (rangeEnd < totalPages - 1) {
    pages.push('...');
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}