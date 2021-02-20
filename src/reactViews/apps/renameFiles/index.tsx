import * as React from 'react';
import * as ReactDom from 'react-dom';
import { RenameFilesApp } from './renameFilesApp';

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<RenameFilesApp />,rootElement);
