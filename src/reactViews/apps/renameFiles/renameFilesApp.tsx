import { FileContent, FileContentCreator, PathInfo } from 'awesome-tree-engine';
import * as React from 'react';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { Button } from '../../components/Button/Button';
import { Container } from '../../components/Container/Container';
import { FileWithCode } from '../../components/FilesWithCode/FileWithCode';
import { Footer } from '../../components/Footer/Footer';
import { HeaderWithButton } from '../../components/HeaderWithButton/HeaderWithButton';
import { Input } from '../../components/Input/Input';
import { useAcquireVsCodeApi } from '../../hooks/useAcquireVsCodeApi';
import { useVscodeState } from '../../hooks/useVscodeState';
import { changeNameAction, generateAllAction, setDataAction } from './actions/action';

interface RenameFilesState {
    createdFolderName: string;
    newFolderName: string;
    allSiblingHave: WebViewInfoAboutRenameFiles[];
    generated: boolean;
}

const initialState: RenameFilesState = {
    createdFolderName: '',
    newFolderName: '',
    allSiblingHave: [],
    generated: false
};

export const RenameFilesApp = () => {
    const {state, setState} = useVscodeState<RenameFilesState>(initialState);

    const vscode = useAcquireVsCodeApi<RenameFilesState>();

    React.useEffect(() => {
        const handler = ({data}: MessageEvent<any>) => {
            if (data.type === setDataAction.type && state.generated === false) {
                const { allSiblingHave, createdFolderName } = data.payload;

                const newFolderName = (new PathInfo(createdFolderName)).getName();
                setState({ allSiblingHave, createdFolderName, newFolderName });
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

    const generateData = React.useMemo(() => {


        const baseDirectory = new PathInfo(state.createdFolderName);
        const destinationPath = new PathInfo(`${baseDirectory.getParent().getPath()}${state.newFolderName}/`);

        const similarFiles = state.allSiblingHave.map(({content, filePath}) => new FileContent(new PathInfo(filePath), content));

        return similarFiles.map(currentFile => {
            const newFile = new FileContentCreator(destinationPath, currentFile);

            return {currentFile, newFile: newFile.createFile()};
        });
    }, [state.allSiblingHave, state.createdFolderName, state.newFolderName]);


    return <Container>
        <h1>Type new directory name</h1>

        {!state.generated && <Input
            id="createdFolderName"
            label="Directory name"
            onChange={(e) => {
                const newFolderName = e.target.value;
                setState({
                    newFolderName
                });
                vscode.postMessage(changeNameAction({
                    value: newFolderName
                }));
            }}
            defaultValue={state.newFolderName}
        />}


        <HeaderWithButton title={'Preview'} count={state?.allSiblingHave?.length || 0}>
            {!state.generated && <Button onClick={() => {
                vscode.postMessage(generateAllAction({
                    files: generateData.map(({currentFile, newFile}) => ({
                        currentFile: {
                            content: currentFile.getContent(),
                            filePath: currentFile.getPathInfo().getPath(),
                        },
                        newFile: {
                            content: newFile.getContent(),
                            filePath: newFile.getPathInfo().getPath(),
                        }
                    }))
                }));
                setState({
                    generated: true
                });
            }}>Rename all</Button>}
        </HeaderWithButton>

        {generateData.map(({currentFile, newFile}, index) => <FileWithCode key={index} file={newFile} oldFile={currentFile} generated={state.generated} />)}

        <Footer/>
    </Container>;
};

