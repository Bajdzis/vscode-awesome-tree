import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class WebView {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    getTemplates() {
        return fs.readFileSync(path.join(this.context.extensionPath, 'webViews', 'template.html')).toString();
    }

    getWebViewTemplate(viewName: string) {
        let html = fs.readFileSync(path.join(this.context.extensionPath, 'webViews', 'views', `${viewName}.html`)).toString();
        html = html
            .replace(/\{\{templates\}\}/gi, this.getTemplates())
            .replace(/\{\{basePath\}\}/gi, vscode.Uri.file(path.join(this.context.extensionPath, 'webViews')).with({
                scheme: 'vscode-resource'
            }).toString());

        return html;
    }

    showWebView(html: string, title: string): Promise<vscode.WebviewPanel> {
        return new Promise((resolve) => {
            const panel = vscode.window.createWebviewPanel(
                'vscode-awesome-tree', title, vscode.ViewColumn.One, {
                    enableScripts: true,
                }
            );
            panel.webview.html = html;
            resolve(panel);
        });
    }
}
