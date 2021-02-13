import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Footer } from './components/Footer/Footer';

declare global {
    interface Window { 
        acquireVsCodeApi: <T = unknown>() => {
            getState: () => T;
            setState: (data: T) => void;
            postMessage: (msg: unknown) => void;
        } 
    }
}

interface DebuggerState {
    events: []
}

const vscode = window.acquireVsCodeApi<DebuggerState>();
const initialState: DebuggerState = {
    events: [],
};

let state = vscode.getState() || initialState;

console.log(state);

const generateFiles = () => {
    vscode.postMessage({
        type: 'GENERATE_ALL'
    });
};




const DataProvider = () => {
    React.useEffect(() => {
        window.addEventListener('message', ({data}) => { 
            if (data.type === 'SET_DATA') {
                const { events } = data.payload;
                vscode.setState({ events });
            }
            console.log(data);
        });
        
    },[]);
    return <div>ooo tak !</div>;
};

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<div className="aaaa" onClick={generateFiles}>FROM REACT !!!<DataProvider /><Footer/></div>,rootElement);

