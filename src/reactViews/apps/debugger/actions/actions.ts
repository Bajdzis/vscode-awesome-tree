import actionCreatorFactory, { Action } from 'typescript-fsa';
import { RootState } from '../../../../store/reducer';

const debuggerActionCreator = actionCreatorFactory('DEBUGGER_WEBVIEW');

export interface DispatchActionParams {
    action: Action<any>,
    state: RootState,
}

export const dispatchAction = debuggerActionCreator<DispatchActionParams>('DISPATCH_ACTION');

