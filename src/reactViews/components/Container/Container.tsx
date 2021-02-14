import * as React from 'react';
import './Container.css';

interface ContainerProps {
    children?: React.ReactNode;
}

export const Container: React.FC<ContainerProps> = ( {children}) => {
    return <div className="container">{children}</div>;
};
