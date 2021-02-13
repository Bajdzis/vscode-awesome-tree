import actionCreatorFactory from 'typescript-fsa';
 
const renameFilesActionCreator = actionCreatorFactory();

export const generateAllAction = renameFilesActionCreator('GENERATE_ALL');
export const setDataAction = renameFilesActionCreator('SET_DATA');
export const changeNameAction = renameFilesActionCreator<{
    value: string
}>('CHANGE_NAME');

