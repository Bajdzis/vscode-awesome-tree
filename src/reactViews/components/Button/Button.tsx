import * as React from 'react';
import { MouseEventHandler } from 'react';
import './Button.css';

interface ButtonProps {
    primary?: boolean;
    children?: React.ReactNode;
    onClick?:MouseEventHandler<HTMLButtonElement>;
}

export const Button: React.FC<ButtonProps> = ( {primary = true, children, onClick}) => {
    return <button className={`button ${primary ? 'button--primary':''}`} onClick={onClick}>{children}</button>;
};
