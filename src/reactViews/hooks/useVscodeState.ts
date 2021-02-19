import { useEffect, useState } from 'react';
import { useAcquireVsCodeApi } from './useAcquireVsCodeApi';

const element = document.createElement('div');

function dispatchUpdateEvent <T>(state:T) {
    const event = new CustomEvent<{state: T}>('vscodeStateUpdate', {
        detail: {
            state
        }
    });
    element.dispatchEvent(event);
}

export function useVscodeState<T> (initialState:T){

    const vscode = useAcquireVsCodeApi<T>();
    
    const [state, setReactState] = useState(() => vscode.getState() || initialState);

    useEffect(() => {
        const handler = (e: CustomEvent<{state : T}>) => {
            setReactState(e.detail.state);
        };
        // @ts-ignore
        element.addEventListener('vscodeStateUpdate', handler);
        
        // @ts-ignore
        return () => element.removeEventListener('vscodeStateUpdate', handler);
    }, []);

    const setState = (newState: Partial<T>) => {
        const currentState = vscode.getState() || initialState;
        const fullState: T = {
            ...currentState,
            ...newState
        };
        vscode.setState(fullState);
        dispatchUpdateEvent(fullState);
    };

    return {
        state,
        setState
    };

}
