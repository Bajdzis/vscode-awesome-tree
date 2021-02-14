import { useState } from 'react';


export function useVscodeState<T> (initialState:T){

    const vscode = window.acquireVsCodeApi<T>();
    
    const [state, setReactState] = useState(() => vscode.getState() || initialState);

    const setState = (newState: Partial<T>) => {
        const fullState: T = {
            ...state,
            ...newState
        };
        
        setReactState(fullState);
        vscode.setState(fullState);
    };

    return {
        state,
        setState
    };

}
