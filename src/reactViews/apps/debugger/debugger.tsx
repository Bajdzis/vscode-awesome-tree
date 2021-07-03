import * as React from 'react';
import * as ReactDom from 'react-dom';
import { RootState } from '../../../store/reducer';
import { Container } from '../../components/Container/Container';
import { Footer } from '../../components/Footer/Footer';
import { useVscodeState } from '../../hooks/useVscodeState';
import { dispatchAction, DispatchActionParams } from './actions/actions';
import ReactJson from 'react-json-view';


const rootElement = document.getElementById('root');


interface DebuggerState {
    logs: DispatchActionParams[];
}

const initialState: DebuggerState = {
    logs: [{
        action: {
            type:'INIT',
            payload: {}
        },
        state: {} as any as RootState
    }]
};


const DebuggerComponent = () => {
    const {state : initState, setState : saveState} = useVscodeState<DebuggerState>(initialState);
    const [state, setState] = React.useState<DebuggerState>(initState);

    const [activeAction, setActiveAction] = React.useState<null|number>(null);

    React.useEffect(() => {
        saveState(state);
    }, [state]);

    React.useEffect(() => {
        const handler = ({data}: MessageEvent<any>) => {
            if (data.type === dispatchAction.type) {
                setState(state => ({
                    logs: [
                        data.payload as DispatchActionParams,
                        ...state.logs
                    ]
                }));
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    }, [state]);

    const activeActionIndex = activeAction === null ? 0 : activeAction;
    return <div>
        <div style={{display:'grid', gridTemplateColumns: '300px 1fr'}}>
            <div >
                {state.logs.map(({action}, index) => {
                    const isActive = activeActionIndex === index;
                    return <div style={{fontSize: isActive ?'700': '400', padding: '4px 0', borderTop: '1px solid #ccc'}} key={index}>
                        <div onClick={() => setActiveAction(index)} >{action.type}</div>
                        {isActive && <ReactJson style={{ padding: '8px' }} src={action} theme="railscasts" collapsed={1}  enableClipboard={false} />}
                    </div>;
                })}
            </div>
            <div>
                <ReactJson style={{ padding: '8px' }} src={state.logs[activeActionIndex].state} theme="railscasts" collapsed={1} enableClipboard={false} />
            </div>
        </div>
    </div>;
};
rootElement && ReactDom.render(<Container>
    <h1>Debugger</h1>
    <DebuggerComponent/>
    <Footer/>
</Container>, rootElement);

