import * as React from 'react';
import * as ReactDom from 'react-dom';
import { NewTemplateApp } from './NewTemplateApp';

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<NewTemplateApp />,rootElement);
