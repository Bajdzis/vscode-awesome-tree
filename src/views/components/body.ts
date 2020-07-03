import { renderFooter } from './footer';

interface BodyProps {
    title: string;
    content: string;
}

export const renderBody = ({title, content }: BodyProps) => `<div class="container">
    <h1>${title}</h1>
    ${content}
    ${renderFooter()}
</div>
<script>
    const vscode = acquireVsCodeApi();
    const initialState = {};
    let state = vscode.getState() || initialState;

    const setState = (newState) => {
        state = {
            ...state,
            ...newState,
        };
        refreshView(state);
        vscode.setState(state);
    };

    window.addEventListener('message', ({data}) => { 
        if (data.type === 'setState') {
            const { allSiblingHave, createdFolderName } = data.payload;
            setState({ ...data.payload });
            vscode.postMessage({
                type: 'RENDER_STARTED',
                payload: {
                    value: createdFolderNameInput.value
                }
            });
        } else if (data.type === 'render') {
            const { allSiblingHave, createdFolderName } = data.payload;
            setState({ ...data.payload })
        }
    })
</script>`;
