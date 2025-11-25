'use client';

/**
 * Pagination Component
 * Enhanced pagination with direct page number access
 * Shows first, last, current page ±2, with ellipsis for gaps
 */

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    // ============================================
    // HANDLERS
    // ============================================
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePageClick = (page: number) => {
        onPageChange(page);
    };

    // ============================================
    // GENERATE PAGE NUMBERS TO DISPLAY
    // ============================================
    const getPageNumbers = () => {
        const pages: (number | 'ellipsis')[] = [];
        const delta = 2; // Show 2 pages on each side of current page

        // Always show first page
        pages.push(1);

        // Calculate range around current page
        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        // Add ellipsis after first page if there's a gap
        if (rangeStart > 2) {
            pages.push('ellipsis');
        }

        // Add pages in range
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        // Add ellipsis before last page if there's a gap
        if (rangeEnd < totalPages - 1) {
            pages.push('ellipsis');
        }

        // Always show last page (if more than 1 page total)
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className='pagination-container'>
            {/* Previous Button */}
            <button
                className='pagination-button'
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label='Previous page'
            >
                ←
            </button>

            {/* Page Numbers */}
            <div className='pagination-pages'>
                {pageNumbers.map((page, index) => {
                    if (page === 'ellipsis') {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className='pagination-ellipsis'
                                aria-hidden='true'
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            className={`pagination-page-button ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageClick(page)}
                            aria-label={`Go to page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}
            </div>

            {/* Next Button */}
            <button
                className='pagination-button'
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label='Next page'
            >
                →
            </button>
        </div>
    );
}
