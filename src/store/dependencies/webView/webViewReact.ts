import * as path from 'path';
import * as vscode from 'vscode';

export class WebViewReact {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    showWebView(title: string, appMainFile: string): Promise<vscode.WebviewPanel> {
        return new Promise((resolve) => {
            const panel = vscode.window.createWebviewPanel(
                'vscode-awesome-tree', title, vscode.ViewColumn.One, {
                    enableScripts: true,
                }
            );
            const reactAppPath = vscode.Uri.file(
                path.join(this.context.extensionPath, 'out', appMainFile)
            );
            const reactAppSrc = panel.webview.asWebviewUri(reactAppPath);

            panel.webview.html = this.getTemplate(title, reactAppSrc.toString());
            resolve(panel);
        });
    }


    getTemplate (title:string, reactAppPath: string) {

        return `<!DOCTYPE html>
        <html>
        
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
        </head>
        
        <body>
            <div id="root"></div>
            <script defer src="${reactAppPath}"></script>
        </body>
        </html>`;
    }
}
