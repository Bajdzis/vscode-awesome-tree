import { renderBody } from '../components/body';
import { WebView } from '../classes/WebView';
import { WebViewInfoAboutRenameFiles } from '../../store/dependencies/directoryRename/directoryRename';

interface RenameFilesWebViewState {
    allSiblingHave: WebViewInfoAboutRenameFiles[];
    createdFolderName: string;
    generated: boolean;
}

export class RenameFilesWebView extends WebView<RenameFilesWebViewState> {
    constructor(){
        super({
            createdFolderName: '',
            allSiblingHave: [],
            generated: false
        });

        this.title = 'Rename directory name';
    }

    render(state: RenameFilesWebViewState) {

        return renderBody({
            title: 'abc',
            content: state.createdFolderName
        });
    }

    onDidReceiveMessage(event: any) {
        console.log(event);
    }
}
