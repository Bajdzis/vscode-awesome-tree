import * as React from 'react';

interface VsCodeApi<T = unknown> {
    getState: () => T;
    setState: (data: T) => void;
    postMessage: (msg: unknown) => void;
} 

declare global {
    interface Window { 
        acquireVsCodeApi: <T = unknown>() => VsCodeApi<T>
    }
}

const vscode = window.acquireVsCodeApi<any>();

const VscodeContext = React.createContext<VsCodeApi<any>>(vscode);

export function useAcquireVsCodeApi<T>(): VsCodeApi<T> {
    return React.useContext(VscodeContext);
}