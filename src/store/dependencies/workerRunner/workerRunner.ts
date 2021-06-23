import { Worker } from 'worker_threads';
import * as path from 'path';
import { Action } from 'typescript-fsa';
import * as vscode from 'vscode';
import { WorkerNameToAction } from '../../../workers/domain';


export class WorkerRunner {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    run<T extends keyof WorkerNameToAction>(title: string, workerFileName: T, action : Action<WorkerNameToAction[T]['input']>): Promise<Action<WorkerNameToAction[T]['result']>> {

        return new Promise((resolveMain, rejectMain) => {
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
                return new Promise((resolve, reject) => {

                    worker.on('message', (data) => {
                        console.log('DATA', data);
                        resolve(data);
                        resolveMain(data);
                    });

                    worker.on('error', () => {
                        reject();
                        rejectMain();
                    });

                });

            });
        });


    }

}
