import * as React from 'react';
import { Panel } from '../Panel/Panel';
import './FileWithCode.css';
interface FileWithCodeProps {
    title: string;
    code: string;
    generated?: boolean;
    button?: React.ReactNode;
}

export const FileWithCode: React.FC<FileWithCodeProps> = ({ title, code, generated = false, button = null }) => {

    return <Panel>
        <div className="file">
            <label className="file__label" style={{display:'flex', justifyContent: 'space-between'}}>
                <b style={{fontSize:'0.75rem'}}>{title}</b> {generated ? <span>Generated!</span> : button}
            </label>
            {!generated && <pre className="file__code">{code}</pre>}
        </div>
    </Panel>;
};
