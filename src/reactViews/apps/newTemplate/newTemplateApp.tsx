import * as React from 'react';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { changeToUnixSlashes } from '../../../strings/changeToUnixSlashes';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { Container } from '../../components/Container/Container';
import { Footer } from '../../components/Footer/Footer';
import { Select } from '../../components/Select/Select';
import { useVscodeState } from '../../hooks/useVscodeState';
import { setDataAction } from './actions/action';

interface NewTemplateState {
    fileRelativePath: string;
    fileContent: string;
}

const initialState: NewTemplateState = {
    fileRelativePath: '',
    fileContent: '',
};

export const NewTemplateApp = () => {
    const {state, setState} = useVscodeState<NewTemplateState>(initialState);
    const {fileRelativePath, fileContent} = state;
    // const vscode = useAcquireVsCodeApi<NewTemplateState>();
    
    React.useEffect(() => {
        const handler = ({data}: MessageEvent<any>) => { 
            if (data.type === setDataAction.type) {
                const { fileRelativePath, fileContent } = data.payload;
                setState({ fileRelativePath, fileContent });
            }
        };
        window.addEventListener('message',handler);
        return () => window.removeEventListener('message',handler);
    },[]);

    const template  = React.useMemo(() => {
        if(fileRelativePath === '' || fileContent === ''){
            return '';
        }
        const info: PathInfo = getInfoAboutPath(fileRelativePath);
        
        return createVariableTemplate(fileContent, [info]); 
    },[fileRelativePath, fileContent]);

    const globsSuggestions = React.useMemo(() => {
        const result: string[] = [];
        const pathPaths: string[] = changeToUnixSlashes(fileRelativePath).split('/');
        const lastElement = pathPaths.pop();
        if (!lastElement) {
            return result;
        }
        const [, ...extensions] = lastElement.split('.');

        while (pathPaths.length > 0) {
            result.push(`${pathPaths.join('/')}${result.length ? '/**' : ''}/*.${extensions.join('.')}`);
            const aaa = pathPaths.pop();
            if(aaa === undefined) {
                break;
            }
        }


        return result; 
    },[fileRelativePath]);

    return <Container>
        <h1>Create new template</h1>
        <pre>
            {fileRelativePath}
        </pre>


        <Select
            label="selectGlob"
            values={globsSuggestions} 
        
        />
        <pre>
            {fileContent}
        </pre>

        <pre>
            {template}
        </pre>
        
        <Footer/>
    </Container>;
};

