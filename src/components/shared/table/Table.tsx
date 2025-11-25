'use client';

import type {
    ColumnDef,
    TableOptions,
    SortingState,
    OnChangeFn,
} from '@tanstack/react-table';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
} from '@tanstack/react-table';
import './table.css';

// Extend TanStack Table meta to include sticky property
declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData, TValue> {
        sticky?: boolean;
    }
}

// ============================================
// TYPES
// ============================================

interface TableProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;
    enableSorting?: boolean;
    tableOptions?: Partial<Omit<TableOptions<TData>, 'data' | 'columns' | 'getCoreRowModel'>>;
}

// ============================================
// COMPONENT
// ============================================

export default function Table<TData>({
    data,
    columns,
    sorting,
    onSortingChange,
    enableSorting = false,
    tableOptions
}: TableProps<TData>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        enableSorting,
        manualSorting: true,  // Tell TanStack Table we're handling sorting manually (backend)
        state: {
            sorting: sorting || [],
        },
        onSortingChange,
        ...tableOptions,
    });

    // ============================================
    // HELPER: Get column group info for data cells
    // ============================================
    const getColumnGroupInfo = (cellIndex: number) => {
        const headerGroups = table.getHeaderGroups();
        if (headerGroups.length < 2) return { isLastInGroup: false };

        // Get the first header row (group headers)
        const groupHeaderRow = headerGroups[0];

        // Track column position
        let currentPos = 0;

        for (let i = 0; i < groupHeaderRow.headers.length; i++) {
            const groupHeader = groupHeaderRow.headers[i];
            const groupSpan = groupHeader.colSpan;

            // Check if this cell is within this group
            if (cellIndex >= currentPos && cellIndex < currentPos + groupSpan) {
                // Check if it's the last column in this group
                const isLast = cellIndex === currentPos + groupSpan - 1;
                // Don't add border after the very last column
                const isLastGroup = i === groupHeaderRow.headers.length - 1;

                return {
                    isLastInGroup: isLast && !isLastGroup,
                };
            }

            currentPos += groupSpan;
        }

        return { isLastInGroup: false };
    };

    return (
        <div className='stats-table-container'>
            <table className='stats-table'>
                <thead>
                    {table.getHeaderGroups().map((headerGroup, groupIndex) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header, headerIndex) => {
                                // For group headers (first row)
                                const isGroupRow = groupIndex === 0;
                                const isLastHeader = headerIndex === headerGroup.headers.length - 1;

                                // For non-group rows, check if this is the last column in its group
                                let shouldShowBorder = false;
                                if (isGroupRow) {
                                    shouldShowBorder = !isLastHeader;
                                } else {
                                    // Check if this column is the last in its parent group
                                    const { isLastInGroup } = getColumnGroupInfo(headerIndex);
                                    shouldShowBorder = isLastInGroup;
                                }

                                const canSort = !isGroupRow && header.column.getCanSort();

                                // Check if column is sticky
                                const isSticky = header.column.columnDef.meta?.sticky;
                                const className = [
                                    shouldShowBorder ? 'group-boundary' : '',
                                    isSticky ? 'sticky-column' : '',
                                ].filter(Boolean).join(' ');

                                return (
                                    <th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        className={className}
                                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                        style={canSort ? { cursor: 'pointer', userSelect: 'none' } : undefined}
                                    >
                                        {header.isPlaceholder ? null : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {canSort && (
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                                        {{
                                                            asc: ' ↑',
                                                            desc: ' ↓',
                                                        }[header.column.getIsSorted() as string] ?? ''}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell, cellIndex) => {
                                const { isLastInGroup: isLast } = getColumnGroupInfo(cellIndex);
                                const isSticky = cell.column.columnDef.meta?.sticky;
                                const className = [
                                    isLast ? 'group-boundary' : '',
                                    isSticky ? 'sticky-column' : '',
                                ].filter(Boolean).join(' ');

                                return (
                                    <td
                                        key={cell.id}
                                        className={className}
                                    >
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
