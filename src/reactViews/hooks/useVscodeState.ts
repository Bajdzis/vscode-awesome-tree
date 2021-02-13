import { useState } from 'react';


export function useVscodeState<T> (initialState:T){

    const vscode = window.acquireVsCodeApi<T>();
    
    const [state, setReactState] = useState(() => vscode.getState() || initialState);

    const setState = (state: T) => {
        setReactState(state);
        vscode.setState(state);
    };

    return {
        state,
        setState
    };

}
