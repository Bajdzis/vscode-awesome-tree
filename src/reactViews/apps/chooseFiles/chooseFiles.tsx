import * as React from 'react';
import * as ReactDom from 'react-dom';
import { WebViewInfoAboutFiles } from '../../../store/dependencies/files/files';
import { Button } from '../../components/Button/Button';
import { Container } from '../../components/Container/Container';
import { FileWithCode } from '../../components/FilesWithCode/FileWithCode';
import { Footer } from '../../components/Footer/Footer';
import { HeaderWithButton } from '../../components/HeaderWithButton/HeaderWithButton';
import { LoggerWebViewMessage } from '../../components/LoggerWebViewMessage/LoggerWebViewMessage';
import { useVscodeState } from '../../hooks/useVscodeState';
import { setDataAction } from './actions/action';

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
        
        <HeaderWithButton title={'From saved templates'} count={state.fromTemplate.length}>
            <Button>Generate All</Button>
        </HeaderWithButton>

        {state.fromTemplate.map((file,i) => {
            return <FileWithCode key={i} title={file.relativePath} code={file.content} />;
        })}

        <HeaderWithButton title={'Always created in sibling directory'} count={state.allSiblingHave.length}>
            <Button>Generate All</Button>
        </HeaderWithButton>

        {state.allSiblingHave.map((file,i) => {
            return <FileWithCode key={i} title={file.relativePath} code={file.content} />;
        })}

        <HeaderWithButton title={'Others'} count={state.notAllSiblingHave.length}>
            <Button>Generate All</Button>
        </HeaderWithButton>

        {state.notAllSiblingHave.map((file,i) => {
            return <FileWithCode key={i} title={file.relativePath} code={file.content} />;
        })}

        <LoggerWebViewMessage />
        
        <Footer/>
    </Container>;
};

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<App />,rootElement);
