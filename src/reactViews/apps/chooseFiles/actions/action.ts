import actionCreatorFactory from 'typescript-fsa';
import { WebViewInfoAboutFiles } from '../../../../store/dependencies/files/files';
 
const chooseFilesActionCreator = actionCreatorFactory('CHOOSE_FILES_WEBVIEW');

export const generateFileAction = chooseFilesActionCreator<{
    filePath: string, 
    content: string,
}>('GENERATE_FILE');

export const setDataAction = chooseFilesActionCreator<{
    createdFolderName: string,
    allSiblingHave: WebViewInfoAboutFiles[]
    notAllSiblingHave: WebViewInfoAboutFiles[]
    fromTemplate: WebViewInfoAboutFiles[]
}>('SET_DATA');
