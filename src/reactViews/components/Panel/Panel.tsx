import * as React from 'react';
import './Panel.css';

interface PanelProps {
    children?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ( {children}) => {
    return <div className="panel">
        <p className="panel__text">{children}</p>
    </div>;
};
