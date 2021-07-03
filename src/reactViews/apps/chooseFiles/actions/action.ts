import actionCreatorFactory from 'typescript-fsa';

const chooseFilesActionCreator = actionCreatorFactory('CHOOSE_FILES_WEBVIEW');

export const generateFileAction = chooseFilesActionCreator<{
    filePath: string,
    content: string,
}>('GENERATE_FILE');

export const setDataAction = chooseFilesActionCreator<{
    createdFolderName: string,
    files: {
        filePath: string,
        content: string,
    }[]
}>('SET_DATA');
