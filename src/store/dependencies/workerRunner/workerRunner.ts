import { Worker } from 'node:worker_threads';
import * as path from 'path';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';


export class WorkerRunner {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    run(title: string, workerFileName: string, action : Action<any>): Promise<any> {

        return new Promise((resolveMain) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title,
                cancellable: true
            }, async (progress, token) => {

                const reactAppPath = path.join(this.context.extensionPath, 'out', workerFileName);
                const worker = new Worker(reactAppPath);
                token.onCancellationRequested(() => {
                    worker.terminate();
                });

                worker.postMessage(action);
                return new Promise((resolve) => {

                    worker.on('message', (data) => {
                        resolve(data);
                        resolveMain(data);
                    });
                });

            });
        });


    }

}
