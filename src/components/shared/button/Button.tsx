import Link from 'next/link';
import './button.css';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';
export type ButtonSize = 'small' | 'medium' | 'large';

interface BaseButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

interface ButtonAsLink extends BaseButtonProps {
    href: string;
    external?: boolean;
    onClick?: never;
    type?: never;
    disabled?: never;
}

interface ButtonAsButton extends BaseButtonProps {
    href?: never;
    external?: never;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

export type ButtonProps = ButtonAsLink | ButtonAsButton;

// ============================================
// COMPONENT
// ============================================

export default function Button({
    variant = 'primary',
    size = 'medium',
    className = '',
    children,
    icon,
    iconPosition = 'left',
    href,
    external = false,
    onClick,
    type = 'button',
    disabled = false,
}: ButtonProps) {
    // Build class names
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const disabledClass = disabled ? 'btn-disabled' : '';
    const combinedClassName = `${baseClass} ${variantClass} ${sizeClass} ${disabledClass} ${className}`.trim();

    // Render content with optional icon
    const content = (
        <>
            {icon && iconPosition === 'left' && <span className='btn-icon btn-icon-left'>{icon}</span>}
            <span className='btn-text'>{children}</span>
            {icon && iconPosition === 'right' && <span className='btn-icon btn-icon-right'>{icon}</span>}
            {variant === 'primary' && <div className='btn-primary-gradient'></div>}
        </>
    );

    // Render as link if href is provided
    if (href) {
        if (external) {
            return (
                <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={combinedClassName}
                >
                    {content}
                </a>
            );
        }
        return (
            <Link href={href} className={combinedClassName}>
                {content}
            </Link>
        );
    }

    // Render as button
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={combinedClassName}
        >
            {content}
        </button>
    );
}
