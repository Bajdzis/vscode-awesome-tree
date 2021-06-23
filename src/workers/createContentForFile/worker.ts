import { Action } from 'typescript-fsa';
import { parentPort } from 'worker_threads';
// import { Files } from '../../store/dependencies/files/files';
import { CreateContentInputParams, createContentResultAction } from './action';


parentPort && parentPort.once('message', (message: Action<CreateContentInputParams>) => {
    // const files = new Files();
    // files.getContentBySibling(message.payload);
    console.log({message});
    setTimeout(() => {

        parentPort && parentPort.postMessage(createContentResultAction({
            content: 'some content'
        }));
    }, 10000);
});
