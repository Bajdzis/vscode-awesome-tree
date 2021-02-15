import * as React from 'react';
import { Panel } from '../Panel/Panel';

interface FileWithCodeProps {
    title: string;
    code: string;
    generated?: boolean;
}

export const FileWithCode: React.FC<FileWithCodeProps> = ({ title, code, generated = false }) => {

    return <Panel>
        <div className="field">
            <label className="field__label" style={{display:'flex',justifyContent: 'space-between'}}>
                <b style={{fontSize:'0.75rem'}}>{title}</b> {generated && <span>Generated!</span>}
            </label>
            {!generated && <pre className="field__code">{code}</pre>}
        </div>
    </Panel>;
};
