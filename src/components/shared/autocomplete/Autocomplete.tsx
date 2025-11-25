'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import './autocomplete.css';

// ============================================
// TYPES
// ============================================

export interface AutocompleteOption {
    id: string | number;
    name: string;
}

export interface AutocompleteProps {
    placeholder: string;
    options: AutocompleteOption[];
    value?: AutocompleteOption | null; // Controlled value
    onSelect?: (option: AutocompleteOption | null) => void;
    onSearch?: (query: string) => void;
    debounceMs?: number; // Debounce delay in milliseconds (default: 300)
    minChars?: number; // Minimum characters to trigger search (default: 2)
}

// ============================================
// COMPONENT
// ============================================

export default function Autocomplete({
    placeholder,
    options,
    value,
    onSelect,
    onSearch,
    debounceMs = 300,
    minChars = 2,
}: AutocompleteProps) {
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [filteredOptions, setFilteredOptions] = useState<AutocompleteOption[]>([]);

    // ============================================
    // REFS
    // ============================================
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const justSelectedRef = useRef<boolean>(false);

    // ============================================
    // SYNC WITH CONTROLLED VALUE
    // ============================================
    useEffect(() => {
        if (value === null) {
            setQuery('');
            setIsOpen(false);
            justSelectedRef.current = false;
        } else if (value) {
            setQuery(value.name);
            setIsOpen(false);
            justSelectedRef.current = true;
        }
    }, [value]);

    // ============================================
    // FILTERING & DEBOUNCED SEARCH
    // ============================================
    const filterOptions = useCallback((searchQuery: string) => {
        if (searchQuery.length < minChars) {
            setFilteredOptions([]);
            setIsOpen(false);
            return;
        }

        const filtered = options.filter((option) =>
            option.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredOptions(filtered);
        setIsOpen(true);
    }, [options, minChars]);

    // Debounced search with selection tracking to prevent dropdown reopening
    useEffect(() => {
        // Skip filtering if we just selected a value
        if (justSelectedRef.current) {
            justSelectedRef.current = false;
            return;
        }

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

    // ============================================
    // EVENT HANDLERS
    // ============================================
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        justSelectedRef.current = false;
        setQuery(value);
        setHighlightedIndex(-1);

        if (value === '') {
            onSelect?.(null);
        }
    };

    const handleSelect = (option: AutocompleteOption) => {
        setQuery(option.name);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onSelect?.(option);
        inputRef.current?.blur();
    };

    const handleClear = () => {
        setQuery('');
        setFilteredOptions([]);
        setIsOpen(false);
        setHighlightedIndex(-1);
        onSelect?.(null);
        inputRef.current?.focus();
    };

    // ============================================
    // ACCESSIBILITY - CLICK OUTSIDE & KEYBOARD NAVIGATION
    // ============================================
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;

            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;

            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;

            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setHighlightedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0) {
            const highlightedElement = document.querySelector(
                `.autocomplete-option[data-index="${highlightedIndex}"]`
            );
            highlightedElement?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [highlightedIndex]);

    return (
        <div className='autocomplete' ref={containerRef}>
            {/* Search Input */}
            <div className='autocomplete-input-wrapper'>
                <Search className='autocomplete-icon-search' size={16} />
                <input
                    ref={inputRef}
                    type='text'
                    className='autocomplete-input'
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete='list'
                    aria-controls='autocomplete-results'
                    aria-expanded={isOpen}
                />
                {query && (
                    <button
                        className='autocomplete-clear'
                        onClick={handleClear}
                        aria-label='Clear search'
                        type='button'
                    >
                        <X size={16} />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && filteredOptions.length > 0 && (
                <div className='autocomplete-results' id='autocomplete-results' role='listbox'>
                    {filteredOptions.map((option, index) => (
                        <button
                            key={`${option.id}-${index}`}
                            className={`autocomplete-option ${
                                index === highlightedIndex ? 'autocomplete-option-highlighted' : ''
                            }`}
                            onClick={() => handleSelect(option)}
                            onMouseEnter={() => setHighlightedIndex(index)}
                            data-index={index}
                            role='option'
                            aria-selected={index === highlightedIndex}
                            type='button'
                        >
                            <div className='autocomplete-option-content'>
                                <div className='autocomplete-option-label'>{option.name}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No Results */}
            {isOpen && query.length >= minChars && filteredOptions.length === 0 && (
                <div className='autocomplete-no-results'>
                    No players found matching &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}
