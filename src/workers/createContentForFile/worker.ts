import { Action } from 'typescript-fsa';
import { CreateContentInputParams, createContentResultAction } from './action';

const { parentPort } = require('worker_threads');

parentPort.once('message', (message: Action<CreateContentInputParams>) => {



    parentPort.postMessage(createContentResultAction({
        content: 'some content'
    }));
});
