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

    vscode.postMessage({
        type: 'OPEN_WEB_VIEW',
    });

    window.addEventListener('message', ({data}) => { 
        if (data.type === 'render') {
            const { html } = data.payload;
            document.innerHTML = html;
        }
    })
</script>`;
