import actionCreatorFactory from 'typescript-fsa';
import { WebViewInfoAboutRenameFiles } from '../../../../store/dependencies/directoryRename/directoryRename';
 
const renameFilesActionCreator = actionCreatorFactory();

export const generateAllAction = renameFilesActionCreator<void>('GENERATE_ALL');
export const setDataAction = renameFilesActionCreator<{
    createdFolderName: string,
    allSiblingHave: WebViewInfoAboutRenameFiles[]
}>('SET_DATA');
export const changeNameAction = renameFilesActionCreator<{
    value: string
}>('CHANGE_NAME');

