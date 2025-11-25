'use client';

/**
 * MultiSelectAutocomplete Component
 * Dropdown-style multi-select with search functionality and checkboxes
 * Used for comparing multiple entities (e.g., players, teams)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import './multiselectautocomplete.css';

// ============================================
// TYPES
// ============================================

export interface MultiSelectAutocompleteOption {
    id: string | number;
    name: string;
}

export interface MultiSelectAutocompleteProps {
    placeholder: string;
    options: MultiSelectAutocompleteOption[];
    values?: MultiSelectAutocompleteOption[]; // Controlled values (selected items)
    onChange?: (options: MultiSelectAutocompleteOption[]) => void;
    onSearch?: (query: string) => void;
    debounceMs?: number; // Debounce delay in milliseconds (default: 300)
    minChars?: number; // Minimum characters to trigger filtering (default: 1)
    maxSelections?: number; // Maximum number of selections allowed (default: 10)
}

// ============================================
// COMPONENT
// ============================================

export default function MultiSelectAutocomplete({
    placeholder,
    options,
    values = [],
    onChange,
    onSearch,
    debounceMs = 300,
    minChars = 1,
    maxSelections = 10,
}: MultiSelectAutocompleteProps) {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<MultiSelectAutocompleteOption[]>(options);

    // ============================================
    // REFS
    // ============================================
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // ============================================
    // FILTERING & DEBOUNCED SEARCH
    // ============================================
    const filterOptions = useCallback((searchQuery: string) => {
        if (searchQuery.length < minChars) {
            setFilteredOptions(options);
            return;
        }

        // Filter options based on search query (keep both selected and unselected)
        const filtered = options.filter((option) =>
            option.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [options, minChars]);

    // Debounced search
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            filterOptions(query);
            onSearch?.(query);
        }, debounceMs);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [query, debounceMs, filterOptions, onSearch]);

    // Update filtered options when options prop changes
    useEffect(() => {
        filterOptions(query);
    }, [options, query, filterOptions]);

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
    };

    const handleToggleOption = (option: MultiSelectAutocompleteOption) => {
        const isSelected = values.some(v => v.id === option.id);

        if (isSelected) {
            // Remove from selection
            const newValues = values.filter(v => v.id !== option.id);
            onChange?.(newValues);
        } else {
            // Check max selections limit
            if (values.length >= maxSelections) {
                return;
            }
            // Add to selection
            const newValues = [...values, option];
            onChange?.(newValues);
        }
    };

    const handleClearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.([]);
        setQuery('');
    };

    const handleToggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            // Focus search input when opening
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    // ============================================
    // DISPLAY TEXT
    // ============================================
    const getDisplayText = () => {
        if (values.length === 0) {
            return placeholder;
        }
        if (values.length === 1) {
            return values[0].name;
        }
        return `${values.length} players selected`;
    };

    // ============================================
    // ACCESSIBILITY - CLICK OUTSIDE
    // ============================================
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className='multiselect-autocomplete' ref={containerRef}>
            {/* Toggle Button */}
            <button
                type='button'
                className={`multiselect-autocomplete-toggle ${isOpen ? 'multiselect-autocomplete-toggle-open' : ''}`}
                onClick={handleToggleDropdown}
                aria-expanded={isOpen}
                aria-haspopup='listbox'
            >
                <span className={`multiselect-autocomplete-label ${values.length === 0 ? 'multiselect-autocomplete-placeholder' : ''}`}>
                    {getDisplayText()}
                </span>
                <div className='multiselect-autocomplete-toggle-icons'>
                    {values.length > 0 && (
                        <X
                            size={16}
                            className='multiselect-autocomplete-clear-icon'
                            onClick={handleClearAll}
                        />
                    )}
                    <ChevronDown
                        size={16}
                        className={`multiselect-autocomplete-icon ${isOpen ? 'multiselect-autocomplete-icon-open' : ''}`}
                    />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className='multiselect-autocomplete-dropdown' role='listbox'>
                    {/* Search Input */}
                    <div className='multiselect-autocomplete-search'>
                        <Search className='multiselect-autocomplete-search-icon' size={16} />
                        <input
                            ref={inputRef}
                            type='text'
                            className='multiselect-autocomplete-search-input'
                            placeholder='Search...'
                            value={query}
                            onChange={handleInputChange}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {/* Max selections warning */}
                    {values.length >= maxSelections && (
                        <div className='multiselect-autocomplete-warning'>
                            Maximum {maxSelections} selections reached
                        </div>
                    )}

                    {/* Options List */}
                    <ul className='multiselect-autocomplete-options'>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = values.some(v => v.id === option.id);
                                const isDisabled = !isSelected && values.length >= maxSelections;

                                return (
                                    <li
                                        key={option.id}
                                        className={`multiselect-autocomplete-option ${isSelected ? 'multiselect-autocomplete-option-selected' : ''} ${isDisabled ? 'multiselect-autocomplete-option-disabled' : ''}`}
                                        onClick={() => !isDisabled && handleToggleOption(option)}
                                        role='option'
                                        aria-selected={isSelected}
                                    >
                                        <input
                                            type='checkbox'
                                            checked={isSelected}
                                            onChange={() => { }} // Controlled by parent onClick
                                            className='multiselect-autocomplete-checkbox'
                                            disabled={isDisabled}
                                        />
                                        <span className='multiselect-autocomplete-option-label'>{option.name}</span>
                                    </li>
                                );
                            })
                        ) : (
                            <li className='multiselect-autocomplete-no-results'>
                                No players found matching &quot;{query}&quot;
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
