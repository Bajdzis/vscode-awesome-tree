import * as React from 'react';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { Panel } from '../Panel/Panel';

interface GeneratedFilesProps {
    files: WebViewInfoAboutRenameFiles[];
}

export const GeneratedFiles: React.FC<GeneratedFilesProps> = ({files}) => {

    return <div>
        {files.map(({ filePathRelative, filePathFromRelative }, index) => {
            return <Panel key={index}>
                <div className="field">
                    <label className="field__label" style={{display:'flex',justifyContent: 'space-between'}}>
                        <b>{`${filePathFromRelative} => ${filePathRelative}`}</b> <span>Generated!</span>
                    </label>
                </div>
            </Panel>;
        })}
    </div>;
};
