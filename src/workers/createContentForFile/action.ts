import actionCreatorFactory from 'typescript-fsa';

const createContentForFileActionCreator = actionCreatorFactory('CREATE_CONTENT_FOR_FILE_WORKER');

export interface CreateContentInputParams {
    filePath: string
}
export const createContentInputAction = createContentForFileActionCreator<CreateContentInputParams>('INPUT');

export const createContentResultAction = createContentForFileActionCreator<{
    content: string | null
}>('RESULT');
