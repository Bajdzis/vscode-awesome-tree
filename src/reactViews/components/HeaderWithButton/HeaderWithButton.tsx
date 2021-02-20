import * as React from 'react';

interface HeaderWithButtonProps {
    title: string;
    count: number;
    children?: React.ReactNode;
}

export const HeaderWithButton: React.FC<HeaderWithButtonProps> = ({title, count, children}) => {
    return <h2 style={{display:'flex',justifyContent: 'space-between'}}>
        <span>{title} <span>( {count} )</span></span>
        <div>
            {children}
        </div>
    </h2>;
};
