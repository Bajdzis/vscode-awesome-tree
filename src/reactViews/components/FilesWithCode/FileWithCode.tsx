import { FileContent } from 'awesome-tree-engine';
import * as React from 'react';
import { DiffLine } from '../DiffLine/DiffLine';
import { Panel } from '../Panel/Panel';
import './FileWithCode.css';

interface FileWithCodeProps {
    file: FileContent;
    oldFile?: FileContent;
    generated?: boolean;
    button?: React.ReactNode;
}

export const FileWithCode: React.FC<FileWithCodeProps> = ({ file, oldFile, generated = false, button = null }) => {
    const oldContent = oldFile ? oldFile.getContent().split('\n') : [];

    return <Panel>
        <div className="file">
            <label className="file__label" style={{display:'flex', justifyContent: 'space-between'}}>
                <b style={{fontSize:'0.75rem'}}>{oldFile ? <DiffLine  newLine={file.getPathInfo().getPath()} oldLine={oldFile.getPathInfo().getPath()}/> : `${file.getPathInfo().getPath()}`} </b> {generated ? <span>Generated!</span> : button}
            </label>
            {!generated && <pre className="file__code">{file.getLines().map((line, index) => {
                return <DiffLine key={`${index} - ${line}`} newLine={line} oldLine={oldContent?.[index] || ''}/>;
            })}</pre>}
        </div>
    </Panel>;
};
