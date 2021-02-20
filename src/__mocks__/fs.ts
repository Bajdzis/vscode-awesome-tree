import * as fs from 'fs';

const mockFiles: { [key:string]: string } = {
    'C:/site/components/nav/nav.js': 'function NavComponent () {',
    'C:/site/components/nav/nav.css': '.nav { margin:5px; }',
    'C:/site/components/btn/btn.js': 'function BtnComponent () {',
    'C:/site/components/btn/btn.css': '.btn { margin:5px; }',
    'C:/site/action/firstAction.js': 'const first = new Action();',
    'C:/site/action/importantAction.js': 'const important = new Action();',
    'C:/site/action/createAction.js': ''
};

const mockDirectory = [
    'C:/site/components', 'C:/site/components/nav', 'C:/site/components/btn', 'C:/site/components/new', 'C:/site/action'
];

export const readdirSync = jest.fn((path: string) => {
    const normalize = path.replace(/\\/g,'/');

    if (normalize === 'C:/site') {
        return ['components', 'action'];
    }
    if (normalize === 'C:/site/components') {
        return ['nav', 'btn'];
    }
    if (normalize === 'C:/site/action') {
        return ['firstAction.js', 'importantAction.js', 'createAction.js'];
    }
    if (normalize === 'C:/site/components/nav') {
        return ['nav.js', 'nav.css'];
    }
    if (normalize === 'C:/site/components/btn') {
        return ['btn.js', 'btn.css'];
    }
    return [];
});

export const readFileSync = jest.fn((uri: string) => {
    return mockFiles[uri] || '';
});

export const lstatSync = (uri: string): Partial<fs.Stats> => ({
    isDirectory: () => mockDirectory.includes(uri),
    isFile: () => !mockDirectory.includes(uri),
});

export const lstat = (uri: string, callback: (err?: Error, stats?: Partial<fs.Stats>) => void): void => {
    callback(undefined, lstatSync(uri));
};

export const statSync = lstatSync;

export const writeFile = jest.fn((path, content, option, callback) => callback());

export const unlink = jest.fn((path, callback) => callback());

export const rmdir = jest.fn((path, callback) => callback());

export const readFile = (uri: string, callback: (err?: Error, stats?: string) => void): void => {
    const data = mockFiles[uri];
    callback(data === undefined ? new Error('not exist'): undefined, data);
};

export const existsSync = jest.fn(() => true);
