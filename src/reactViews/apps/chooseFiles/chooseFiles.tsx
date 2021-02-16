import * as React from 'react';
import * as ReactDom from 'react-dom';
import { WebViewInfoAboutFiles } from '../../../store/dependencies/files/files';
import { Button } from '../../components/Button/Button';
import { Container } from '../../components/Container/Container';
import { FileWithCode } from '../../components/FilesWithCode/FileWithCode';
import { Footer } from '../../components/Footer/Footer';
import { HeaderWithButton } from '../../components/HeaderWithButton/HeaderWithButton';
import { LoggerWebViewMessage } from '../../components/LoggerWebViewMessage/LoggerWebViewMessage';
import { useAcquireVsCodeApi } from '../../hooks/useAcquireVsCodeApi';
import { useVscodeState } from '../../hooks/useVscodeState';
import { generateFileAction, setDataAction } from './actions/action';

interface ChooseFilesState {
    createdFolderName: string;
    allSiblingHave: WebViewInfoAboutFiles[]
    notAllSiblingHave: WebViewInfoAboutFiles[]
    fromTemplate: WebViewInfoAboutFiles[]
}

const initialState: ChooseFilesState = {
    createdFolderName: '',
    allSiblingHave: [],
    notAllSiblingHave: [],
    fromTemplate: []
};

interface FileGroupProps {
    title: string;
    keyGroup: 'allSiblingHave' | 'notAllSiblingHave' | 'fromTemplate';
}


const FileGroup: React.FC<FileGroupProps> = ({title, keyGroup}) => {
    const {state, setState} = useVscodeState<ChooseFilesState>(initialState);
    const vscode = useAcquireVsCodeApi<ChooseFilesState>();
    const count = state[keyGroup].length;

    if (count === 0) {
        return <div/>;
    }

    const generateAll = state[keyGroup].every(({ generated }) => generated);

    return <div>
        <HeaderWithButton title={title} count={count}>
            {!generateAll && <Button onClick={() => {
                const state = vscode.getState();

                state[keyGroup]
                    .forEach(({content, filePath}) => {
                        vscode.postMessage(generateFileAction({
                            content,
                            filePath
                        }));
                    });
                    
                setState({
                    ...state,
                    [keyGroup]: state[keyGroup]
                        .map((file) => ({
                            ...file,
                            generated:true
                        }))
                });
            }}>
                Generate All
            </Button>}
        </HeaderWithButton>

        {state[keyGroup].map((file,i) => {
            return <FileWithCode key={i} title={file.relativePath} code={file.content} generated={file.generated} button={<Button className="panel__button" onClick={() => {
                vscode.postMessage(generateFileAction({
                    content: file.content,
                    filePath: file.filePath
                }));
                const state = vscode.getState();
                setState({
                    ...state,
                    [keyGroup]: state[keyGroup]
                        .map((file,j) =>  i !== j ? file : {
                            ...file,
                            generated:true
                        })
                });
            }}>Generate single file</Button>}/>;
        })} 
    </div>;
};

const App = () => {
    const {state, setState} = useVscodeState<ChooseFilesState>(initialState);
    
    React.useEffect(() => {
        const handler = ({data}: MessageEvent<any>) => { 
            if (data.type === setDataAction.type) {
                const { allSiblingHave, createdFolderName, notAllSiblingHave, fromTemplate } = data.payload;
                setState({ allSiblingHave, createdFolderName, notAllSiblingHave, fromTemplate });
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

    return <Container>
        <h1>Choose files to create</h1>
        <p>For new <b>{state.createdFolderName}</b> directory</p>
        
        <FileGroup title={'From saved templates'} keyGroup="fromTemplate" />

        <FileGroup title={'Always created in sibling directory'} keyGroup="allSiblingHave" />

        <FileGroup title={'Others'} keyGroup="notAllSiblingHave" />

        <LoggerWebViewMessage />
        
        <Footer/>
    </Container>;
};

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<App />,rootElement);
