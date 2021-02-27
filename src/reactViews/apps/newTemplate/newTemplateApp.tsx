import * as React from 'react';
import { getInfoAboutPath, PathInfo } from '../../../fileInfo/getInfoAboutPath';
import { createVariableTemplate } from '../../../variableTemplate/createVariableTemplate';
import { Container } from '../../components/Container/Container';
import { Footer } from '../../components/Footer/Footer';
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
        const info: PathInfo = getInfoAboutPath(state.fileRelativePath);
        
        return createVariableTemplate(state.fileContent, [info]); 
    },[state.fileRelativePath, state.fileContent]);

    const globsSuggestions = React.useMemo(() => {
        const result: string[] = [];
        const pathPaths: string[] = state.fileRelativePath.split('/');
        const lastElement = pathPaths.pop();
        if (!lastElement) {
            return [
                state.fileRelativePath
            ];
        }
        // const [, ...extensions] = lastElement.split('.');

        // while (pathPaths.length > 0) {
        //     result.push(`${pathPaths.join('/')}${result.length ? '' : '/**'}/*.${extensions.join('.')}`);
        //     const aaa = pathPaths.pop();
        //     if(aaa === undefined) {
        //         break;
        //     }
        // }


        return result; 
    },[state.fileRelativePath]);

    return <Container>
        <h1>Create new template</h1>
        <pre>
            {state.fileRelativePath}
        </pre>

        {globsSuggestions.map((globs) => {

            return <div key={globs}>{globs}</div>;
        })}
        <pre>
            {state.fileContent}
        </pre>

        <pre>
            {template}
        </pre>
        
        <Footer/>
    </Container>;
};

