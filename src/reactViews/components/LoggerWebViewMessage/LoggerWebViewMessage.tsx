import * as React from 'react';
import { useVscodeState } from '../../hooks/useVscodeState';
import { Panel } from '../Panel/Panel';


interface LoggerWebViewMessageProps {
}

export const LoggerWebViewMessage: React.FC<LoggerWebViewMessageProps> = () => {
    const [logs, setLogs] = React.useState<{type: string, obj:any}[]>([]);
    const { state } = useVscodeState({});
    // const { getState } = useAcquireVsCodeApi();

    // React.useEffect(() => {
    //     setLogs(logs => ([
    //         {type : 'state', obj: getState()},
    //         ...logs
    //     ]));
    // }, [logs]);

    React.useEffect(() => {
        const handler = ({data}: MessageEvent<any>) => { 
            setLogs(logs => ([
                {type : data.type, obj: data.payload},
                ...logs
            ]));
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

    return <Panel>
        <h2>Logs</h2>
        {logs.map((log,i) => <div key={i}>
            {log.type}
            {/* <pre>{JSON.stringify(log.obj, null, 4)}</pre> */}
        </div>)}
        <h2>state</h2>
        <pre>{ JSON.stringify(state, null, 4)}</pre>
    </Panel>;
};
