import { FileContent, PathInfo } from 'awesome-tree-engine';
import { Store } from 'redux';
import { RootState } from '../store/reducer';
import * as fs from 'fs';
import { RootDependency } from '../store/dependencies';
import { setDataAction } from '../reactViews/apps/comparePercent/actions/action';
import { getSimilarPaths } from '../store/selectors/files/files';

export async function showLineComparePercent(basePath: PathInfo, store: Store<RootState>, dependencies: RootDependency ){
    const similarFiles = getSimilarPaths(basePath)(store.getState())
        .map(path => new FileContent(path, fs.readFileSync(path.getPath()).toString()));

    let comparePercentApp = await dependencies.webViewReact.showWebView(`Analyze - ${basePath.getName()}`, 'reactAppComparePercent.js');

    comparePercentApp.webview.postMessage(setDataAction({
        baseFilePath: basePath.getPath(),
        files: similarFiles.map((file) => ({
            content: file.getContent(),
            filePath: file.getPathInfo().getPath()
        }))
    }));
}
