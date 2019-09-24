import * as fs from 'fs';

const mockFiles: { [key:string]: string } = {
    'C:/site/nav/nav.js': 'function NavComponent () {',
    'C:/site/nav/nav.css': '.nav { margin:5px; }',
    'C:/site/btn/btn.js': 'function BtnComponent () {',
    'C:/site/btn/btn.css': '.btn { margin:5px; }'
};

const mockDirectory = [
    'C:/site/nav', 'C:/site/btn', 'C:/site/new'
];

export const readdirSync = jest.fn((path: string) => {
    if (path === 'C:/site') {
        return ['nav', 'btn'];
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

export const statSync = lstatSync;

export const writeFile = jest.fn();

export const existsSync = jest.fn(() => true);
