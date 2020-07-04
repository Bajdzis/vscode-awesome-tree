import * as vscode from 'vscode';
import { renderHtml } from '../components/html';

export abstract class WebView<T extends {} = {}> {
    protected title: string;
    protected state: T;
    protected panel?: vscode.WebviewPanel;
    
    constructor(state: T) {
        this.state = state;
        this.title = '';
    }

    show(){
        this.panel = vscode.window.createWebviewPanel(
            'vscode-awesome-tree', this.title, vscode.ViewColumn.One, {
                enableScripts: true,
            }
        );
        this.panel.webview.html = renderHtml({
            title: this.title,
            content: this.render(this.state)
        });
        this.panel.webview.postMessage({ 
            type: 'SET_DATA', 
        });
        this.panel.webview.onDidReceiveMessage((action) => {
            this.onDidReceiveMessage(action);
        });

    }

    setState (newState: Partial<T>) {
        this.state = {
            ...this.state,
            ...newState,
        };
        if(this.panel) {
            this.panel.webview.html = renderHtml({
                title: this.title,
                content: this.render(this.state)
            });
        }
    }

    abstract render(state: T): string;
    abstract onDidReceiveMessage(event: any): void;
}
