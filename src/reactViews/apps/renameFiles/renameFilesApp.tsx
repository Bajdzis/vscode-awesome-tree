import * as React from 'react';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { Button } from '../../components/Button/Button';
import { Container } from '../../components/Container/Container';
import { FilesWithCode } from '../../components/FilesWithCode/FilesWithCode';
import { Footer } from '../../components/Footer/Footer';
import { GeneratedFiles } from '../../components/GeneratedFiles/GeneratedFiles';
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
                setState({ allSiblingHave, createdFolderName });
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

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
            defaultValue={state.newFolderName || state.createdFolderName}
        />}

        <HeaderWithButton title={'Preview'} count={state?.allSiblingHave?.length || 0}>
            {!state.generated && <Button onClick={() => {
                vscode.postMessage(generateAllAction());
                setState({
                    generated: true
                });
            }}>Rename all</Button>}
        </HeaderWithButton>

        {state.generated && <GeneratedFiles files={state.allSiblingHave}/>}

        {!state.generated && <FilesWithCode files={state.allSiblingHave}/>}
        
        <Footer/>
    </Container>;
};

