import { Action } from 'typescript-fsa';
// import { Files } from '../../store/dependencies/files/files';
import { CreateContentInputParams, createContentResultAction } from './action';

const { parentPort } = require('worker_threads');

parentPort.once('message', (message: Action<CreateContentInputParams>) => {
    // const files = new Files();
    // files.getContentBySibling(message.payload);
    console.log({message});
    setTimeout(() => {

        parentPort.postMessage(createContentResultAction({
            content: 'some content'
        }));
    }, 10000);
});
