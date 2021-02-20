import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ChooseFilesApp } from './chooseFilesApp';

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<ChooseFilesApp />,rootElement);
