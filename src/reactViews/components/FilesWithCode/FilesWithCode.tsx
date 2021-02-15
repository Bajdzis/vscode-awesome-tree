import * as React from 'react';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { Panel } from '../Panel/Panel';

interface FilesWithCodeProps {
    files: WebViewInfoAboutRenameFiles[];
}

export const FilesWithCode: React.FC<FilesWithCodeProps> = ({files}) => {

    return <div>
        {files.map(({ filePathRelative, filePathFromRelative, content }, index) => {
            return <Panel key={index}>
                <div className="field">
                    <label className="field__label" style={{display:'flex',justifyContent: 'space-between'}}>
                        <b style={{fontSize:'0.75rem'}}>{`${filePathFromRelative} => ${filePathRelative}`}</b> 
                    </label>
                    <pre className="field__code">{content}</pre>
                </div>
            </Panel>;
        })}
    </div>;
};
