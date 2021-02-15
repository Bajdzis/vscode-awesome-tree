import { useState } from 'react';
import { useAcquireVsCodeApi } from './useAcquireVsCodeApi';


export function useVscodeState<T> (initialState:T){

    const vscode = useAcquireVsCodeApi<T>();
    
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
