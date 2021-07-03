import React = require('react');
import { Action, ActionCreator } from 'typescript-fsa';

export function checkAction<T>(creator: ActionCreator<T>, someAction: Action<any>): someAction is Action<T> {
    return someAction.type === creator.type;
}

export function useActionHandler<T>(creator: ActionCreator<T>, handler: (action: Action<T>) => void) {

    React.useEffect(() => {
        const handlerMessage = ({data}: MessageEvent<any>) => {
            if (checkAction(creator, data)) {
                handler(data);
            }
        };
        window.addEventListener('message',handlerMessage);
        return () => window.removeEventListener('message',handlerMessage);
    },[handler]);
}
