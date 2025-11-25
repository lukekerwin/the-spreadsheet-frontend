'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './dropdown.css';

// ============================================
// TYPES
// ============================================

export interface DropdownOption {
    label: string;
    value: number | string;
}

export interface DropdownProps {
    label: string;
    options: readonly DropdownOption[];
    onSelect?: (option: DropdownOption) => void;
    defaultValue?: string | number;
    selectFirstByDefault?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export default function Dropdown({ label, options, onSelect, defaultValue, selectFirstByDefault = false }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initialize with default value or first option
    useEffect(() => {
        if (options.length === 0) return;
        if (selectedOption !== null) return; // Already initialized

        let initialOption: DropdownOption | null = null;

        // Check if defaultValue is provided
        if (defaultValue !== undefined) {
            const foundOption = options.find(opt => opt.value === defaultValue);
            if (foundOption) {
                initialOption = foundOption;
            }
        }

        // If no defaultValue or not found, and selectFirstByDefault is true, use first option
        if (!initialOption && selectFirstByDefault) {
            initialOption = options[0] as DropdownOption;
        }

        // Set the initial option and notify parent
        if (initialOption) {
            setSelectedOption(initialOption);
            onSelect?.(initialOption);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount - intentionally ignoring dependencies

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen(!isOpen);

    // Close dropdown
    const closeDropdown = () => setIsOpen(false);

    // Handle option selection
    const handleSelect = (option: DropdownOption) => {
        setSelectedOption(option);
        setIsOpen(false);
        onSelect?.(option);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                closeDropdown();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    return (
        <div className='dropdown' ref={dropdownRef}>
            {/* Dropdown Button */}
            <button
                className={`dropdown-toggle ${isOpen ? 'dropdown-toggle-open' : ''}`}
                onClick={toggleDropdown}
                aria-label={`${label} filter`}
                aria-haspopup='true'
                aria-expanded={isOpen}
            >
                <span className='dropdown-label'>
                    {selectedOption ? selectedOption.label : label}
                </span>
                <ChevronDown
                    className={`dropdown-icon ${isOpen ? 'dropdown-icon-open' : ''}`}
                    size={16}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className='dropdown-menu' role='menu'>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`dropdown-item ${selectedOption?.value === option.value ? 'dropdown-item-selected' : ''}`}
                            onClick={() => handleSelect(option)}
                            role='menuitem'
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
