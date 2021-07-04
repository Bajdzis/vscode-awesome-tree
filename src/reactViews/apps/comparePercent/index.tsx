import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ComparePercentApp } from './comparePercent';

const rootElement = document.getElementById('root');

rootElement && ReactDom.render(<ComparePercentApp />, rootElement);
