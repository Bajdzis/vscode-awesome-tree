import * as React from 'react';
import { MouseEventHandler } from 'react';
import './Button.css';

interface ButtonProps {
    primary?: boolean;
    className?: string;
    children?: React.ReactNode;
    onClick?:MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ( {primary = true, className = '', children, onClick}) => {
    return <button className={`button ${primary ? 'button--primary':''} ${className}`} onClick={onClick}>{children}</button>;
};
