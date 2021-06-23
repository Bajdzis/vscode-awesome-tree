import { CreateContentInputParams, CreateContentResultParams } from './createContentForFile/action';

export interface WorkerNameToAction {
    'createContentForFileWorker.js': {
        input: CreateContentInputParams
        result: CreateContentResultParams
    }
}
