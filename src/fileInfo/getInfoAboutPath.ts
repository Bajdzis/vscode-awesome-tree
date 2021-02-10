import { changeToUnixSlashes } from '../strings/changeToUnixSlashes';
import { getInfoWords, WordsInfo } from './getInfoWords';

export interface PathInfo {
    path: string;
    parts: string[];
    pathParts: WordsInfo[];
    isFile: boolean;
    extension: string;
}

export function getInfoAboutPath(path: string): PathInfo {
    const searchExtension = /(?<pathWithoutExtension>.*)\.(?<extension>[a-z0-9]*)$/;
    const result = searchExtension.exec(path);
    const pathWithoutExtension = result && result.groups && result.groups.pathWithoutExtension || path;
    const parts = changeToUnixSlashes(pathWithoutExtension).replace(/^\/|\/$/g,'').split('/');
    const pathParts = parts.map(part => getInfoWords(part));

    return {
        path,
        parts,
        pathParts,
        isFile: result !== null,
        extension: result && result.groups && result.groups.extension || ''
    };
}

