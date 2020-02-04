import * as fs from 'fs';

const mockFiles: { [key:string]: string } = {
    'C:/site/nav/nav.js': 'function NavComponent () {',
    'C:/site/nav/nav.css': '.nav { margin:5px; }',
    'C:/site/btn/btn.js': 'function BtnComponent () {',
    'C:/site/btn/btn.css': '.btn { margin:5px; }',
    'C:/site/action/firstAction.js': 'const first = new Action();',
    'C:/site/action/importantAction.js': 'const important = new Action();',
    'C:/site/action/createAction.js': ''
};

const mockDirectory = [
    'C:/site/nav', 'C:/site/btn', 'C:/site/new', 'C:/site/action'
];

export const readdirSync = jest.fn((path: string) => {
    if (path === 'C:/site') {
        return ['nav', 'btn'];
    }
    if (path === 'C:/site/action') {
        return ['firstAction.js', 'importantAction.js', 'createAction.js'];
    }
    if (path === 'C:/site/nav') {
        return ['nav.js', 'nav.css'];
    }
    if (path === 'C:/site/btn') {
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

export const writeFile = jest.fn();

export const readFile = (uri: string, callback: (err?: Error, stats?: string) => void): void => {
    const data = mockFiles[uri];
    callback(data === undefined ? new Error('not exist'): undefined, data);
};

export const existsSync = jest.fn(() => true);
