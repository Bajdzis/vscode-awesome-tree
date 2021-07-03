import { RootDependency } from '.';


type MockService<T extends string | number = any> = {
    [key in T]: jest.Mock;
}

type RootDependencyMocked = {
    [key in keyof RootDependency]: MockService<Extract<keyof RootDependency[key],string>>
}

export const createMockDependency = (): RootDependencyMocked => {
    const dependency: RootDependencyMocked = {
        config: {
            canUseThisFile: jest.fn(),
            getIgnorePathsGlob: jest.fn(),
            shouldExcludeByGitIgnoreFile: jest.fn(),
        },
        files:{
            getContentBySibling: jest.fn(),
            isDirectory: jest.fn(),
            isEmptyDirectory: jest.fn(),
            isEmptyFile: jest.fn(),
            isFile: jest.fn(),
            showWebView: jest.fn(),
        },
        webViewReact: {
            showWebView:jest.fn(),
        },
        directoryRename:{
            showWebView: jest.fn(),
        },
        outputChannel: {
            append: jest.fn(),
            appendLine: jest.fn(),
            clear: jest.fn(),
            dispose: jest.fn(),
            hide: jest.fn(),
            name: jest.fn(),
            show: jest.fn(),
        }
    };
    return dependency;
};

