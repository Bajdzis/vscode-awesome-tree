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

    const begin = newLine.substring(0, start);
    const compareOld = oldLine.substring(start, oldLine.length - end + 1);
    const compareNew = newLine.substring(start, newLine.length - end + 1);
    const last = newLine.substring(newLine.length - end + 1, newLine.length);

    return <pre className="diffLine">{begin}
        {compareOld && <span className="diffLine__old">{compareOld}</span>}
        {compareNew && <span className="diffLine__new">{compareNew}</span>}
        {last}
    </pre>;
};
