import * as React from 'react';
import './DiffLine.css';

interface DiffLineProps{
    newLine: string;
    oldLine: string;
}

export const DiffLine: React.FC<DiffLineProps> = ({ newLine, oldLine }) => {

    if (newLine === oldLine) {
        return <pre  className="diffLine">{newLine}</pre>;
    }

    let start: number =0;
    for (start = 0; start < newLine.length; start++) {
        if(newLine[start] !== oldLine[start]) {
            break;
        }
    }

    let end: number =0;
    for (end = 0; end < newLine.length; end++) {
        if(newLine[newLine.length - end] !== oldLine[ oldLine.length -end]) {
            break;
        }
    }

    return <pre className="diffLine">{newLine.substring(0, start)}
        <span className="diffLine__old">{oldLine.substring(start, oldLine.length - end + 1)}</span>
        <span className="diffLine__new">{newLine.substring(start, newLine.length - end + 1)}</span>
        {newLine.substring(newLine.length - end + 1, newLine.length)}
    </pre>;
};
