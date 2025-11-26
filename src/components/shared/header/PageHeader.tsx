'use client';
import { PageHeaderProps } from '@/types/common';
import './pageheader.css';


export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="page-header">
            <div className="page-header-content">
                <div className="page-header-inner">
                    <h1 className="page-title">
                        <span className="page-title-gradient">
                            {title}
                        </span>
                    </h1>
                    {subtitle && (
                        <p className="page-subtitle">
                        {subtitle}
                        </p>
                    )}
                    {action && (
                        <div className="page-header-action">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}