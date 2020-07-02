import { renderFooter } from './footer';

interface BodyProps {
    title: string;
    content: string;
    scripts: string;
}

export const renderBody = ({title, content, scripts}: BodyProps) => `<div class="container">
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
    ${scripts}
</script>`;
