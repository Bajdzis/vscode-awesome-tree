import actionCreatorFactory from 'typescript-fsa';

const chooseFilesActionCreator = actionCreatorFactory('COMPARE_PERCENT_WEBVIEW');

export const setDataAction = chooseFilesActionCreator<{
    baseFilePath: string,
    files: {
        filePath: string,
        content: string,
    }[]
}>('SET_DATA');
