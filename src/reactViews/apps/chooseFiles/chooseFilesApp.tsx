import { FileContent, PathInfo } from 'awesome-tree-engine';
import * as React from 'react';
import { Button } from '../../components/Button/Button';
import { Container } from '../../components/Container/Container';
import { FileWithCode } from '../../components/FilesWithCode/FileWithCode';
import { Footer } from '../../components/Footer/Footer';
import { HeaderWithButton } from '../../components/HeaderWithButton/HeaderWithButton';
import { useAcquireVsCodeApi } from '../../hooks/useAcquireVsCodeApi';
import { useActionHandler } from '../../hooks/useActionHandler';
import { useVscodeState } from '../../hooks/useVscodeState';
import { generateFileAction, setDataAction } from './actions/action';

interface ChooseFilesState {
    createdFolderName: string,
    files: {
        filePath: string,
        content: string,
        generated: boolean;
    }[]
}

const initialState: ChooseFilesState = {
    createdFolderName: '',
    files: [],
};

interface FileGroupProps {
    title: string;
}

const FileGroup: React.FC<FileGroupProps> = ({title}) => {
    const {state, setState} = useVscodeState<ChooseFilesState>(initialState);
    const vscode = useAcquireVsCodeApi<ChooseFilesState>();
    const files = state.files;
    const count = files.length;

    if (count === 0) {
        return <div/>;
    }

    const generateAll = files.every(({ generated }) => generated);

    return <div>
        <HeaderWithButton title={title} count={count}>
            {!generateAll && <Button onClick={() => {
                files
                    .forEach(({content, filePath}) => {
                        vscode.postMessage(generateFileAction({
                            content,
                            filePath
                        }));
                    });

                setState({
                    files: files
                        .map((file) => ({
                            ...file,
                            generated:true
                        }))
                });
            }}>
                Generate All
            </Button>}
        </HeaderWithButton>

        {files.map((file,i) => {
            return <FileWithCode
                key={i}
                file={new FileContent(new PathInfo(file.filePath), file.content)}
                generated={file.generated}
                button={<Button
                    className="panel__button"
                    onClick={() => {
                        vscode.postMessage(generateFileAction({
                            content: file.content,
                            filePath: file.filePath
                        }));
                        const state = vscode.getState();
                        setState({
                            ...state,
                            files:files
                                .map((file,j) =>  i !== j ? file : {
                                    ...file,
                                    generated:true
                                })
                        });
                    }}>
                        Generate single file
                </Button>}
            />;
        })}
    </div>;
};

export const ChooseFilesApp = () => {
    const {state, setState} = useVscodeState<ChooseFilesState>(initialState);

    useActionHandler(setDataAction, data => {
        setState({
            createdFolderName: data.payload.createdFolderName,
            files: data.payload.files.map(file => ({
                content: file.content,
                filePath: file.filePath,
                generated: false
            }))
        });
    });

    return <Container>
        <h1>Choose files to create</h1>
        <p>For new <b>{state.createdFolderName}</b> directory</p>

        <FileGroup title={'Files'} />

        <Footer/>
    </Container>;
};
