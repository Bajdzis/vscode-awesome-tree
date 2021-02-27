import actionCreatorFactory from 'typescript-fsa';
import { WebViewInfoAboutManagerFiles } from '../../../../store/dependencies/templateManager/templateManager';
 
const newTemplatesActionCreator = actionCreatorFactory('NEW_TEMPLATES_WEBVIEW');

export const generateTemplateAction = newTemplatesActionCreator<WebViewInfoAboutManagerFiles>('GENERATE_TEMPLATE');
export const setDataAction = newTemplatesActionCreator<{
    fileRelativePath: string;
    fileContent: string;
}>('SET_DATA');



