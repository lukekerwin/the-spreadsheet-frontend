'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import './multiselect.css';

// ============================================
// TYPES
// ============================================

export interface MultiSelectOption {
    label: string;
    value: number | string;
}

export interface MultiSelectProps {
    label: string;
    options: readonly MultiSelectOption[];
    onChange?: (selectedValues: (string | number)[]) => void;
    defaultValues?: (string | number)[];
    placeholder?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function MultiSelect({
    label,
    options,
    onChange,
    defaultValues = [],
    placeholder = 'Select...',
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValues, setSelectedValues] = useState<Set<string | number>>(
        new Set(defaultValues)
    );
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    // Toggle option selection
    const toggleOption = (value: string | number) => {
        const newSelected = new Set(selectedValues);

        if (newSelected.has(value)) {
            newSelected.delete(value);
        } else {
            newSelected.add(value);
        }

        setSelectedValues(newSelected);
        onChange?.(Array.from(newSelected));
    };

    // Clear all selections
    const clearAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedValues(new Set());
        onChange?.([]);
    };

    // Get display text
    const getDisplayText = () => {
        if (selectedValues.size === 0) {
            return placeholder;
        }

        const selectedLabels = options
            .filter(opt => selectedValues.has(opt.value))
            .map(opt => opt.label);

        if (selectedLabels.length === 1) {
            return selectedLabels[0];
        }

        return `${selectedLabels.length} selected`;
    };

    return (
        <div className='multiselect' ref={dropdownRef}>
            <button
                type='button'
                className={`multiselect-toggle ${isOpen ? 'multiselect-toggle-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup='listbox'
            >
                <span className={`multiselect-label ${selectedValues.size === 0 ? 'multiselect-placeholder' : ''}`}>
                    {getDisplayText()}
                </span>
                <div className='multiselect-toggle-icons'>
                    {selectedValues.size > 0 && (
                        <X
                            size={16}
                            className='multiselect-clear-icon'
                            onClick={clearAll}
                        />
                    )}
                    <ChevronDown
                        size={16}
                        className={`multiselect-icon ${isOpen ? 'multiselect-icon-open' : ''}`}
                    />
                </div>
            </button>

            {isOpen && (
                <ul className='multiselect-menu' role='listbox'>
                    {options.map((option) => {
                        const isSelected = selectedValues.has(option.value);
                        return (
                            <li
                                key={option.value}
                                className={`multiselect-option ${isSelected ? 'multiselect-option-selected' : ''}`}
                                onClick={() => toggleOption(option.value)}
                                role='option'
                                aria-selected={isSelected}
                            >
                                <input
                                    type='checkbox'
                                    checked={isSelected}
                                    onChange={() => {}} // Controlled by parent onClick
                                    className='multiselect-checkbox'
                                />
                                <span>{option.label}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
