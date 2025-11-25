'use client';

import type { DropdownOption } from '../dropdown/Dropdown';
import type { AutocompleteOption } from '../autocomplete/Autocomplete';
import type { MultiSelectOption } from '../multiselect/MultiSelect';
import type { MultiSelectAutocompleteOption } from '../multiselect-autocomplete/MultiSelectAutocomplete';
import Dropdown from '../dropdown/Dropdown';
import Autocomplete from '../autocomplete/Autocomplete';
import MultiSelect from '../multiselect/MultiSelect';
import MultiSelectAutocomplete from '../multiselect-autocomplete/MultiSelectAutocomplete';
import './filtersbar.css';

// ============================================
// TYPES
// ============================================

export type FiltersBarItem =
    | {
        label: string;
        type: 'dropdown';
        data: readonly DropdownOption[];
        onChange?: (option: DropdownOption) => void;
        selectFirstByDefault?: boolean;
        defaultValue?: string | number;
        minWidth?: string;
      }
    | {
        label: string;
        type: 'multiselect';
        data: readonly MultiSelectOption[];
        onChange?: (selectedValues: (string | number)[]) => void;
        defaultValues?: (string | number)[];
        placeholder?: string;
        minWidth?: string;
      }
    | {
        label: string;
        type: 'autocomplete';
        data: AutocompleteOption[];
        placeholder: string;
        value?: AutocompleteOption | null;
        onChange?: (option: AutocompleteOption | null) => void;
        minWidth?: string;
      }
    | {
        label: string;
        type: 'multiselect-autocomplete';
        data: MultiSelectAutocompleteOption[];
        placeholder: string;
        values?: MultiSelectAutocompleteOption[];
        onChange?: (options: MultiSelectAutocompleteOption[]) => void;
        maxSelections?: number;
        minWidth?: string;
      }
    | {
        label: string;
        type: 'number';
        placeholder: string;
        value?: number;
        onChange?: (value: number | null) => void;
        minWidth?: string;
      };

export interface FiltersBarProps {
    items: FiltersBarItem[] | FiltersBarItem[][];
}

// ============================================
// COMPONENT
// ============================================

export default function FiltersBar({ items }: FiltersBarProps) {
    // Check if items is a 2D array (multiple rows) or 1D array (single row)
    const isMultiRow = Array.isArray(items[0]) && items.length > 0;
    const rows: FiltersBarItem[][] = isMultiRow ? (items as FiltersBarItem[][]) : [items as FiltersBarItem[]];

    const renderFilterItem = (item: FiltersBarItem & { key?: string }) => {
        if (item.type === 'dropdown') {
            return (
                <div key={item.key || item.label} style={{ minWidth: item.minWidth }}>
                    <Dropdown
                        key={item.key} // Add key to force remount when it changes
                        label={item.label}
                        options={item.data}
                        onSelect={item.onChange}
                        selectFirstByDefault={item.selectFirstByDefault}
                        defaultValue={item.defaultValue}
                    />
                </div>
            );
        }

        if (item.type === 'multiselect') {
            return (
                <div key={item.label} style={{ minWidth: item.minWidth }}>
                    <MultiSelect
                        label={item.label}
                        options={item.data}
                        onChange={item.onChange}
                        defaultValues={item.defaultValues}
                        placeholder={item.placeholder}
                    />
                </div>
            );
        }

        if (item.type === 'autocomplete') {
            return (
                <div key={item.label} style={{ minWidth: item.minWidth }}>
                    <Autocomplete
                        placeholder={item.placeholder}
                        options={item.data}
                        value={item.value}
                        onSelect={item.onChange}
                    />
                </div>
            );
        }

        if (item.type === 'multiselect-autocomplete') {
            return (
                <div key={item.key || item.label} style={{ minWidth: item.minWidth }}>
                    <MultiSelectAutocomplete
                        placeholder={item.placeholder}
                        options={item.data}
                        values={item.values}
                        onChange={item.onChange}
                        maxSelections={item.maxSelections}
                    />
                </div>
            );
        }

        if (item.type === 'number') {
            return (
                <div key={item.label} className='dropdown' style={{ minWidth: item.minWidth }}>
                    <input
                        type='number'
                        placeholder={item.placeholder}
                        className='dropdown-toggle'
                        style={{ paddingRight: '0.75rem' }}
                        defaultValue={item.value}
                        onChange={(e) => {
                            const value = e.target.value ? Number(e.target.value) : null;
                            item.onChange?.(value);
                        }}
                    />
                </div>
            );
        }

        return null;
    };

    return (
        <div className='filters-bar'>
            {rows.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className='filters-bar-container'>
                    {row.map((item) => renderFilterItem(item))}
                </div>
            ))}
        </div>
    );
}