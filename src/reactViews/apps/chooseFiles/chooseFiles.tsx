import * as React from 'react';
import * as ReactDom from 'react-dom';
import { WebViewInfoAboutFiles } from '../../../store/dependencies/files/files';
import { Container } from '../../components/Container/Container';
import { Footer } from '../../components/Footer/Footer';
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
    const {setState} = useVscodeState<ChooseFilesState>(initialState);
    
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
        
        


        <LoggerWebViewMessage />

        
        <Footer/>
    </Container>;
};

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<App />,rootElement);
