import * as React from 'react';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { FileWithCode } from './FileWithCode';

interface FilesWithCodeProps {
    files: WebViewInfoAboutRenameFiles[];
}

export const FilesWithCode: React.FC<FilesWithCodeProps> = ({files}) => {

    return <div>
        {files.map(({ filePathRelative, filePathFromRelative, content }, index) => {
            return <FileWithCode key={index} code={content} title={`${filePathFromRelative} => ${filePathRelative}`} />;
        })}
    </div>;
};
