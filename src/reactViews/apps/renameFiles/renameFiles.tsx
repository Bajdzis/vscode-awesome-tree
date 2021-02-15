import * as React from 'react';
import * as ReactDom from 'react-dom';
import { WebViewInfoAboutRenameFiles } from '../../../store/dependencies/directoryRename/directoryRename';
import { Button } from '../../components/Button/Button';
import { Container } from '../../components/Container/Container';
import { Footer } from '../../components/Footer/Footer';
import { Input } from '../../components/Input/Input';
import { Panel } from '../../components/Panel/Panel';
import { useAcquireVsCodeApi } from '../../hooks/useAcquireVsCodeApi';
import { useVscodeState } from '../../hooks/useVscodeState';
import { changeNameAction } from './actions/action';
interface RenameFilesState {
    createdFolderName: string;
    allSiblingHave: WebViewInfoAboutRenameFiles[];
    generated: boolean;
}

const initialState: RenameFilesState = {
    createdFolderName: '',
    allSiblingHave: [],
    generated: false
};
interface HeaderProps {
    title: string;
    count: number;
}

const Header: React.FC<HeaderProps> = ({title, count}) => {
    const vscode = useAcquireVsCodeApi<RenameFilesState>();
    const { setState } = useVscodeState<RenameFilesState>(initialState);

    return <h2 style={{display:'flex',justifyContent: 'space-between'}}>
        <span>{title} <span>( {count} )</span></span>
        <button className="button button--primary" data-event="generate-all"></button>
        <Button onClick={() => {
            vscode.postMessage({
                type: 'GENERATE_ALL'
            });
            setState({
                generated: true
            });
        }}>Rename all</Button>
    </h2>;
};

interface RenameFieldProps {
    files: WebViewInfoAboutRenameFiles[];
}

const RenameField: React.FC<RenameFieldProps> = ({files}) => {

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

interface GeneratedRenameFieldProps {
    files: WebViewInfoAboutRenameFiles[];
}

const GeneratedRenameField: React.FC<GeneratedRenameFieldProps> = ({files}) => {

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

const App = () => {
    const {state, setState} = useVscodeState<RenameFilesState>(initialState);
    
    const vscode = useAcquireVsCodeApi<RenameFilesState>();
    
    React.useEffect(() => {

        const handler = ({data}: MessageEvent<any>) => { 
            if (data.type === 'SET_DATA') {
                const { allSiblingHave, createdFolderName } = data.payload;
                setState({ allSiblingHave, createdFolderName });
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

    return <Container>
        REACT !!!!
        <h1>Type new directory name</h1>
        {!state?.generated && <Input 
            id="createdFolderName"
            label="Directory name"
            onChange={(e) => {
                vscode.postMessage(changeNameAction({
                    value: e.target.value
                }));
            }} 
        />}
        <Header title={'Preview'} count={state?.allSiblingHave?.length || 0}/>
        {state?.allSiblingHave && <RenameField files={state.allSiblingHave}/>}
        {state?.allSiblingHave && <GeneratedRenameField files={state.allSiblingHave}/>}
        <Footer/>
    </Container>;
};

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<App />,rootElement);


