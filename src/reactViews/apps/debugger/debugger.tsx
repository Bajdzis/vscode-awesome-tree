import * as React from 'react';
import * as ReactDom from 'react-dom';
import { RootState } from '../../../store/reducer';
import { Footer } from '../../components/Footer/Footer';
import { useVscodeState } from '../../hooks/useVscodeState';
import { dispatchAction, DispatchActionParams } from './actions/actions';

const rootElement = document.getElementById('root');

const initialState = [{
    action: {
        type:'INIT',
        payload: {}
    },
    state: {} as any as RootState
}];

const DebuggerComponent = () => {
    const {state, setState} = useVscodeState<DispatchActionParams[]>(initialState);

    const [activeAction, setActiveAction] = React.useState<null|number>(null);

    React.useEffect(() => {
        const handler = ({data}: MessageEvent<any>) => {
            if (data.type === dispatchAction.type) {
                setState([
                    ...state,
                    data.payload as DispatchActionParams
                ]);
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

    return <div>
        {activeAction}
        {state.map(({action}, index) => {

            return <div onClick={() => setActiveAction(index)} key={index}>{action.type}</div>;
        })}
        <code>
            {JSON.stringify(state[state.length-1]?.state, null, 5)}
        </code>
    </div>;
};
rootElement && ReactDom.render(<div><DebuggerComponent/><Footer/></div>,rootElement);

