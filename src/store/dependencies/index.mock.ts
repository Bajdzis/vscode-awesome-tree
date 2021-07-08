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
        },
        context: {
            asAbsolutePath: jest.fn(),
            environmentVariableCollection: jest.fn(),
            extensionMode: jest.fn(),
            extensionPath: jest.fn(),
            extensionUri: jest.fn(),
            globalState: jest.fn(),
            globalStoragePath: jest.fn(),
            globalStorageUri: jest.fn(),
            logPath: jest.fn(),
            logUri: jest.fn(),
            secrets: jest.fn(),
            storagePath: jest.fn(),
            storageUri: jest.fn(),
            subscriptions: jest.fn(),
            workspaceState: jest.fn(),
            extension: jest.fn(),
        }
    };
    return dependency;
};

