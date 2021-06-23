import { Action } from 'typescript-fsa';
import { parentPort } from 'worker_threads';
import { Files } from '../../store/dependencies/files/files';
import { CreateContentInputParams, createContentResultAction } from './action';


parentPort && parentPort.once('message', (message: Action<CreateContentInputParams>) => {
    Files.getContentBySibling(message.payload.filePath).then(content => {
        parentPort && parentPort.postMessage(createContentResultAction({
            content
        }));
    });
});
