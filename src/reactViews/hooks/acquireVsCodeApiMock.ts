
let globalVsCodeState: any = null;

global.window.acquireVsCodeApi = <T>() => ({
    getState: () => (globalVsCodeState as any as T),
    setState: (newState) => {globalVsCodeState = newState;},
    postMessage: () => {}
});

export const resetState = () => {
    globalVsCodeState = null;
};
