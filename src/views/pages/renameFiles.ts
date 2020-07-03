import { renderHtml } from '../components/html';
import { renderBody } from '../components/body';

export const renderRenameFiles = (state = {
    createdFolderName: '',
    allSiblingHave: [],
    generated: false
}) => {

    const body = renderBody({
        title: 'abc',
        content: state.createdFolderName
    });

    const html = renderHtml({
        title: 'abc',
        content: body
    });

    return html;
};
