import * as React from 'react';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { FileWithCode } from '../FilesWithCode/FileWithCode';

interface GeneratedFilesProps {
    files: WebViewInfoAboutRenameFiles[];
}

export const GeneratedFiles: React.FC<GeneratedFilesProps> = ({files}) => {

    return <div>
        {files.map(({ filePathRelative, filePathFromRelative }, index) => {
            return <FileWithCode 
                key={index} 
                title={`${filePathFromRelative} => ${filePathRelative}`} 
                code={''} 
                generated={true} 
            />;
        })}
    </div>;
};
