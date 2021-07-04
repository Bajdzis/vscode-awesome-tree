import { PathInfo } from 'awesome-tree-engine';
import * as React from 'react';
import './PercentLine.css';

interface PercentLineProps{
    similarFiles: number;
    line: {
        content: string;
        paths: PathInfo[];
    };
}

function getColor (percent: number, similarFiles: number, filesWithLine: number) {
    if(filesWithLine === 1 && similarFiles !== 1) {
        return 'fatal';
    }

    if(percent >= 85) {
        return 'success';
    }

    if(percent >= 40) {
        return 'warn';
    }

    return 'fatal';
}

export const PercentLine: React.FC<PercentLineProps> = ({ similarFiles, line }) => {
    const {content, paths} = line;
    const percent = (paths.length / similarFiles) * 100;

    return <div className={`percentLine percentLine--${getColor(percent, similarFiles, paths.length )}`} key={content}>
        <div className="percentLine__percent"> {percent.toFixed(1)} % </div>
        <pre className="percentLine__content">
            {content}
        </pre>

    </div>;
};
