
import { resetState } from './acquireVsCodeApiMock';
import { renderHook, act } from '@testing-library/react-hooks';
import { useVscodeState } from './useVscodeState';

describe('useVscodeState', () => {

    beforeEach(() => {
        resetState();
    });

    it('should return initialState', () => {
        const initialState = {
            name: 'Rafal',
            age: 26
        };

        const hook = renderHook(() => useVscodeState(initialState));
        
        expect(hook.result.current.state).toEqual(initialState);
    });

    it('should update partial state', async () => {
        const initialState = {
            name: 'Rafal',
            age: 26
        };

        const { result } = renderHook(() => useVscodeState(initialState));

        act(() => {
            result.current.setState({
                age: 25
            });
        });

        expect(result.current.state).toEqual({
            name: 'Rafal',
            age: 25
        });
    });

    it('should have one global state for app', async () => {
        const initialState = {
            fileName: 'script',
            extension: 'js'
        };

        const HookInAppComponent = renderHook(() => useVscodeState(initialState));
        const HookInSomeComponent = renderHook(() => useVscodeState(initialState));

        expect(HookInAppComponent.result.current.state).toEqual(initialState);
        expect(HookInSomeComponent.result.current.state).toEqual(initialState);

        act(() => {
            HookInSomeComponent.result.current.setState({
                extension: 'ts'
            });
        });
        
        expect(HookInSomeComponent.result.current.state.extension).toEqual('ts');
        expect(HookInSomeComponent.result.current.state).toEqual(HookInAppComponent.result.current.state);
    });
});
