import { AnalyzeFiles, FileContent, FileContentCreator, PathInfo } from 'awesome-tree-engine';
import * as React from 'react';
import { Container } from '../../components/Container/Container';
import { Footer } from '../../components/Footer/Footer';
import { PercentLine } from '../../components/PercentLine/PercentLine';
import { useActionHandler } from '../../hooks/useActionHandler';
import { useVscodeState } from '../../hooks/useVscodeState';
import { setDataAction } from './actions/action';

interface ChooseFilesState {
    baseFilePath: string,
    files: {
        filePath: string,
        content: string,
    }[]
}

const initialState: ChooseFilesState = {
    baseFilePath: '',
    files: [],
};

export const ComparePercentApp = () => {
    const {state : simpleState, setState} = useVscodeState<ChooseFilesState>(initialState);

    useActionHandler(setDataAction, ({payload}) => {
        setState(payload);
    });

    const state = React.useMemo(() => {
        const basePath = new PathInfo(simpleState.baseFilePath);
        const similarFiles = simpleState.files.map(file => new FileContent(new PathInfo(file.filePath), file.content));
        const analyzer = new AnalyzeFiles();

        similarFiles.forEach(file => {
            const contentCreator = new FileContentCreator(basePath, file);
            const newFileContent = new FileContent(file.getPathInfo(), contentCreator.createContent());
            analyzer.addFile(newFileContent);
        });

        const nodes = analyzer.analyze();

        const lines = analyzer.getLines(nodes);

        return {
            lines,
            basePath,
            similarFiles
        };
    }, [simpleState]);

    const [activeLineIndex, setActiveLineIndex] =  React.useState<null | number>(null);

    return <Container>
        <h1>Check similar files</h1>
        <p>
            We analyze <b>{state.basePath.getName()}</b> file.<br />
            You can click any line of code to see the details
            {/* Compare this file with other ({state.similarFiles.length}) file(s).<br />
            Full path list avalible on bottom this page.<br /> */}
        </p>

        {state.lines.map((line,index) => <div key={index + line.content} style={{cursor: 'pointer'}} onClick={() => {
            setActiveLineIndex(activeLineIndex => {
                if(activeLineIndex === index) {
                    return null;
                }
                return index;
            });
        }} >
            <div style={{fontStyle: activeLineIndex === index ? 'italic' : 'normal'}}>
                <PercentLine line={line} similarFiles={state.similarFiles.length}/>
            </div>
            {activeLineIndex === index && <div style={{paddingBottom: '16px'}}>
                <h4>Have this line : </h4>
                {line.paths.map((path, index) => <div key={index}>{
                    path.getPath()
                }</div>)}
                <h4>Not have this line : </h4>
                {state.similarFiles
                    .map(file => file.getPathInfo().getPath())
                    .filter(path => !line.paths.some(linePath => linePath.getPath() === path))
                    .map((path, index) => <div key={index}>{
                        path
                    }</div>)}
            </div>}
        </div>

        )}

        <h2>Analyze files: </h2>

        {state.similarFiles.map((file, index) => <div key={index}>
            {file.getPathInfo().getPath()}
        </div>)}
        <Footer/>
    </Container>;
};
