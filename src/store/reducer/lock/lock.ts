import { reducerWithInitialState } from 'typescript-fsa-reducers';
import { generateStarted, generateFinish } from '../../action/lock/lock';

export interface LockState {
    locked: boolean;
}

const INITIAL_STATE: LockState = {
    locked: false,
};

export const lockReducer = reducerWithInitialState<LockState>(INITIAL_STATE)
    .case(generateStarted, (state: LockState): LockState => ({
        ...state,
        locked: true,
    }))
    .case(generateFinish, (state: LockState): LockState => ({
        ...state,
        locked: false,
    }));
